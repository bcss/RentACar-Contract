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
 * Format the time difference between two dates into human-readable format
 * E.g., "2 hours ago", "5 minutes ago", "yesterday"
 * 
 * @param date - The past date to compare with now
 * @returns Human-readable time difference string (English only, will be translated via i18n)
 */
export function getTimeAgo(date: Date | null | undefined): string {
  if (!date) {
    return "Never";
  }
  
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    // For dates older than a week, show the actual date
    return new Date(date).toLocaleDateString();
  }
}
