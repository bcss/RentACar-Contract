import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import desktopImage from '@assets/stock_images/modern_minimalist_de_44999b45.jpg';

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop) {
    const isArabic = i18n.language === 'ar';
    
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
        dir={isArabic ? 'rtl' : 'ltr'}
        data-testid="screen-desktop-required"
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={desktopImage} 
            alt="Desktop workspace" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/95 to-primary/20" />
        </div>

        {/* Content Card */}
        <div className="relative z-10 w-full max-w-2xl">
          <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center space-y-4 pb-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Monitor className="w-16 h-16 text-primary" strokeWidth={1.5} data-testid="icon-desktop-monitor" />
                </div>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold" data-testid="text-desktop-required-title">
                  {isArabic ? 'جهاز سطح المكتب مطلوب' : 'Desktop Device Required'}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {isArabic 
                    ? 'تم تحسين KarāraOS لمتصفحات سطح المكتب والأجهزة اللوحية ذات الشاشات الكبيرة. يرجى فتح التطبيق من جهاز بشاشة أوسع للحصول على أفضل تجربة.'
                    : 'KarāraOS is optimized for desktop browsers and large-screen tablets. Please access the application from a device with a wider display for the best experience.'
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Requirements Cards */}
              <div className="grid gap-3">
                {/* Minimum Width */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {isArabic ? 'الحد الأدنى للعرض المدعوم' : 'Minimum Supported Width'}
                    </p>
                    <p className="text-2xl font-bold text-primary">1024px</p>
                  </div>
                </div>

                {/* Recommended Resolution */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {isArabic ? 'الدقة الموصى بها' : 'Recommended Resolution'}
                    </p>
                    <p className="text-2xl font-bold text-primary">1366 × 768 {isArabic ? 'أو أعلى' : 'or higher'}</p>
                  </div>
                </div>
              </div>

              {/* Supported Devices */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
                  {isArabic ? 'الأجهزة المدعومة' : 'SUPPORTED DEVICES'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {isArabic ? 'أجهزة الكمبيوتر المكتبية' : 'Desktop Computers'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {isArabic ? 'أجهزة اللابتوب' : 'Laptops'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {isArabic ? 'الأجهزة اللوحية الكبيرة' : 'Large Tablets'}
                  </Badge>
                </div>
              </div>

              {/* Footer Branding */}
              <div className="pt-6 border-t border-border">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-foreground" data-testid="text-app-branding">
                    KarāraOS
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-desktop-footer">
                    {isArabic 
                      ? 'نظام إدارة عقود تأجير السيارات'
                      : 'Rental Car Contract Management System'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground pt-2">
                    Crafted with ❤️ from 🇮🇳
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
