import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import loginImage from '@assets/login_illustration_optimized.webp';

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
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        data-testid="screen-desktop-required"
      >
        <div className="max-w-2xl space-y-8">
          {/* Illustration */}
          <div className="flex justify-center">
            <img 
              src={loginImage} 
              alt="Desktop Required" 
              className="w-full max-w-sm object-contain"
              data-testid="img-desktop-required"
            />
          </div>

          {/* Message */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-desktop-required-title">
              {i18n.language === 'ar' 
                ? 'جهاز سطح المكتب مطلوب'
                : 'Desktop Required'
              }
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {i18n.language === 'ar'
                ? 'تم تصميم KarāraOS للعمل على أجهزة الكمبيوتر المكتبية والأجهزة اللوحية بحجم أكبر. يرجى فتح التطبيق على شاشة أكبر.'
                : 'KarāraOS is designed for desktop browsers and larger tablets. Please open this application on a larger screen.'
              }
            </p>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'ar'
                  ? 'الحد الأدنى للعرض: 1024 بكسل'
                  : 'Minimum width: 1024px'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {i18n.language === 'ar'
                  ? 'الدقة الموصى بها: 1366 × 768 أو أعلى'
                  : 'Recommended: 1366 × 768 or higher'
                }
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-8 border-t border-border">
            <p data-testid="text-desktop-footer">
              {i18n.language === 'ar'
                ? 'KarāraOS - نظام إدارة عقود تأجير السيارات'
                : 'KarāraOS - Rental Car Contract Management System'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
