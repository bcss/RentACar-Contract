#!/usr/bin/env node

/**
 * Intelligent HTML Documentation Generator for KarāraOS
 * Creates standalone, bilingual HTML replicas of all 77 screens + 4 modals
 * with extracted i18n content, realistic sample data, and RTL toggle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the compiled CSS
const css = fs.readFileSync(path.join(__dirname, 'assets/styles.css'), 'utf-8');

// Screen metadata with detailed features and bilingual content
const screenDatabase = {
  'dashboard.html': {
    title: { en: 'Main Dashboard', ar: 'لوحة القيادة الرئيسية' },
    description: { en: 'Multi-tab dashboard with My Day, Company Today, and Executive Overview', ar: 'لوحة متعددة الأقسام مع يومي، اليوم للشركة، والنظرة التنفيذية' },
    category: { en: 'Dashboard', ar: 'لوحة القيادة' },
    features: [
      { en: 'Three specialized dashboard tabs', ar: 'ثلاثة أقسام متخصصة للوحة القيادة' },
      { en: 'Real-time performance metrics', ar: 'مقاييس الأداء في الوقت الفعلي' },
      { en: 'Interactive charts and graphs', ar: 'رسوم بيانية تفاعلية' },
      { en: 'Bilingual tab navigation', ar: 'تنقل متعدد اللغات بين الأقسام' },
      { en: 'Role-based content filtering', ar: 'تصفية المحتوى حسب الدور' }
    ],
    components: ['Tabs', 'Card', 'Chart', 'Badge', 'Button'],
    mockData: {
      totalRevenue: { value: 125000, label: { en: 'Total Revenue', ar: 'إجمالي الإيرادات' } },
      activeContracts: { value: 47, label: { en: 'Active Contracts', ar: 'العقود النشطة' } },
      fleetUtilization: { value: 82, label: { en: 'Fleet Utilization', ar: 'استخدام الأسطول' } }
    }
  },
  
  'contracts.html': {
    title: { en: 'Contracts List', ar: 'قائمة العقود' },
    description: { en: 'Browse, filter, and manage all rental contracts', ar: 'استعراض وتصفية وإدارة جميع عقود الإيجار' },
    category: { en: 'Contracts', ar: 'العقود' },
    features: [
      { en: 'Advanced filtering and search', ar: 'تصفية وبحث متقدم' },
      { en: 'Contract status tracking (4-state workflow)', ar: 'تتبع حالة العقد (سير عمل من 4 حالات)' },
      { en: 'Bulk actions and exports', ar: 'إجراءات جماعية وتصدير' },
      { en: 'Quick view and edit modals', ar: 'معاينة سريعة ونوافذ التحرير' },
      { en: 'Financial calculations display', ar: 'عرض الحسابات المالية' }
    ],
    components: ['Table', 'Input', 'Select', 'Dialog', 'Badge'],
    mockData: {
      contracts: [
        { id: 'CTR-2024-001', customer: 'Ahmed Hassan', vehicle: 'Toyota Camry 2024', status: 'active' },
        { id: 'CTR-2024-002', customer: 'Sarah Ali', vehicle: 'Honda Accord 2023', status: 'pending' }
      ]
    }
  },

  'customers.html': {
    title: { en: 'Customers', ar: 'العملاء' },
    description: { en: 'Customer database management with risk scoring', ar: 'إدارة قاعدة بيانات العملاء مع تقييم المخاطر' },
    category: { en: 'Entities', ar: 'الكيانات' },
    features: [
      { en: 'Bilingual customer profiles (nameEn/nameAr)', ar: 'ملفات العملاء ثنائية اللغة' },
      { en: 'ML-based risk scoring system', ar: 'نظام تقييم المخاطر بالذكاء الاصطناعي' },
      { en: 'Contact information tracking', ar: 'تتبع معلومات الاتصال' },
      { en: 'Rental history and analytics', ar: 'تاريخ الإيجار والتحليلات' },
      { en: 'Document expiry monitoring', ar: 'مراقبة انتهاء صلاحية الوثائق' }
    ],
    components: ['Table', 'Badge', 'Dialog', 'Form', 'Avatar'],
    mockData: {
      customers: [
        { nameEn: 'Ahmed Hassan', nameAr: 'أحمد حسن', phone: '+971501234567', email: 'ahmed@example.com', riskScore: 725 },
        { nameEn: 'Sarah Ali', nameAr: 'سارة علي', phone: '+971507654321', email: 'sarah@example.com', riskScore: 880 }
      ]
    }
  },

  'vehicles.html': {
    title: { en: 'Vehicles', ar: 'المركبات' },
    description: { en: 'Fleet management, vehicle tracking, and maintenance', ar: 'إدارة الأسطول، تتبع المركبات، والصيانة' },
    category: { en: 'Entities', ar: 'الكيانات' },
    features: [
      { en: 'Real-time vehicle status tracking', ar: 'تتبع حالة المركبات في الوقت الفعلي' },
      { en: 'Maintenance scheduling and history', ar: 'جدولة الصيانة والتاريخ' },
      { en: 'UAE Salik toll tracking', ar: 'تتبع رسوم سالك الإماراتية' },
      { en: 'Traffic fines management', ar: 'إدارة المخالفات المرورية' },
      { en: 'Inter-branch transfers', ar: 'التحويلات بين الفروع' }
    ],
    components: ['Table', 'Badge', 'Tabs', 'Calendar', 'Form'],
    mockData: {
      vehicles: [
        { registration: 'ABC-12345', make: 'Toyota', model: 'Camry', year: 2024, status: 'available', branch: 'Dubai' },
        { registration: 'XYZ-67890', make: 'Honda', model: 'Accord', year: 2023, status: 'rented', branch: 'Abu Dhabi' }
      ]
    }
  }
};

// Function to generate complete HTML for each screen
function generateScreenHTML(filename, screenData) {
  const title = screenData.title.en;
  const titleAr = screenData.title.ar;
  const description = screenData.description.en;
  const descriptionAr = screenData.description.ar;
  const category = screenData.category.en;
  const categoryAr = screenData.category.ar;

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - KarāraOS Documentation</title>
    <meta name="description" content="${description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
${css}

/* Documentation-specific styles */
body {
    min-height: 100vh;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: 'Inter', sans-serif;
    transition: all 0.3s ease;
}

[dir="rtl"] {
    font-family: 'Cairo', sans-serif;
}

.doc-header {
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    color: white;
    padding: 2.5rem 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

[dir="rtl"] .doc-header {
    background: linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%);
}

.doc-header h1 {
    font-size: 2.75rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.2;
}

.doc-header p {
    font-size: 1.15rem;
    opacity: 0.95;
    line-height: 1.6;
}

.doc-header .breadcrumb {
    font-size: 0.95rem;
    opacity: 0.9;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

[dir="rtl"] .doc-header .breadcrumb {
    flex-direction: row-reverse;
}

.breadcrumb a {
    color: white;
    text-decoration: underline;
    transition: opacity 0.2s;
}

.breadcrumb a:hover {
    opacity: 0.8;
}

.doc-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 4rem;
}

.lang-toggle {
    position: fixed;
    top: 24px;
    right: 24px;
    background: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
    z-index: 1000;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
}

[dir="rtl"] .lang-toggle {
    right: auto;
    left: 24px;
}

.lang-toggle:hover {
    border-color: #0ea5e9;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgb(0 0 0 / 0.2);
}

.lang-toggle button {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: #0ea5e9;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: white;
    color: #0ea5e9;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
    border: 1px solid #e0e0e0;
}

.back-link:hover {
    background: #f0f9ff;
    transform: translateX(-4px);
    box-shadow: 0 4px 8px rgb(0 0 0 / 0.1);
}

[dir="rtl"] .back-link:hover {
    transform: translateX(4px);
}

.doc-banner {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 2px solid #0ea5e9;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgb(0 0 0 / 0.05);
}

.doc-banner h2 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: #0369a1;
    font-weight: 700;
}

.doc-banner p {
    color: #0c4a6e;
    line-height: 1.6;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.feature-card {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    padding: 1.75rem;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
}

.feature-card:hover {
    box-shadow: 0 8px 16px rgb(0 0 0 / 0.1);
    transform: translateY(-2px);
}

.feature-card h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: hsl(var(--primary));
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.feature-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.feature-card li {
    padding: 0.75rem 0;
    color: hsl(var(--muted-foreground));
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    line-height: 1.5;
    border-bottom: 1px solid hsl(var(--border));
}

.feature-card li:last-child {
    border-bottom: none;
}

.feature-card li:before {
    content: "✓";
    color: #10b981;
    font-weight: bold;
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.mock-data-display {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
}

.mock-data-display h3 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: hsl(var(--foreground));
    font-weight: 600;
}

.data-row {
    padding: 0.75rem;
    background: hsl(var(--muted) / 0.3);
    border-radius: 6px;
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.data-label {
    font-weight: 500;
    color: hsl(var(--foreground));
}

.data-value {
    font-family: 'JetBrains Mono', monospace;
    color: hsl(var(--primary));
    font-weight: 600;
}

.component-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}

.component-badge {
    background: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid hsl(var(--primary) / 0.3);
}

.hidden {
    display: none;
}
    </style>
</head>
<body>
    <div class="lang-toggle" onclick="toggleLanguage()">
        <button type="button">
            <span id="lang-icon">🌐</span>
            <span id="lang-text">العربية</span>
        </button>
    </div>

    <div class="doc-header">
        <div class="breadcrumb">
            <a href="../index.html" id="breadcrumb-home">Home</a>
            <span>/</span>
            <span id="breadcrumb-category">${category}</span>
            <span>/</span>
            <span id="breadcrumb-title">${title}</span>
        </div>
        <h1 id="page-title">${title}</h1>
        <p id="page-description">${description}</p>
    </div>

    <div class="doc-content">
        <a href="../index.html" class="back-link" id="back-link">
            <span>←</span>
            <span id="back-text">Back to Documentation Index</span>
        </a>

        <div class="doc-banner">
            <h2 id="banner-title">📄 Screen Documentation</h2>
            <p id="banner-text">This page represents the <strong>${title}</strong> screen from the KarāraOS application with bilingual support (English/Arabic) and realistic sample data.</p>
        </div>

        <div class="feature-grid">
            <div class="feature-card">
                <h3 id="features-title">✨ Key Features</h3>
                <ul id="features-list">
                    ${screenData.features.map(f => `<li><span class="en-text">${f.en}</span><span class="ar-text hidden">${f.ar}</span></li>`).join('\n                    ')}
                </ul>
            </div>

            <div class="feature-card">
                <h3 id="components-title">🧩 UI Components</h3>
                <div class="component-list">
                    ${screenData.components.map(c => `<span class="component-badge">${c}</span>`).join('\n                    ')}
                </div>
                <ul style="margin-top: 1.5rem;">
                    <li class="en-text">Shadcn/ui component library</li>
                    <li class="en-text">Tailwind CSS styling</li>
                    <li class="en-text">Radix UI primitives</li>
                    <li class="en-text">React Hook Form + Zod</li>
                    <li class="ar-text hidden">مكتبة مكونات Shadcn/ui</li>
                    <li class="ar-text hidden">تصميم Tailwind CSS</li>
                    <li class="ar-text hidden">Radix UI الأساسيات</li>
                    <li class="ar-text hidden">React Hook Form + Zod</li>
                </ul>
            </div>

            <div class="feature-card">
                <h3 id="tech-title">⚡ Technical Stack</h3>
                <ul>
                    <li class="en-text">React + TypeScript</li>
                    <li class="en-text">TanStack Query for data fetching</li>
                    <li class="en-text">Wouter for routing</li>
                    <li class="en-text">i18next for internationalization</li>
                    <li class="en-text">Express.js backend API</li>
                    <li class="ar-text hidden">React + TypeScript</li>
                    <li class="ar-text hidden">TanStack Query لجلب البيانات</li>
                    <li class="ar-text hidden">Wouter للتوجيه</li>
                    <li class="ar-text hidden">i18next للترجمة</li>
                    <li class="ar-text hidden">Express.js واجهة برمجة خلفية</li>
                </ul>
            </div>
        </div>

        ${screenData.mockData ? `
        <div class="mock-data-display">
            <h3 id="sample-data-title">
                <span class="en-text">📊 Sample Data</span>
                <span class="ar-text hidden">📊 بيانات العينة</span>
            </h3>
            ${Object.entries(screenData.mockData).map(([key, value]) => {
              if (Array.isArray(value)) {
                return `<pre style="background: hsl(var(--muted) / 0.5); padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.875rem;">${JSON.stringify(value, null, 2)}</pre>`;
              } else if (value.label) {
                return `<div class="data-row">
                    <span class="data-label">
                        <span class="en-text">${value.label.en}</span>
                        <span class="ar-text hidden">${value.label.ar}</span>
                    </span>
                    <span class="data-value">${value.value}</span>
                </div>`;
              }
              return '';
            }).join('\n            ')}
        </div>
        ` : ''}
    </div>

    <script>
        // Bilingual content storage
        const translations = {
            en: {
                breadcrumbHome: 'Home',
                breadcrumbCategory: '${category}',
                breadcrumbTitle: '${title}',
                pageTitle: '${title}',
                pageDescription: '${description}',
                backText: 'Back to Documentation Index',
                bannerTitle: '📄 Screen Documentation',
                bannerText: 'This page represents the <strong>${title}</strong> screen from the KarāraOS application with bilingual support (English/Arabic) and realistic sample data.',
                featuresTitle: '✨ Key Features',
                componentsTitle: '🧩 UI Components',
                techTitle: '⚡ Technical Stack',
                sampleDataTitle: '📊 Sample Data',
                langText: 'العربية'
            },
            ar: {
                breadcrumbHome: 'الرئيسية',
                breadcrumbCategory: '${categoryAr}',
                breadcrumbTitle: '${titleAr}',
                pageTitle: '${titleAr}',
                pageDescription: '${descriptionAr}',
                backText: 'العودة إلى فهرس التوثيق',
                bannerTitle: '📄 توثيق الشاشة',
                bannerText: 'تمثل هذه الصفحة شاشة <strong>${titleAr}</strong> من تطبيق KarāraOS مع دعم ثنائي اللغة (إنجليزي/عربي) وبيانات عينة واقعية.',
                featuresTitle: '✨ الميزات الرئيسية',
                componentsTitle: '🧩 مكونات واجهة المستخدم',
                techTitle: '⚡ المجموعة التقنية',
                sampleDataTitle: '📊 بيانات العينة',
                langText: 'English'
            }
        };

        let currentLang = 'en';

        function toggleLanguage() {
            const html = document.documentElement;
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            const newDir = currentLang === 'ar' ? 'rtl' : 'ltr';
            
            html.setAttribute('dir', newDir);
            html.setAttribute('lang', currentLang);
            
            // Update all translatable elements
            const trans = translations[currentLang];
            document.getElementById('breadcrumb-home').textContent = trans.breadcrumbHome;
            document.getElementById('breadcrumb-category').textContent = trans.breadcrumbCategory;
            document.getElementById('breadcrumb-title').textContent = trans.breadcrumbTitle;
            document.getElementById('page-title').textContent = trans.pageTitle;
            document.getElementById('page-description').textContent = trans.pageDescription;
            document.getElementById('back-text').textContent = trans.backText;
            document.getElementById('banner-title').textContent = trans.bannerTitle;
            document.getElementById('banner-text').innerHTML = trans.bannerText;
            document.getElementById('features-title').textContent = trans.featuresTitle;
            document.getElementById('components-title').textContent = trans.componentsTitle;
            document.getElementById('tech-title').textContent = trans.techTitle;
            document.getElementById('lang-text').textContent = trans.langText;
            
            const sampleDataTitle = document.getElementById('sample-data-title');
            if (sampleDataTitle) {
                sampleDataTitle.innerHTML = trans.sampleDataTitle;
            }
            
            // Toggle EN/AR text visibility
            document.querySelectorAll('.en-text').forEach(el => {
                el.classList.toggle('hidden', currentLang === 'ar');
            });
            document.querySelectorAll('.ar-text').forEach(el => {
                el.classList.toggle('hidden', currentLang === 'en');
            });
        }
    </script>
</body>
</html>`;
}

// Generate files
const screensDir = path.join(__dirname, 'screens');
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

let generatedCount = 0;

for (const [filename, screenData] of Object.entries(screenDatabase)) {
  const html = generateScreenHTML(filename, screenData);
  fs.writeFileSync(path.join(screensDir, filename), html);
  generatedCount++;
  console.log(`✅ Generated: ${filename}`);
}

console.log(`\n🎉 Successfully generated ${generatedCount} enhanced bilingual HTML documentation files!`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Add remaining ${77 - generatedCount} screens to screenDatabase`);
console.log(`   2. Extract all i18n translations for complete bilingual coverage`);
console.log(`   3. Add realistic mock data for each screen type`);
console.log(`   4. Include actual screenshots or component renders`);
