// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Collection Points
    COLLECTION_POINTS: '/api/collection-points',
    NEAREST_POINT: '/api/collection-points/nearest',
    
    // Reports
    REPORTS: '/api/reports',
    MY_REPORTS: '/api/reports/my-reports',
    
    // Routes
    ROUTES: '/api/routes',
    OPTIMIZE_ROUTE: '/api/routes/optimize',
    
    // Citizens/Users
    AUTH_LOGIN: '/api/auth/login',
    AUTH_REGISTER: '/api/auth/register',
    PROFILE: '/api/users/profile',
  },
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: -0.9346, // Latacunga, Ecuador
    lng: -78.6156,
  },
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 18,
  MIN_ZOOM: 10,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Latacunga Limpia',
  VERSION: '1.0.0',
  POINTS_FOR_DISCOUNT: 100,
  MAX_REPORT_DISTANCE_KM: 50,
};
