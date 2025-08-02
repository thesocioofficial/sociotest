// Centralized configuration for API URLs and environment variables
export const config = {
  // API URLs
  API_URL: process.env.NEXT_PUBLIC_API_URL || "https://sociotest-production.up.railway.app",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://sociotest.vercel.app",
  
  // Supabase Configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  
  // Authentication
  ALLOWED_DOMAIN: "christuniversity.in",
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

// Helper function to get API endpoint
export const getApiUrl = (endpoint: string) => {
  return `${config.API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper function to get app URL
export const getAppUrl = (path: string = '') => {
  return `${config.APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
