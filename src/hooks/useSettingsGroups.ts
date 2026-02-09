import { useSettings } from '@/context/SettingsContext';
import type {
  ApplicationSettings,
  SocialSettings,
  SMTPSettings,
  GoogleMapsSettings
} from '@/types/settings';

/**
 * Hook to access application settings (app_name, api_base_url, etc.)
 */
export const useApplicationSettings = () => {
  const { getGroup, loading } = useSettings();
  return {
    settings: getGroup<ApplicationSettings>('application'),
    loading,
  };
};

/**
 * Hook to access company settings (company_name, logo, social links, etc.)
 */
export const useSocialSettings = () => {
  const { getGroup, loading } = useSettings();
  return {
    settings: getGroup<SocialSettings>('social'),
    loading,
  };
};

/**
 * Hook to access SMTP settings for email configuration
 */
export const useSMTPSettings = () => {
  const { getGroup, loading } = useSettings();
  return {
    settings: getGroup<SMTPSettings>('smtp'),
    loading,
  };
};

/**
 * Hook to access Firebase settings
 */
// export const useFirebaseSettings = () => {
//   const { getGroup, loading } = useSettings();
//   return {
//     settings: getGroup<FirebaseSettings>('firebase'),
//     loading,
//   };
// };

/**
 * Hook to access Google Maps settings
 */
export const useGoogleMapsSettings = () => {
  const { getGroup, loading } = useSettings();
  return {
    settings: getGroup<GoogleMapsSettings>('google_maps'),
    loading,
  };
};

/**
 * Hook to access SMS settings
 */
// export const useSMSSettings = () => {
//   const { getGroup, loading } = useSettings();
//   return {
//     settings: getGroup<SMSSettings>('sms'),
//     loading,
//   };
// };
