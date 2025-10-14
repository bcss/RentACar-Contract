import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-6 rounded-full">
              <span className="material-icons text-6xl text-primary">
                directions_car
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight" data-testid="text-title">
              {t('landing.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto" data-testid="text-subtitle">
              {t('landing.subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Button
              size="lg"
              className="w-full"
              asChild
              data-testid="button-login"
            >
              <a href="/api/login" className="flex items-center justify-center gap-2">
                <span className="material-icons">login</span>
                <span>{t('landing.loginButton')}</span>
              </a>
            </Button>
          </div>

          <div className="pt-8 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <span className="material-icons text-2xl text-primary">language</span>
                <p className="font-medium">Bilingual Support</p>
                <p className="text-muted-foreground">English & Arabic</p>
              </div>
              <div className="space-y-2">
                <span className="material-icons text-2xl text-primary">security</span>
                <p className="font-medium">Role-Based Access</p>
                <p className="text-muted-foreground">Admin, Manager, Staff, Viewer</p>
              </div>
              <div className="space-y-2">
                <span className="material-icons text-2xl text-primary">assignment</span>
                <p className="font-medium">Contract Management</p>
                <p className="text-muted-foreground">Draft to Finalized</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
