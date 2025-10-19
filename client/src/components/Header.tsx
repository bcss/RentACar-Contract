import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
      </div>
      
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          className="hover-elevate active-elevate-2"
        >
          <span className="material-icons">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </Button>

        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          data-testid="button-language-toggle"
          className="hover-elevate active-elevate-2"
        >
          <span className="font-mono text-sm font-semibold">
            {language === 'en' ? 'ع' : 'EN'}
          </span>
        </Button>
      </div>
    </header>
  );
}
