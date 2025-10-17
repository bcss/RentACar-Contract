import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from '@/lib/queryClient';

export function Header() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local session and redirect
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/');
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
      </div>
      
      <div className="flex items-center gap-2">
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

        {/* Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-user-menu" className="hover-elevate active-elevate-2">
              <span className="material-icons">account_circle</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer" data-testid="button-logout">
              <span className="material-icons text-base">logout</span>
              <span>{t('auth.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
