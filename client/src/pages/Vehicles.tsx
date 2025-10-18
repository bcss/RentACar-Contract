import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Vehicles() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="loading-vehicles">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6" data-testid="page-vehicles">
      <Card>
        <CardHeader>
          <CardTitle>{t('nav.vehicles')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-muted-foreground mb-4">
              directions_car
            </span>
            <h3 className="text-xl font-semibold mb-2">
              Vehicle Management
            </h3>
            <p className="text-muted-foreground mb-4">
              Vehicle list and management features coming soon.
            </p>
            <p className="text-sm text-muted-foreground">
              For now, vehicles can be created inline when creating a new contract.
            </p>
            <Button 
              variant="default" 
              className="mt-6"
              onClick={() => window.location.href = '/contracts/new'}
              data-testid="button-create-contract"
            >
              {t('contracts.createContract')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
