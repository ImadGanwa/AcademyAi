// Custom event for unread messages count update
export const UNREAD_MESSAGES_UPDATE = 'unreadMessagesUpdate';

// Function to dispatch unread count update
export const updateUnreadMessagesCount = (count: number) => {
  const event = new CustomEvent(UNREAD_MESSAGES_UPDATE, { detail: count });
  window.dispatchEvent(event);
}; 