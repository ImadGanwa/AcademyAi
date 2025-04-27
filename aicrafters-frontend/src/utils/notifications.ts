// Custom event for unread notifications count update
export const UNREAD_NOTIFICATIONS_UPDATE = 'unreadNotificationsUpdate';

// Function to dispatch unread count update
export const updateUnreadNotificationsCount = (count: number) => {
  const event = new CustomEvent(UNREAD_NOTIFICATIONS_UPDATE, { detail: count });
  window.dispatchEvent(event);
};

// Notification types and colors
export const NOTIFICATION_COLORS = {
  user: '#D710C1',
  course: '#22C55E',
  assignment: '#EAB308',
  review: '#EC4899',
  completion: '#06B6D4'
}; 