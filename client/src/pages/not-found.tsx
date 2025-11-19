import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-background" data-testid="page-not-found">
      <Card className="w-full max-w-md mx-4" data-testid="card-not-found">
        <CardContent className="pt-6" data-testid="content-not-found">
          <div className="flex mb-4 gap-2 items-center" data-testid="header-not-found">
            <AlertCircle className="h-8 w-8 text-destructive" data-testid="icon-error" />
            <h1 className="text-2xl font-bold" data-testid="text-title">
              {t('errors.404.title', '404 - Page Not Found')}
            </h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground" data-testid="text-description">
            {t('errors.404.description', 'The page you are looking for does not exist or has been moved.')}
          </p>

          <div className="mt-6 flex gap-3" data-testid="actions-not-found">
            <Link href="/">
              <Button data-testid="button-home">
                <Home className="mr-2 h-4 w-4" data-testid="icon-home" />
                {t('common.goHome', 'Go to Homepage')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
