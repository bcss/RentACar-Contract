import { db } from '../db';
import { systemSettings, SystemSettings, InsertSystemSettings } from '@shared/schema';
import { eq, and, or, isNull } from 'drizzle-orm';

export type SettingScope = 'GLOBAL' | 'BRANCH' | 'ORGANIZATION';
export type SettingValueType = 'string' | 'number' | 'boolean' | 'json' | 'enum';
export type SettingCategory = 
  | 'general' 
  | 'contract' 
  | 'vehicle' 
  | 'pricing' 
  | 'notification' 
  | 'security' 
  | 'inspection'
  | 'deposit'
  | 'driver'
  | 'otp'
  | 'delivery';

export interface SettingDefinition {
  key: string;
  defaultValue: string;
  valueType: SettingValueType;
  category: SettingCategory;
  labelEn: string;
  labelAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  displayOrder: number;
}

export const SYSTEM_SETTING_DEFINITIONS: SettingDefinition[] = [
  // General Settings
  {
    key: 'default_language',
    defaultValue: 'en',
    valueType: 'enum',
    category: 'general',
    labelEn: 'Default Language',
    labelAr: 'اللغة الافتراضية',
    descriptionEn: 'Default language for the system',
    descriptionAr: 'اللغة الافتراضية للنظام',
    validationRules: { options: ['en', 'ar'] },
    displayOrder: 1,
  },
  {
    key: 'timezone',
    defaultValue: 'Asia/Dubai',
    valueType: 'string',
    category: 'general',
    labelEn: 'Timezone',
    labelAr: 'المنطقة الزمنية',
    descriptionEn: 'System timezone for date/time operations',
    descriptionAr: 'المنطقة الزمنية للنظام',
    displayOrder: 2,
  },
  {
    key: 'date_format',
    defaultValue: 'DD/MM/YYYY',
    valueType: 'string',
    category: 'general',
    labelEn: 'Date Format',
    labelAr: 'تنسيق التاريخ',
    displayOrder: 3,
  },
  {
    key: 'currency',
    defaultValue: 'AED',
    valueType: 'string',
    category: 'general',
    labelEn: 'Currency',
    labelAr: 'العملة',
    displayOrder: 4,
  },

  // Contract Settings
  {
    key: 'contract_auto_number_prefix',
    defaultValue: 'CNT',
    valueType: 'string',
    category: 'contract',
    labelEn: 'Contract Number Prefix',
    labelAr: 'بادئة رقم العقد',
    displayOrder: 10,
  },
  {
    key: 'contract_requires_pickup_inspection',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'contract',
    labelEn: 'Require Pickup Inspection',
    labelAr: 'يتطلب فحص عند الاستلام',
    descriptionEn: 'Mandatory inspection before contract activation',
    descriptionAr: 'فحص إلزامي قبل تفعيل العقد',
    displayOrder: 11,
  },
  {
    key: 'contract_requires_return_inspection',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'contract',
    labelEn: 'Require Return Inspection',
    labelAr: 'يتطلب فحص عند الإرجاع',
    descriptionEn: 'Mandatory inspection before contract closure',
    descriptionAr: 'فحص إلزامي قبل إغلاق العقد',
    displayOrder: 12,
  },
  {
    key: 'contract_requires_deposit_before_activation',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'contract',
    labelEn: 'Require Deposit Before Activation',
    labelAr: 'يتطلب التأمين قبل التفعيل',
    descriptionEn: 'Security deposit must be paid before contract activation',
    descriptionAr: 'يجب دفع التأمين قبل تفعيل العقد',
    displayOrder: 12.5,
  },
  {
    key: 'contract_allow_early_return',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'contract',
    labelEn: 'Allow Early Return',
    labelAr: 'السماح بالإرجاع المبكر',
    displayOrder: 13,
  },
  {
    key: 'contract_max_extension_days',
    defaultValue: '90',
    valueType: 'number',
    category: 'contract',
    labelEn: 'Maximum Extension Days',
    labelAr: 'أقصى أيام للتمديد',
    validationRules: { min: 1, max: 365 },
    displayOrder: 14,
  },
  {
    key: 'contract_grace_period_hours',
    defaultValue: '2',
    valueType: 'number',
    category: 'contract',
    labelEn: 'Grace Period (Hours)',
    labelAr: 'فترة السماح (ساعات)',
    descriptionEn: 'Hours before late return fee applies',
    descriptionAr: 'الساعات قبل تطبيق رسوم التأخير',
    validationRules: { min: 0, max: 24 },
    displayOrder: 15,
  },

  // OTP Settings
  {
    key: 'otp_enabled',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'otp',
    labelEn: 'Enable OTP Verification',
    labelAr: 'تفعيل التحقق بالرمز',
    descriptionEn: 'Require OTP for contract signing',
    descriptionAr: 'يتطلب رمز التحقق لتوقيع العقد',
    displayOrder: 20,
  },
  {
    key: 'otp_expiry_minutes',
    defaultValue: '5',
    valueType: 'number',
    category: 'otp',
    labelEn: 'OTP Expiry (Minutes)',
    labelAr: 'انتهاء صلاحية الرمز (دقائق)',
    validationRules: { min: 1, max: 30 },
    displayOrder: 21,
  },
  {
    key: 'otp_max_attempts',
    defaultValue: '3',
    valueType: 'number',
    category: 'otp',
    labelEn: 'Maximum OTP Attempts',
    labelAr: 'أقصى محاولات للرمز',
    validationRules: { min: 1, max: 10 },
    displayOrder: 22,
  },
  {
    key: 'otp_resend_cooldown_seconds',
    defaultValue: '60',
    valueType: 'number',
    category: 'otp',
    labelEn: 'Resend Cooldown (Seconds)',
    labelAr: 'فترة انتظار إعادة الإرسال (ثواني)',
    validationRules: { min: 30, max: 300 },
    displayOrder: 23,
  },
  {
    key: 'otp_delivery_channel',
    defaultValue: 'both',
    valueType: 'enum',
    category: 'otp',
    labelEn: 'OTP Delivery Channel',
    labelAr: 'قناة إرسال الرمز',
    validationRules: { options: ['sms', 'email', 'both'] },
    displayOrder: 24,
  },

  // Pricing Settings
  {
    key: 'vat_percentage',
    defaultValue: '5',
    valueType: 'number',
    category: 'pricing',
    labelEn: 'VAT Percentage',
    labelAr: 'نسبة ضريبة القيمة المضافة',
    validationRules: { min: 0, max: 100 },
    displayOrder: 30,
  },
  {
    key: 'default_daily_rate',
    defaultValue: '150',
    valueType: 'number',
    category: 'pricing',
    labelEn: 'Default Daily Rate',
    labelAr: 'السعر اليومي الافتراضي',
    displayOrder: 31,
  },
  {
    key: 'default_weekly_rate',
    defaultValue: '900',
    valueType: 'number',
    category: 'pricing',
    labelEn: 'Default Weekly Rate',
    labelAr: 'السعر الأسبوعي الافتراضي',
    displayOrder: 32,
  },
  {
    key: 'default_monthly_rate',
    defaultValue: '3000',
    valueType: 'number',
    category: 'pricing',
    labelEn: 'Default Monthly Rate',
    labelAr: 'السعر الشهري الافتراضي',
    displayOrder: 33,
  },
  {
    key: 'default_extra_km_rate',
    defaultValue: '1.5',
    valueType: 'number',
    category: 'pricing',
    labelEn: 'Extra KM Rate',
    labelAr: 'سعر الكيلومتر الإضافي',
    displayOrder: 34,
  },
  {
    key: 'late_return_hourly_rate',
    defaultValue: '25',
    valueType: 'number',
    category: 'pricing',
    labelEn: 'Late Return Hourly Rate',
    labelAr: 'سعر الساعة للتأخير',
    displayOrder: 35,
  },

  // Deposit Settings
  {
    key: 'deposit_required',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'deposit',
    labelEn: 'Deposit Required',
    labelAr: 'يتطلب تأمين',
    displayOrder: 40,
  },
  {
    key: 'default_deposit_amount',
    defaultValue: '1500',
    valueType: 'number',
    category: 'deposit',
    labelEn: 'Default Deposit Amount',
    labelAr: 'مبلغ التأمين الافتراضي',
    displayOrder: 41,
  },
  {
    key: 'deposit_hold_days',
    defaultValue: '15',
    valueType: 'number',
    category: 'deposit',
    labelEn: 'Deposit Hold Days',
    labelAr: 'أيام احتجاز التأمين',
    descriptionEn: 'Days to hold deposit after contract closure for fine clearance',
    descriptionAr: 'أيام احتجاز التأمين بعد إغلاق العقد لتسوية المخالفات',
    validationRules: { min: 0, max: 60 },
    displayOrder: 42,
  },
  {
    key: 'deposit_auto_refund',
    defaultValue: 'false',
    valueType: 'boolean',
    category: 'deposit',
    labelEn: 'Auto Refund Deposit',
    labelAr: 'استرداد التأمين تلقائياً',
    displayOrder: 43,
  },

  // Inspection Settings
  {
    key: 'inspection_photo_required',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'inspection',
    labelEn: 'Photos Required for Inspection',
    labelAr: 'الصور مطلوبة للفحص',
    displayOrder: 50,
  },
  {
    key: 'inspection_min_photos',
    defaultValue: '4',
    valueType: 'number',
    category: 'inspection',
    labelEn: 'Minimum Photos Required',
    labelAr: 'الحد الأدنى للصور المطلوبة',
    validationRules: { min: 1, max: 20 },
    displayOrder: 51,
  },
  {
    key: 'inspection_damage_categories',
    defaultValue: '["scratch","dent","crack","missing_part","other"]',
    valueType: 'json',
    category: 'inspection',
    labelEn: 'Damage Categories',
    labelAr: 'فئات الأضرار',
    displayOrder: 52,
  },

  // Driver Service Settings
  {
    key: 'driver_service_enabled',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'driver',
    labelEn: 'Enable Driver Service',
    labelAr: 'تفعيل خدمة السائق',
    displayOrder: 60,
  },
  {
    key: 'driver_daily_rate',
    defaultValue: '300',
    valueType: 'number',
    category: 'driver',
    labelEn: 'Driver Daily Rate',
    labelAr: 'السعر اليومي للسائق',
    displayOrder: 61,
  },
  {
    key: 'driver_hourly_rate',
    defaultValue: '50',
    valueType: 'number',
    category: 'driver',
    labelEn: 'Driver Hourly Rate',
    labelAr: 'سعر الساعة للسائق',
    displayOrder: 62,
  },
  {
    key: 'driver_night_surcharge_multiplier',
    defaultValue: '1.5',
    valueType: 'number',
    category: 'driver',
    labelEn: 'Night Surcharge Multiplier',
    labelAr: 'مضاعف الليل',
    validationRules: { min: 1, max: 3 },
    displayOrder: 63,
  },
  {
    key: 'driver_weekend_surcharge_multiplier',
    defaultValue: '1.3',
    valueType: 'number',
    category: 'driver',
    labelEn: 'Weekend Surcharge Multiplier',
    labelAr: 'مضاعف عطلة نهاية الأسبوع',
    validationRules: { min: 1, max: 3 },
    displayOrder: 64,
  },

  // Delivery Settings
  {
    key: 'delivery_service_enabled',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'delivery',
    labelEn: 'Enable Delivery Service',
    labelAr: 'تفعيل خدمة التوصيل',
    displayOrder: 70,
  },
  {
    key: 'default_delivery_fee',
    defaultValue: '100',
    valueType: 'number',
    category: 'delivery',
    labelEn: 'Default Delivery Fee',
    labelAr: 'رسوم التوصيل الافتراضية',
    displayOrder: 71,
  },
  {
    key: 'default_pickup_fee',
    defaultValue: '100',
    valueType: 'number',
    category: 'delivery',
    labelEn: 'Default Pickup Fee',
    labelAr: 'رسوم الاستلام الافتراضية',
    displayOrder: 72,
  },
  {
    key: 'delivery_confirmation_required',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'delivery',
    labelEn: 'Require Delivery Confirmation',
    labelAr: 'يتطلب تأكيد التسليم',
    descriptionEn: 'Operator must confirm vehicle delivery before activation',
    descriptionAr: 'يجب على المشغل تأكيد تسليم المركبة قبل التفعيل',
    displayOrder: 73,
  },

  // Notification Settings
  {
    key: 'notifications_enabled',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'notification',
    labelEn: 'Enable Notifications',
    labelAr: 'تفعيل الإشعارات',
    displayOrder: 80,
  },
  {
    key: 'contract_expiry_reminder_days',
    defaultValue: '3',
    valueType: 'number',
    category: 'notification',
    labelEn: 'Contract Expiry Reminder Days',
    labelAr: 'أيام تذكير انتهاء العقد',
    validationRules: { min: 1, max: 30 },
    displayOrder: 81,
  },
  {
    key: 'payment_due_reminder_days',
    defaultValue: '2',
    valueType: 'number',
    category: 'notification',
    labelEn: 'Payment Due Reminder Days',
    labelAr: 'أيام تذكير استحقاق الدفع',
    validationRules: { min: 1, max: 14 },
    displayOrder: 82,
  },
  {
    key: 'document_expiry_warning_days',
    defaultValue: '30',
    valueType: 'number',
    category: 'notification',
    labelEn: 'Document Expiry Warning Days',
    labelAr: 'أيام تحذير انتهاء المستندات',
    validationRules: { min: 7, max: 90 },
    displayOrder: 83,
  },

  // Security Settings
  {
    key: 'session_timeout_minutes',
    defaultValue: '60',
    valueType: 'number',
    category: 'security',
    labelEn: 'Session Timeout (Minutes)',
    labelAr: 'مهلة الجلسة (دقائق)',
    validationRules: { min: 15, max: 480 },
    displayOrder: 90,
  },
  {
    key: 'max_login_attempts',
    defaultValue: '5',
    valueType: 'number',
    category: 'security',
    labelEn: 'Maximum Login Attempts',
    labelAr: 'أقصى محاولات تسجيل الدخول',
    validationRules: { min: 3, max: 10 },
    displayOrder: 91,
  },
  {
    key: 'password_min_length',
    defaultValue: '8',
    valueType: 'number',
    category: 'security',
    labelEn: 'Minimum Password Length',
    labelAr: 'الحد الأدنى لطول كلمة المرور',
    validationRules: { min: 6, max: 20 },
    displayOrder: 92,
  },
  {
    key: 'require_password_special_chars',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'security',
    labelEn: 'Require Special Characters in Password',
    labelAr: 'تتطلب أحرف خاصة في كلمة المرور',
    displayOrder: 93,
  },

  // Vehicle Settings
  {
    key: 'vehicle_mileage_tracking',
    defaultValue: 'true',
    valueType: 'boolean',
    category: 'vehicle',
    labelEn: 'Track Vehicle Mileage',
    labelAr: 'تتبع المسافة المقطوعة',
    displayOrder: 100,
  },
  {
    key: 'vehicle_daily_km_limit',
    defaultValue: '300',
    valueType: 'number',
    category: 'vehicle',
    labelEn: 'Daily KM Limit',
    labelAr: 'الحد اليومي للكيلومترات',
    displayOrder: 101,
  },
  {
    key: 'vehicle_monthly_km_limit',
    defaultValue: '5000',
    valueType: 'number',
    category: 'vehicle',
    labelEn: 'Monthly KM Limit',
    labelAr: 'الحد الشهري للكيلومترات',
    displayOrder: 102,
  },
  {
    key: 'vehicle_fuel_policy',
    defaultValue: 'same_to_same',
    valueType: 'enum',
    category: 'vehicle',
    labelEn: 'Fuel Policy',
    labelAr: 'سياسة الوقود',
    validationRules: { options: ['same_to_same', 'full_to_full', 'prepaid'] },
    displayOrder: 103,
  },
];

class SettingsService {
  /**
   * Get a setting value with scope-aware fallback:
   * 1. Try to find BRANCH/ORGANIZATION setting if scopeId provided
   * 2. Fall back to GLOBAL setting
   * 3. Fall back to default value from SYSTEM_SETTING_DEFINITIONS
   * 
   * Note: If scopeType is BRANCH but scopeId is missing/empty, 
   * we fall back directly to GLOBAL to avoid bypass issues
   */
  async getSetting(key: string, scopeType: SettingScope = 'GLOBAL', scopeId?: string): Promise<string | null> {
    try {
      const conditions = [eq(systemSettings.key, key)];
      
      // If requesting BRANCH scope without a valid scopeId, fall back to GLOBAL
      const effectiveScopeType = (scopeType !== 'GLOBAL' && !scopeId) ? 'GLOBAL' : scopeType;
      
      if (effectiveScopeType === 'GLOBAL') {
        conditions.push(eq(systemSettings.scopeType, 'GLOBAL'));
      } else {
        // Query both the scoped setting and GLOBAL fallback
        conditions.push(
          or(
            and(eq(systemSettings.scopeType, effectiveScopeType), eq(systemSettings.scopeId, scopeId!)),
            eq(systemSettings.scopeType, 'GLOBAL')
          )!
        );
      }

      const results = await db
        .select()
        .from(systemSettings)
        .where(and(...conditions))
        .orderBy(systemSettings.scopeType);

      // No settings found - return default from definitions
      if (results.length === 0) {
        const definition = SYSTEM_SETTING_DEFINITIONS.find(d => d.key === key);
        return definition?.defaultValue || null;
      }

      // Prefer scoped setting over GLOBAL if both exist
      const scopedSetting = results.find(r => r.scopeType !== 'GLOBAL');
      return scopedSetting?.value || results[0]?.value || null;
    } catch (error) {
      console.error(`[SettingsService] Error getting setting ${key}:`, error);
      // On error, return default from definitions rather than null to avoid bypass
      const definition = SYSTEM_SETTING_DEFINITIONS.find(d => d.key === key);
      return definition?.defaultValue || null;
    }
  }

  async getSettingAsNumber(key: string, scopeType: SettingScope = 'GLOBAL', scopeId?: string): Promise<number> {
    const value = await this.getSetting(key, scopeType, scopeId);
    return value ? parseFloat(value) : 0;
  }

  async getSettingAsBoolean(key: string, scopeType: SettingScope = 'GLOBAL', scopeId?: string): Promise<boolean> {
    const value = await this.getSetting(key, scopeType, scopeId);
    return value === 'true';
  }

  async getSettingAsJson<T>(key: string, scopeType: SettingScope = 'GLOBAL', scopeId?: string): Promise<T | null> {
    const value = await this.getSetting(key, scopeType, scopeId);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setSetting(
    key: string,
    value: string,
    scopeType: SettingScope = 'GLOBAL',
    scopeId?: string,
    updatedBy?: string
  ): Promise<SystemSettings> {
    try {
      const definition = SYSTEM_SETTING_DEFINITIONS.find(d => d.key === key);
      
      if (definition?.isReadOnly) {
        throw new Error(`Setting ${key} is read-only`);
      }

      if (definition?.validationRules) {
        const { min, max, options } = definition.validationRules;
        if (definition.valueType === 'number') {
          const numValue = parseFloat(value);
          if (min !== undefined && numValue < min) {
            throw new Error(`Value must be at least ${min}`);
          }
          if (max !== undefined && numValue > max) {
            throw new Error(`Value must be at most ${max}`);
          }
        }
        if (options && !options.includes(value)) {
          throw new Error(`Value must be one of: ${options.join(', ')}`);
        }
      }

      const existing = await db
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

      if (existing.length > 0) {
        const [updated] = await db
          .update(systemSettings)
          .set({
            value,
            updatedBy,
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.id, existing[0].id))
          .returning();
        return updated;
      } else {
        const [created] = await db
          .insert(systemSettings)
          .values({
            key,
            value,
            scopeType,
            scopeId,
            valueType: definition?.valueType || 'string',
            category: definition?.category || 'general',
            labelEn: definition?.labelEn,
            labelAr: definition?.labelAr,
            descriptionEn: definition?.descriptionEn,
            descriptionAr: definition?.descriptionAr,
            isRequired: definition?.isRequired || false,
            isReadOnly: definition?.isReadOnly || false,
            validationRules: definition?.validationRules,
            defaultValue: definition?.defaultValue,
            displayOrder: definition?.displayOrder || 0,
            updatedBy,
          })
          .returning();
        return created;
      }
    } catch (error) {
      console.error(`[SettingsService] Error setting ${key}:`, error);
      throw error;
    }
  }

  async getAllSettings(scopeType?: SettingScope, scopeId?: string): Promise<SystemSettings[]> {
    try {
      const conditions = [];
      
      if (scopeType) {
        conditions.push(eq(systemSettings.scopeType, scopeType));
        if (scopeId) {
          conditions.push(eq(systemSettings.scopeId, scopeId));
        }
      }

      return await db
        .select()
        .from(systemSettings)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(systemSettings.category, systemSettings.displayOrder);
    } catch (error) {
      console.error('[SettingsService] Error getting all settings:', error);
      throw error;
    }
  }

  async getSettingsByCategory(
    category: SettingCategory,
    scopeType: SettingScope = 'GLOBAL',
    scopeId?: string
  ): Promise<SystemSettings[]> {
    try {
      const conditions = [eq(systemSettings.category, category)];
      
      if (scopeType === 'GLOBAL') {
        conditions.push(eq(systemSettings.scopeType, 'GLOBAL'));
      } else {
        conditions.push(
          or(
            and(eq(systemSettings.scopeType, scopeType), eq(systemSettings.scopeId, scopeId || '')),
            eq(systemSettings.scopeType, 'GLOBAL')
          )!
        );
      }

      return await db
        .select()
        .from(systemSettings)
        .where(and(...conditions))
        .orderBy(systemSettings.displayOrder);
    } catch (error) {
      console.error(`[SettingsService] Error getting settings for category ${category}:`, error);
      throw error;
    }
  }

  async seedDefaultSettings(): Promise<void> {
    try {
      console.log('[SettingsService] Seeding default settings...');
      
      for (const definition of SYSTEM_SETTING_DEFINITIONS) {
        const existing = await db
          .select()
          .from(systemSettings)
          .where(
            and(
              eq(systemSettings.key, definition.key),
              eq(systemSettings.scopeType, 'GLOBAL'),
              isNull(systemSettings.scopeId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(systemSettings).values({
            key: definition.key,
            value: definition.defaultValue,
            scopeType: 'GLOBAL',
            valueType: definition.valueType,
            category: definition.category,
            labelEn: definition.labelEn,
            labelAr: definition.labelAr,
            descriptionEn: definition.descriptionEn,
            descriptionAr: definition.descriptionAr,
            isRequired: definition.isRequired || false,
            isReadOnly: definition.isReadOnly || false,
            validationRules: definition.validationRules,
            defaultValue: definition.defaultValue,
            displayOrder: definition.displayOrder,
          });
        }
      }
      
      console.log(`[SettingsService] ✓ ${SYSTEM_SETTING_DEFINITIONS.length} default settings seeded`);
    } catch (error) {
      console.error('[SettingsService] Error seeding default settings:', error);
      throw error;
    }
  }

  async deleteSetting(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(systemSettings)
        .where(eq(systemSettings.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(`[SettingsService] Error deleting setting ${id}:`, error);
      throw error;
    }
  }

  async getBranchSettings(branchId: string): Promise<Record<string, string>> {
    const allSettings = await this.getAllSettings();
    const branchOverrides = await db
      .select()
      .from(systemSettings)
      .where(
        and(
          eq(systemSettings.scopeType, 'BRANCH'),
          eq(systemSettings.scopeId, branchId)
        )
      );

    const settingsMap: Record<string, string> = {};
    
    for (const setting of allSettings) {
      if (setting.scopeType === 'GLOBAL') {
        settingsMap[setting.key] = setting.value || setting.defaultValue || '';
      }
    }

    for (const override of branchOverrides) {
      settingsMap[override.key] = override.value || '';
    }

    return settingsMap;
  }

  getDefinitions(): SettingDefinition[] {
    return SYSTEM_SETTING_DEFINITIONS;
  }

  getDefinitionsByCategory(category: SettingCategory): SettingDefinition[] {
    return SYSTEM_SETTING_DEFINITIONS.filter(d => d.category === category);
  }
}

export const settingsService = new SettingsService();
