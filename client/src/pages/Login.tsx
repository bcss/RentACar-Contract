import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ErrorDisplay, useErrorDisplay } from '@/components/design-system/ErrorDisplay';
import { apiRequest, fetchCsrfToken } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Eye, EyeOff, UserCircle, Lock, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import loginImage from '@assets/login_illustration_optimized.webp';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { currentError, showError, dismissError } = useErrorDisplay();
  const [rotatingWord, setRotatingWord] = useState(0);
  
  // Rotating words for animated subtitle
  const words = ['customer', 'vehicle', 'business', 'finance'];
  
  // Animate subtitle words
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWord((prev) => (prev + 1) % words.length);
    }, 1500); // Change word every 1.5 seconds (6s total cycle for 4 words)
    
    return () => clearInterval(interval);
  }, []);
  
  // Set document title
  useEffect(() => {
    document.title = 'KarāraOS';
  }, []);
  
  // Fetch company branding (public endpoint - no auth required)
  const { data: branding } = useQuery<{companyNameEn: string | null, companyNameAr: string | null, logoUrl: string | null}>({
    queryKey: ['/api/branding'],
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('preferred-language', lang);
  };

  const onSubmit = async (data: LoginFormData) => {
    dismissError();
    
    try {
      const res = await apiRequest('POST', '/api/login', data);
      const user = await res.json();

      // Fetch CSRF token and wait for it before redirect
      await fetchCsrfToken();

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

      setLocation('/');
    } catch (error: any) {
      // Show red field-level error for invalid credentials
      if (error instanceof Error && error.message.includes('401')) {
        form.setError('password', {
          type: 'manual',
          message: t('login.invalidCredentials'),
        });
      } else {
        // Use banner for systemic failures
        showError(error, { 
          mode: 'banner',
          variant: 'destructive',
        });
      }
    }
  };

  const companyName = branding 
    ? i18n.language === 'ar'
      ? branding.companyNameAr || branding.companyNameEn || 'KarāraOS'
      : branding.companyNameEn || branding.companyNameAr || 'KarāraOS'
    : 'KarāraOS';

  return (
    <div className="min-h-screen flex flex-row" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Left Panel - Rental Car Illustration */}
      <div className="flex-1 max-w-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center p-12">
        <img 
          src={loginImage} 
          alt="Rental Car Management" 
          className="w-full max-w-2xl object-contain select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          data-testid="img-login-illustration"
          style={{ userSelect: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
        />
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-foreground" data-testid="text-app-name">KarāraOS</h1>
            <p className="text-muted-foreground h-6" data-testid="text-subtitle">
              Sign in to manage{' '}
              <span 
                className="inline-block font-semibold text-primary transition-all duration-500 ease-in-out"
                key={rotatingWord}
                data-testid="text-rotating-word"
                style={{
                  animation: 'fadeSlideIn 0.5s ease-in-out'
                }}
              >
                {words[rotatingWord]}
              </span>
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex justify-end">
            <Select 
              value={i18n.language} 
              onValueChange={changeLanguage}
              data-testid="select-language"
            >
              <SelectTrigger className="w-32" data-testid="trigger-language">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" data-testid="option-language-en">English</SelectItem>
                <SelectItem value="ar" data-testid="option-language-ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {currentError && (
            <ErrorDisplay 
              {...currentError}
              onDismiss={dismissError}
            />
          )}

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-login">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-username">{t('login.username')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder={t('login.usernamePlaceholder')}
                          className="pl-10"
                          autoComplete="username"
                          data-testid="input-username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage data-testid="error-username" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel data-testid="label-password">{t('login.password')}</FormLabel>
                    <FormControl>
                      <div className="relative" dir="ltr">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('login.passwordPlaceholder')}
                          className="pl-10 pr-12"
                          autoComplete="current-password"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                          tabIndex={-1}
                          data-testid="button-toggle-password"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage data-testid="error-password" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-login"
              >
                {form.formState.isSubmitting ? t('login.loggingIn') : t('login.signIn')}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t('login.footer')}</p>
            <p className="text-xs text-muted-foreground/80">{t('login.madeWith')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
