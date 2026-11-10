import { Platform } from 'react-native';

/** Live Mpuza API. The browser uses the local /api proxy because Mpuza only allows localhost:3000. */
export const API_ROOT = Platform.OS === 'web' ? '/api' : 'https://api.mpuza.com/api';

/** AU-09. Full browser navigation only — the API answers with a redirect, not JSON. */
export const GOOGLE_AUTH_URL = 'https://api.mpuza.com/api/auth/google';

export const TOKEN_KEY = '_m_tkn__';
