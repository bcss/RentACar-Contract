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
    <header className="flex items-center p-4 border-b bg-background relative">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
      </div>
      
      {/* 
        CRITICAL FIX: Use absolute positioning to always place buttons in top-right corner
        This prevents RTL/LTR document direction from affecting button placement
      */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
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
