import i18n from '../i18n';

export const API_BASE_URL = 'http://localhost:3000/api';

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || 'Default';
    
    // Try to translate the message using the auth.errors namespace
    const translatedMessage = i18n.t(`auth.errors.${message}`, { defaultValue: message });
    
    throw new Error(translatedMessage);
  }
  return response.json();
};
