// AdminSettings.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Database, Mail, Globe, Save, RefreshCw, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiFetch, apiFetchFormData } from '@/config/api';
import { useSettings } from '@/context/SettingsContext';
import { getImageUrl } from '@/utils/imageUrl';

// Map group names to UI labels & icons
const GROUP_CONFIG = {
  application: { label: 'General', icon: Globe },
  social: { label: 'Social', icon: Settings },
  smtp: { label: 'Email (SMTP)', icon: Mail },
  google_maps: { label: 'Maps', icon: Globe },
};

// Reverse map: UI tab → group
const TAB_TO_GROUP: Record<string, string> = {
  general: 'application',
  social: 'social',
  email: 'smtp',
  maps: 'google_maps',
};

// Group → Tab
const GROUP_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_GROUP).map(([tab, group]) => [group, tab])
);

// Custom label mappings for settings keys
const LABEL_MAPPINGS: Record<string, string> = {
  twitter_url: 'TikTok Url',
};

export default function AdminSettings() {
  const { refetch } = useSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});
  const [imagePreview, setImagePreview] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const HIDDEN_SETTINGS = new Set([
    'smtp_password',
    'sms_api_key',
    'firebase_config',
    'api_base_url',
  ]);

  const READONLY_SETTINGS = useMemo(() => new Set(['api_base_url', 'support_email']), []);

  const availableTabs = useMemo(() =>
    Object.keys(settingsData).filter(tab => Object.keys(settingsData[tab]).length > 0),
    [settingsData]
  );

  // Fetch all settings on mount
  useEffect(() => {
    const HIDDEN_GROUPS = new Set(['firebase']);
    const fetchSettings = async () => {
      try {
        const response = await apiFetch<{ data: any[] }>('/settings');
        if (response.success) {
          const grouped = response.data.filter(setting => !HIDDEN_GROUPS.has(setting.group)).reduce((acc, setting) => {
            const tab = GROUP_TO_TAB[setting.group] || 'general';
            if (!acc[tab]) acc[tab] = {};
            acc[tab][setting.key] = setting.value;
            return acc;
          }, {} as Record<string, Record<string, any>>);
          setSettingsData(grouped);

          // Initialize image previews for existing images
          const previews: Record<string, string> = {};
          response.data.forEach(setting => {
            if ((setting.key === 'header_logo' || setting.key === 'footer_logo' || setting.key === 'favicon') && setting.value) {
              const imageUrl = getImageUrl(setting.value);
              if (imageUrl) {
                previews[setting.key] = imageUrl;
              }
            }
          });
          setImagePreview(previews);
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = useCallback((tab: string, key: string, value: any) => {
    setSettingsData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: value },
    }));
  }, []);

  const handleFileSelect = useCallback((tab: string, key: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload a valid image file',
        variant: 'destructive',
      });
      return;
    }

    // Store the file for later upload
    setImageFiles(prev => ({ ...prev, [key]: file }));

    // Clear the old value from settingsData (don't send old path to backend)
    setSettingsData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: '' },
    }));

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(prev => ({ ...prev, [key]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback((tab: string, key: string) => {
    setSettingsData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: '' },
    }));
    setImagePreview(prev => {
      const newPrev = { ...prev };
      delete newPrev[key];
      return newPrev;
    });
    setImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }
  }, []);

  const handleSave = useCallback(async (tab: string) => {
    const group = TAB_TO_GROUP[tab];
    if (!group) return;

    setSaving(true);
    try {
      const hasImageFiles = Object.keys(imageFiles).length > 0;

      if (hasImageFiles) {
        // ✅ Use FormData
        const formData = new FormData();

        // Append files
        Object.entries(imageFiles).forEach(([key, file]) => {
          formData.append(key, file);
        });

        // ✅ Append settings as a JSON STRING (exclude image fields that have files)
        const imageFileKeys = new Set(Object.keys(imageFiles));
        const settingsPayload = Object.entries(settingsData[tab] || {})
          .filter(([key]) => !imageFileKeys.has(key)) // Don't send image paths when uploading new files
          .map(([key, value]) => ({
            key,
            value: value ?? null, // preserve null
          }));
        formData.append('settings', JSON.stringify(settingsPayload));

        const response = await apiFetchFormData<{ success: boolean; message?: string }>(
          `/admin/update-settings/${group}`,
          {
            method: 'POST',
            body: formData, // ← FormData instance, NOT JSON
          }
        );

        if (response.success) {
          toast({ title: 'Success', description: `${GROUP_CONFIG[group]?.label || tab} settings saved!` });
          setImageFiles({});
          await refetch();
        } else {
          throw new Error(response.message || 'Save failed');
        }
      } else {
        // ❗ Even when NO files, you should still use FormData if your endpoint expects files optionally
        // But if your endpoint supports JSON for non-file requests, this is okay.
        // However, to keep logic consistent, consider using FormData always.

        const payload = Object.entries(settingsData[tab] || {}).map(([key, value]) => ({
          key,
          value: value ?? null,
        }));

        // ✅ If your backend ONLY accepts FormData (even without files), do this:
        const formData = new FormData();
        formData.append('settings', JSON.stringify(payload));

        const response = await apiFetchFormData<{ success: boolean; message?: string }>(
          `/admin/update-settings/${group}`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (response.success) {
          toast({ title: 'Success', description: `${GROUP_CONFIG[group]?.label || tab} settings saved!` });
          await refetch();
        } else {
          throw new Error(response.message || 'Save failed');
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [imageFiles, settingsData, refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Header - Dashboard Style */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
            Site Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure platform-wide settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 min-w-max sm:min-w-0">
            {availableTabs.map((tab) => {
              const group = TAB_TO_GROUP[tab];
              const config = GROUP_CONFIG[group] || { label: tab.charAt(0).toUpperCase() + tab.slice(1), icon: Settings };
              const Icon = config.icon;
              return (
                <TabsTrigger key={tab} value={tab} className="flex items-center gap-1 sm:gap-2 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm whitespace-nowrap">
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="truncate">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {availableTabs.map((tab) => {
          const group = TAB_TO_GROUP[tab];
          const config = GROUP_CONFIG[group] || { label: tab, icon: Settings };
          const Icon = config.icon;
          const tabSettings = settingsData[tab] || {};

          return (
            <TabsContent key={tab} value={tab} className="mt-3 sm:mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-5 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                    <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                    {config.label} Settings
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage {config.label.toLowerCase()} configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 p-4 sm:p-5 md:p-6">
                  {Object.entries(tabSettings).filter(([key]) => !HIDDEN_SETTINGS.has(key)).map(([key, value]) => {
                    const isBoolean = typeof value === 'boolean';
                    const isNumber = typeof value === 'number';
                    const isImageField = key === 'header_logo' || key === 'footer_logo' || key === 'favicon';

                    return (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize text-sm sm:text-base">
                          {LABEL_MAPPINGS[key] || key.replace(/_/g, ' ')}
                        </Label>
                        {isBoolean ? (
                          <div className="pt-2">
                            <Switch
                              id={key}
                              checked={value}
                              onCheckedChange={(checked) => handleInputChange(tab, key, checked)}
                            />
                          </div>
                        ) : isImageField ? (
                          <div className="space-y-3">
                            {/* Image Preview */}
                            {imagePreview[key] && (
                              <div className="relative inline-block">
                                <div className="border rounded-lg p-2 bg-muted/20">
                                  <img
                                    src={imagePreview[key]}
                                    alt={key.replace(/_/g, ' ')}
                                    className={key === 'favicon' ? 'h-12 w-12 sm:h-16 sm:w-16 object-contain' : 'h-24 sm:h-32 w-auto max-w-full sm:max-w-xs object-contain'}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                                  onClick={() => handleRemoveImage(tab, key)}
                                >
                                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </Button>
                              </div>
                            )}

                            {/* File Upload Input */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Input
                                ref={(el) => (fileInputRefs.current[key] = el)}
                                id={key}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileSelect(tab, key, file);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRefs.current[key]?.click()}
                                className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
                              >
                                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {imagePreview[key] ? 'Change Image' : 'Upload Image'}
                              </Button>
                              {imagePreview[key] && (
                                <span className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start">
                                  <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                                  Image uploaded
                                </span>
                              )}
                            </div>

                            {/* URL Input (optional, for manual URL entry) */}
                            <Input
                              type="text"
                              placeholder="Or enter image URL"
                              value={imageFiles[key]?.name || ''}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                handleInputChange(tab, key, inputValue);
                                if (inputValue) {
                                  const imageUrl = getImageUrl(inputValue);
                                  if (imageUrl) {
                                    setImagePreview(prev => ({ ...prev, [key]: imageUrl }));
                                  }
                                }
                              }}
                              className="text-xs sm:text-sm"
                              readOnly={!!imageFiles[key]}
                            />
                          </div>
                        ) : (
                          <Input
                            id={key}
                            type={isNumber ? 'number' : 'text'}
                            value={value ?? ''}
                            onChange={(e) =>
                              handleInputChange(tab, key, isNumber ? Number(e.target.value) : e.target.value)
                            }
                            className="text-sm sm:text-base"
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="flex flex-col sm:flex-row justify-end pt-3 sm:pt-4 gap-2 sm:gap-3">
                    <Button variant="outline" onClick={() => { /* TODO: reset logic */ }} className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Reset
                    </Button>
                    <Button onClick={() => handleSave(tab)} disabled={saving} className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0">
                      {saving ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" /> : <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}