import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useErrorDisplay, ErrorDisplay } from '@/components/design-system';
import { apiRequest, fetchCsrfToken } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Eye, EyeOff, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CompanySettings } from '@shared/schema';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { currentError, dismissError, showError, showSuccess } = useErrorDisplay();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Fetch company branding (public endpoint - no auth required)
  const { data: branding } = useQuery<{companyNameEn: string | null, companyNameAr: string | null, logoUrl: string | null}>({
    queryKey: ['/api/branding'],
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiRequest('POST', '/api/login', { username, password });
      const user = await res.json();

      // Fetch CSRF token immediately after successful login
      fetchCsrfToken();

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      showSuccess(
        t('login.success'),
        t('login.welcomeBack', { name: user.firstName || user.username })
      );

      setLocation('/');
    } catch (error: any) {
      showError(error, { 
        title: t('login.failed'),
        mode: "banner" // Use banner mode to demonstrate the ErrorDisplay component
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Car className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {branding 
              ? i18n.language === 'ar'
                ? branding.companyNameAr || branding.companyNameEn || t('landing.title')
                : branding.companyNameEn || branding.companyNameAr || t('landing.title')
              : t('landing.title')
            }
          </CardTitle>
          <p className="text-muted-foreground">{t('login.subtitle')}</p>
        </CardHeader>
        <CardContent>
          {currentError && (
            <ErrorDisplay 
              {...currentError}
              onDismiss={dismissError}
            />
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('login.username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.usernamePlaceholder')}
                required
                disabled={isLoading}
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  data-testid="button-toggle-password-visibility"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? t('login.loggingIn') : t('login.loginButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
