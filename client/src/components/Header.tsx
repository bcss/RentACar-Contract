import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { PanelLeft } from 'lucide-react';

export function Header() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      {/* Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              data-testid="button-sidebar-toggle"
              className="h-7 w-7 hover-elevate active-elevate-2"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">{t('header.toggleSidebar')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('header.toggleSidebar')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Theme & Language Toggles */}
      <div className="flex items-center gap-2">
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
                {language === 'en' ? 'عربي' : 'EN'}
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
