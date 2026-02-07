// Local storage key for insurance settings
const SETTINGS_STORAGE_KEY = 'insurance_settings';

export interface InsuranceSettings {
  companyName: string;
  businessAddress: string;
  contactPerson: string;
  emailAddress: string;
  phoneNumber: string;
  companyLogo?: string;
  defaultExportFormat: 'PDF' | 'CSV' | 'EXCEL';
  autoSaveReports: boolean;
  includeMetadata: boolean;
}

class InsuranceSettingsService {
  getSettings(): InsuranceSettings {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {
        companyName: '',
        businessAddress: '',
        contactPerson: '',
        emailAddress: '',
        phoneNumber: '',
        defaultExportFormat: 'PDF',
        autoSaveReports: false,
        includeMetadata: false
      };
    }
  }

  updateSettings(formData: Partial<InsuranceSettings>): { success: boolean; message: string; data: InsuranceSettings } {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...formData };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      return {
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return {
        success: false,
        message: 'Failed to update settings',
        data: this.getSettings()
      };
    }
  }

  uploadLogo(file: File): Promise<{ success: boolean; message: string; url: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentSettings = this.getSettings();
        const updatedSettings = {
          ...currentSettings,
          companyLogo: reader.result as string
        };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
        resolve({
          success: true,
          message: 'Logo uploaded successfully',
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

export default new InsuranceSettingsService(); 