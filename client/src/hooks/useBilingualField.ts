import { useTranslation } from 'react-i18next';

export function useBilingualField() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const getBilingualValue = (enValue: string | null | undefined, arValue: string | null | undefined): string => {
    if (isArabic && arValue) {
      return arValue;
    }
    return enValue || arValue || '';
  };

  return { getBilingualValue, isArabic };
}
