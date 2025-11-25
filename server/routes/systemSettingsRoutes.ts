import { Router } from 'express';
import { settingsService, SYSTEM_SETTING_DEFINITIONS, SettingScope, SettingCategory } from '../services/settingsService';
import { db } from '../db';
import { systemSettings } from '@shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { createAuditLog } from '../utils/routeHelpers';
import { z } from 'zod';

const router = Router();

const setSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  scopeType: z.enum(['GLOBAL', 'BRANCH', 'ORGANIZATION']).default('GLOBAL'),
  scopeId: z.string().optional(),
});

const bulkSetSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1),
    value: z.string(),
    scopeType: z.enum(['GLOBAL', 'BRANCH', 'ORGANIZATION']).default('GLOBAL'),
    scopeId: z.string().optional(),
  })),
});

router.get('/', async (req, res) => {
  try {
    const { scopeType, scopeId, category } = req.query;
    
    let settings;
    if (category) {
      settings = await settingsService.getSettingsByCategory(
        category as SettingCategory,
        (scopeType as SettingScope) || 'GLOBAL',
        scopeId as string
      );
    } else {
      settings = await settingsService.getAllSettings(
        scopeType as SettingScope,
        scopeId as string
      );
    }
    
    res.json(settings);
  } catch (error) {
    console.error('[SystemSettings] Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get('/definitions', async (req, res) => {
  try {
    const { category } = req.query;
    
    if (category) {
      const definitions = settingsService.getDefinitionsByCategory(category as SettingCategory);
      res.json(definitions);
    } else {
      res.json(SYSTEM_SETTING_DEFINITIONS);
    }
  } catch (error) {
    console.error('[SystemSettings] Error fetching definitions:', error);
    res.status(500).json({ error: 'Failed to fetch setting definitions' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = [...new Set(SYSTEM_SETTING_DEFINITIONS.map(d => d.category))];
    const categoriesWithLabels = categories.map(cat => ({
      key: cat,
      labelEn: getCategoryLabel(cat, 'en'),
      labelAr: getCategoryLabel(cat, 'ar'),
    }));
    res.json(categoriesWithLabels);
  } catch (error) {
    console.error('[SystemSettings] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const settings = await settingsService.getBranchSettings(branchId);
    res.json(settings);
  } catch (error) {
    console.error('[SystemSettings] Error fetching branch settings:', error);
    res.status(500).json({ error: 'Failed to fetch branch settings' });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { scopeType, scopeId } = req.query;
    
    const value = await settingsService.getSetting(
      key,
      (scopeType as SettingScope) || 'GLOBAL',
      scopeId as string
    );
    
    if (value === null) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    const definition = SYSTEM_SETTING_DEFINITIONS.find(d => d.key === key);
    
    res.json({
      key,
      value,
      definition,
    });
  } catch (error) {
    console.error('[SystemSettings] Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || !['super_admin', 'admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validation = setSettingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
    }

    const { key, value, scopeType, scopeId } = validation.data;

    const oldSetting = await db
      .select()
      .from(systemSettings)
      .where(
        and(
          eq(systemSettings.key, key),
          eq(systemSettings.scopeType, scopeType),
          scopeId ? eq(systemSettings.scopeId, scopeId) : isNull(systemSettings.scopeId)
        )
      )
      .limit(1);

    const setting = await settingsService.setSetting(
      key,
      value,
      scopeType,
      scopeId,
      user.id
    );

    await createAuditLog(
      user.id,
      oldSetting.length > 0 ? 'system_setting_updated' : 'system_setting_created',
      undefined,
      req,
      `${oldSetting.length > 0 ? 'Updated' : 'Created'} setting: ${key} = ${value}`
    );

    res.json(setting);
  } catch (error: any) {
    console.error('[SystemSettings] Error setting value:', error);
    res.status(400).json({ error: error.message || 'Failed to set setting' });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || !['super_admin', 'admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validation = bulkSetSettingsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
    }

    const results = [];
    const errors = [];

    for (const setting of validation.data.settings) {
      try {
        const result = await settingsService.setSetting(
          setting.key,
          setting.value,
          setting.scopeType,
          setting.scopeId,
          user.id
        );
        results.push(result);
      } catch (error: any) {
        errors.push({ key: setting.key, error: error.message });
      }
    }

    await createAuditLog(
      user.id,
      'system_settings_bulk_updated',
      undefined,
      req,
      `Bulk updated ${results.length} settings${errors.length > 0 ? `, ${errors.length} errors` : ''}`
    );

    res.json({ 
      success: true, 
      updated: results.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('[SystemSettings] Error in bulk update:', error);
    res.status(400).json({ error: error.message || 'Failed to update settings' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.id, id))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const definition = SYSTEM_SETTING_DEFINITIONS.find(d => d.key === existing[0].key);
    if (definition?.isRequired) {
      return res.status(400).json({ error: 'Cannot delete required setting' });
    }

    const deleted = await settingsService.deleteSetting(id);

    if (deleted) {
      await createAuditLog(
        user.id,
        'system_setting_deleted',
        undefined,
        req,
        `Deleted setting: ${existing[0].key}`
      );
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    console.error('[SystemSettings] Error deleting setting:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await settingsService.seedDefaultSettings();
    
    await createAuditLog(
      user.id,
      'system_settings_seeded',
      undefined,
      req,
      `Seeded ${SYSTEM_SETTING_DEFINITIONS.length} default settings`
    );

    res.json({ 
      success: true, 
      message: 'Default settings seeded successfully',
      count: SYSTEM_SETTING_DEFINITIONS.length
    });
  } catch (error) {
    console.error('[SystemSettings] Error seeding settings:', error);
    res.status(500).json({ error: 'Failed to seed settings' });
  }
});

function getCategoryLabel(category: string, lang: 'en' | 'ar'): string {
  const labels: Record<string, { en: string; ar: string }> = {
    general: { en: 'General', ar: 'عام' },
    contract: { en: 'Contract', ar: 'العقود' },
    vehicle: { en: 'Vehicle', ar: 'المركبات' },
    pricing: { en: 'Pricing', ar: 'التسعير' },
    notification: { en: 'Notifications', ar: 'الإشعارات' },
    security: { en: 'Security', ar: 'الأمان' },
    inspection: { en: 'Inspection', ar: 'الفحص' },
    deposit: { en: 'Deposit', ar: 'التأمين' },
    driver: { en: 'Driver Service', ar: 'خدمة السائق' },
    otp: { en: 'OTP Verification', ar: 'التحقق بالرمز' },
    delivery: { en: 'Delivery', ar: 'التوصيل' },
  };
  return labels[category]?.[lang] || category;
}

export default router;
