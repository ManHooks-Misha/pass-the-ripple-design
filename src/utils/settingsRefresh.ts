/**
 * Utility to manually trigger settings refresh
 * Useful when settings are updated and you want to refresh immediately
 */

// Dispatch a custom event to trigger settings refresh
export const triggerSettingsRefresh = () => {
  window.dispatchEvent(new CustomEvent('settings-refresh'));
};

// Listen for settings refresh events (used internally by SettingsContext)
export const onSettingsRefresh = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('settings-refresh', handler);
  return () => window.removeEventListener('settings-refresh', handler);
};
