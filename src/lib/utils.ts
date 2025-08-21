export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function calculateEventStatus(startDate: string, endDate: string): 'upcoming' | 'active' | 'completed' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
}

export function shouldShowOnDashboard(startDate: string, endDate: string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Show if upcoming
  if (now < start) return true;
  
  // Show if in progress
  if (now >= start && now <= end) return true;
  
  // Show if completed less than 1 week ago
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (now > end && end > oneWeekAgo) return true;
  
  return false;
} 