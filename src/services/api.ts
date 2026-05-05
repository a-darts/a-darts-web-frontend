export const API_BASE_URL = 'http://localhost:3000/api';

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocurrió un error inesperado');
  }
  return response.json();
};
