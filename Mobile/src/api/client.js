import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://your-backend-url/api';

export const SOCKET_URL = API_BASE_URL.replace('/api', '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const TOKEN_KEY = 'zapchat_token';

export async function saveToken(token) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

// For <Image source={{ uri, headers }}> requests against our own protected
// content routes (e.g. gallery/admin photo delivery), which axios's instance
// defaults don't apply to.
export function getAuthHeaders() {
  const authHeader = api.defaults.headers.common.Authorization;
  return authHeader ? { Authorization: authHeader } : {};
}
