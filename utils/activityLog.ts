import { ActivityLogItem, AuthenticatedUser } from '../types';

const MAX_LOG_ITEMS = 50; // Increased log size
const ACTIVITY_LOG_KEY = 'pigFarmActivityLog';

export const getActivities = (): ActivityLogItem[] => {
  const storedLog = localStorage.getItem(ACTIVITY_LOG_KEY);
  return storedLog ? JSON.parse(storedLog) : [];
};

export const addActivity = (
  description: string,
  type: ActivityLogItem['type'],
  icon?: string,
  user?: AuthenticatedUser | null
): void => {
  const activities = getActivities();
  const newActivity: ActivityLogItem = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    description,
    type,
    icon: icon || getDefaultIcon(type),
    userId: user?.username,
  };

  const updatedActivities = [newActivity, ...activities].slice(0, MAX_LOG_ITEMS);
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updatedActivities));
};

const getDefaultIcon = (type: ActivityLogItem['type']): string => {
  switch (type) {
    case 'os':
      return 'fas fa-clipboard-list';
    case 'event':
      return 'fas fa-calendar-alt';
    case 'barracao':
      return 'fas fa-th-large';
    case 'lote':
      return 'fas fa-users';
    case 'mortalidade':
      return 'fas fa-book-dead';
    case 'embarque':
      return 'fas fa-truck';
    default:
      return 'fas fa-info-circle';
  }
};
