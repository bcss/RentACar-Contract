import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { CompanySettings } from "@shared/schema";

interface UseCurrencyReturn {
  currency: string;
  isLoading: boolean;
}

export function useCurrency(): UseCurrencyReturn {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const { data: settings, isLoading } = useQuery<CompanySettings>({
    queryKey: ['/api/settings'],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const currency = currentLanguage === 'ar' 
    ? (settings?.currencyAr || 'د.إ')
    : (settings?.currencyEn || 'AED');

  return {
    currency,
    isLoading,
  };
}
