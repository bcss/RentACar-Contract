import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, fetchCsrfToken } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Eye, EyeOff, Car, UserCircle2, Lock, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});
  
  // Fetch company branding (public endpoint - no auth required)
  const { data: branding } = useQuery<{companyNameEn: string | null, companyNameAr: string | null, logoUrl: string | null}>({
    queryKey: ['/api/branding'],
  });

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    
    if (!username.trim()) {
      errors.username = t('login.validation.usernameRequired');
    }
    
    if (!password.trim()) {
      errors.password = t('login.validation.passwordRequired');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setValidationErrors({});

    try {
      const res = await apiRequest('POST', '/api/login', { username, password });
      const user = await res.json();

      // Fetch CSRF token immediately after successful login
      fetchCsrfToken();

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      setLocation('/');
    } catch (error: any) {
      setValidationErrors({ 
        password: t('login.invalidCredentials')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const companyName = branding 
    ? i18n.language === 'ar'
      ? branding.companyNameAr || branding.companyNameEn || 'RCCMS'
      : branding.companyNameEn || branding.companyNameAr || 'RCCMS'
    : 'RCCMS';

  return (
    <div className="min-h-screen flex" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Panel - Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          {/* Logo/Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="bg-primary p-4 rounded-2xl shadow-lg">
              <Car className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">{companyName}</h1>
              <p className="text-sm text-muted-foreground">{t('login.subtitle')}</p>
            </div>
          </div>

          {/* Illustration - Rent-a-Car Theme */}
          <div className="relative w-full max-w-md">
            {/* Main illustration container */}
            <div className="relative bg-background/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-primary/10">
              {/* Car Rack Illustration */}
              <div className="space-y-8">
                {/* Top rack with cars */}
                <div className="flex justify-center gap-8">
                  <div className="relative">
                    <div className="w-24 h-16 bg-primary rounded-lg flex items-center justify-center shadow-md hover-elevate active-elevate-2 cursor-pointer transition-transform hover:scale-105">
                      <Car className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div className="relative">
                    <div className="w-24 h-16 bg-orange-500 rounded-lg flex items-center justify-center shadow-md hover-elevate active-elevate-2 cursor-pointer transition-transform hover:scale-105">
                      <Car className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full border-2 border-background" />
                  </div>
                </div>

                {/* Middle rack with cars */}
                <div className="flex justify-center gap-8">
                  <div className="relative">
                    <div className="w-24 h-16 bg-blue-500 rounded-lg flex items-center justify-center shadow-md hover-elevate active-elevate-2 cursor-pointer transition-transform hover:scale-105">
                      <Car className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-background" />
                  </div>
                  <div className="relative">
                    <div className="w-24 h-16 bg-gray-700 rounded-lg flex items-center justify-center shadow-md hover-elevate active-elevate-2 cursor-pointer transition-transform hover:scale-105">
                      <Car className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                </div>

                {/* Representative with laptop */}
                <div className="flex justify-center mt-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/30">
                      <UserCircle2 className="h-20 w-20 text-primary" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded-full shadow-md border border-primary/20">
                      <p className="text-xs font-medium text-foreground whitespace-nowrap">{t('login.representative')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                <p className="text-2xl font-bold text-primary">300+</p>
                <p className="text-xs text-muted-foreground">{t('login.routes')}</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-xs text-muted-foreground">{t('login.support')}</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground">{t('login.secure')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Support Icons (bottom left) */}
        <div className="absolute bottom-4 left-4 flex gap-2 opacity-50">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Globe className="h-3 w-3 text-primary" />
          </div>
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Globe className="h-3 w-3 text-primary" />
          </div>
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Globe className="h-3 w-3 text-primary" />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Language Selector */}
        <div className="flex justify-end p-4">
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger className="w-32" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Welcome Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {companyName}
              </h2>
              <p className="text-muted-foreground">
                {t('login.welcomeMessage')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              {/* Username Field */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setValidationErrors(prev => ({ ...prev, username: undefined }));
                    }}
                    placeholder={t('login.usernamePlaceholder')}
                    disabled={isLoading}
                    data-testid="input-username"
                    className={`pl-10 ${validationErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!validationErrors.username}
                  />
                </div>
                {validationErrors.username && (
                  <p className="text-sm text-destructive flex items-center gap-1" data-testid="error-username">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setValidationErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder={t('login.passwordPlaceholder')}
                    disabled={isLoading}
                    data-testid="input-password"
                    className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!validationErrors.password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 z-10"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    data-testid="button-toggle-password-visibility"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1" data-testid="error-password">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? t('login.loggingIn') : t('login.loginButton')}
              </Button>
            </form>

            {/* Mobile: Show company logo */}
            <div className="lg:hidden flex justify-center pt-8 border-t">
              <div className="flex items-center gap-2">
                <Car className="h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">{t('login.poweredBy')} {companyName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="p-4 text-center border-t">
          <p className="text-xs text-muted-foreground">
            {t('login.copyright', { year: new Date().getFullYear(), company: companyName })}
          </p>
        </div>
      </div>
    </div>
  );
}
