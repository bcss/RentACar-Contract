/**
 * Get time-based greeting based on the current hour
 * Returns appropriate greeting for morning (5-12), afternoon (12-17), or evening (17-5)
 * 
 * @returns Object with English and Arabic greetings
 */
export function getTimeBasedGreeting(): { en: string; ar: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      en: "Good morning",
      ar: "صباح الخير"
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      en: "Good afternoon",
      ar: "مساء الخير"
    };
  } else {
    return {
      en: "Good evening",
      ar: "مساء الخير"
    };
  }
}

/**
 * Calculate time difference and return translation key with parameters
 * Use with i18n's t() function for bilingual support
 * 
 * @param date - The past date to compare with now
 * @param locale - Optional locale for date formatting (defaults to browser locale)
 * @returns Object with translation key and parameters, or formatted date string
 */
export function getTimeAgo(date: Date | null | undefined, locale?: string): { key: string; count?: number } | string {
  if (!date) {
    return { key: "timeAgo.never" };
  }
  
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return { key: "timeAgo.justNow" };
  } else if (diffMins < 60) {
    return { key: "timeAgo.minutesAgo", count: diffMins };
  } else if (diffHours < 24) {
    return { key: "timeAgo.hoursAgo", count: diffHours };
  } else if (diffDays === 1) {
    return { key: "timeAgo.yesterday" };
  } else if (diffDays < 7) {
    return { key: "timeAgo.daysAgo", count: diffDays };
  } else {
    // For dates older than a week, show the actual date
    return new Date(date).toLocaleDateString(locale);
  }
}
