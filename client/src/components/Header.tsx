import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function Header() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      {/* Left side - Sidebar Toggle (always on left in both LTR and RTL) */}
      <div className="flex items-center gap-4 ltr:order-1 rtl:order-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('header.toggleSidebar')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Right side - Theme & Language Toggles (always on right in both LTR and RTL) */}
      <div className="flex items-center gap-2 ltr:order-2 rtl:order-2">
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('header.switchTheme')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Language Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('header.switchLanguage')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
