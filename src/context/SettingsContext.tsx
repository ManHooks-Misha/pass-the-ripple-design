import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { apiFetch } from '@/config/api';
import type {
  SettingItem,
  FlatSettings,
  GroupedSettings,
} from '@/types/settings';
import { onSettingsRefresh } from '@/utils/settingsRefresh';

interface SettingsContextType {
  // Flat settings object with all settings by key
  settings: FlatSettings | null;
  // Settings grouped by category
  grouped: GroupedSettings | null;
  // Loading state
  loading: boolean;
  // Refetch settings from API
  refetch: () => Promise<void>;
  // Get a specific setting value
  getSetting: <T = any>(key: string, defaultValue?: T) => T;
  // Get settings by group
  getGroup: <T = any>(group: keyof GroupedSettings) => T;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  grouped: null,
  loading: true,
  refetch: async () => {},
  getSetting: () => undefined,
  getGroup: () => ({} as any),
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FlatSettings | null>(null);
  const [grouped, setGrouped] = useState<GroupedSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize fetchSettings with useCallback to prevent recreation on every render
  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: SettingItem[] }>('/settings');
      if (res.success) {
        // Create flat settings object
        const flat = res.data.reduce((acc, item) => {
          (acc as any)[item.key] = item.value;
          return acc;
        }, {} as FlatSettings);

        // Create grouped settings object
        const groupedData = res.data.reduce((acc, item) => {
          if (!acc[item.group]) {
            acc[item.group] = {};
          }
          acc[item.group][item.key] = item.value;
          return acc;
        }, {} as any);

        setSettings(flat);
        setGrouped(groupedData as GroupedSettings);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies since it only uses external API and setState

  // Memoize getSetting to prevent recreation
  const getSetting = useCallback(
    <T = any>(key: string, defaultValue?: T): T => {
      if (!settings) return defaultValue as T;
      return (settings[key as keyof FlatSettings] as T) ?? (defaultValue as T);
    },
    [settings] // Depends on settings
  );

  // Memoize getGroup to prevent recreation
  const getGroup = useCallback(
    <T = any>(group: keyof GroupedSettings): T => {
      if (!grouped) return {} as T;
      return (grouped[group] as T) ?? ({} as T);
    },
    [grouped] // Depends on grouped
  );

  useEffect(() => {
    fetchSettings();

    // Refresh settings when window regains focus (e.g., switching tabs)
    const handleFocus = () => {
      fetchSettings();
    };

    window.addEventListener('focus', handleFocus);

    // Listen for manual refresh events
    const unsubscribe = onSettingsRefresh(() => {
      fetchSettings();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
    };
  }, [fetchSettings]); // Add fetchSettings to dependency array

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      settings,
      grouped,
      loading,
      refetch: fetchSettings,
      getSetting,
      getGroup,
    }),
    [settings, grouped, loading, fetchSettings, getSetting, getGroup]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};