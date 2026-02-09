// Type definitions for all settings groups in the application

export interface ApplicationSettings {
  app_name: string;
  application_name: string;
  company_logo?: string | null;
  favicon?: string | null;
  support_email: string;
  support_phone?: string | null;
  company_registration_year: string;
}

export interface SocialSettings {
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
}

export interface SMTPSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  smtp_from_address: string;
  smtp_from_name: string;
}

// export interface FirebaseSettings {
//   firebase_api_key: string;
//   firebase_auth_domain: string;
//   firebase_project_id: string;
//   firebase_storage_bucket: string;
//   firebase_messaging_sender_id: string;
//   firebase_app_id: string;
//   firebase_measurement_id: string;
//   firebase_config?: {
//     projectId: string;
//     apiKey: string;
//     [key: string]: any;
//   };
//   fcm_server_key: string;
//   notifications_test_recipient?: string;
// }

export interface GoogleMapsSettings {
  google_maps_api_key: string;
  google_maps_default_center_lat: number;
  google_maps_default_center_lng: number;
  google_maps_default_zoom: number;
}

// export interface SMSSettings {
//   sms_provider: string;
//   sms_api_key: string;
//   sms_sender_id: string;
//   sms_base_url: string;
//   sms_region: string;
//   sms_test_recipient?: string;
// }

export interface SettingItem {
  id: number;
  key: string;
  value: any;
  type: 'string' | 'integer' | 'boolean' | 'json';
  group: 'application' | 'company' | 'smtp' | 'firebase' | 'google_maps' | 'sms';
}

export interface SettingsResponse {
  success: boolean;
  data: SettingItem[];
}

export interface GroupedSettings {
  application: Partial<ApplicationSettings>;
  social: Partial<SocialSettings>;
  smtp: Partial<SMTPSettings>;
  google_maps: Partial<GoogleMapsSettings>;
}

export interface FlatSettings extends
  Partial<ApplicationSettings>,
  Partial<SocialSettings>,
  Partial<SMTPSettings>,
  Partial<GoogleMapsSettings>
