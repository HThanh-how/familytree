import { FamilyData } from '../types/family';

// Define config type
export interface AuthConfig {
  requireAuth: boolean;
  authMode: 'all' | 'specific';
  specificName: string;
  familyName: string;
}

// Public config type (no sensitive info)
export interface PublicConfig {
  familyName: string;
  isAuthRequired: boolean; // 只公开是否需要认证，不公开具体验证细节
}

// Default empty family data
const defaultFamilyData: FamilyData = {
  generations: []
};

// Cache config data
let authConfigCache: AuthConfig | null = null;
let familyDataCache: FamilyData | null = null;

// Load config from server
async function loadConfigOnServer<T>(filename: string, defaultConfig: T): Promise<T> {
  // Check if on server
  if (typeof window !== 'undefined') {
    console.warn(`Cannot load ${filename} in browser environment, using default config`);
    return defaultConfig;
  }

  try {
    // Dynamic import fs and path (server only)
    const [fs, path] = await Promise.all([
      import('fs').then(m => m.default),
      import('path').then(m => m.default)
    ]);

    const configDir = path.join(process.cwd(), 'config');
    const filePath = path.join(configDir, filename);

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as T;
    }
  } catch (error) {
    console.warn(`Error loading config file ${filename}:`, error);
  }

  return defaultConfig;
}

// Read auth config from env vars
function getAuthConfigOnServerFromEnv(): AuthConfig {
  return {
    requireAuth: process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true',
    authMode: (process.env.AUTH_MODE as 'all' | 'specific') || 'specific',
    specificName: process.env.SPECIFIC_NAME || '',
    familyName: process.env.NEXT_PUBLIC_FAMILY_NAME || 'Họ'
  };
}

// Read public config from env vars
function getPublicConfigFromEnv(): PublicConfig {
  return {
    familyName: process.env.NEXT_PUBLIC_FAMILY_NAME || 'Họ',
    isAuthRequired: process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true'
  };
}

// Export config access function - server components only
export async function getAuthConfigOnServer(): Promise<AuthConfig> {
  if (authConfigCache) return authConfigCache;

  // 直接从环境变量读取配置
  const config = getAuthConfigOnServerFromEnv();
  authConfigCache = config;
  return config;
}

// Get full family name for client
export function getFamilyFullName(): string {
  const config = getPublicConfigFromEnv();
  return config.familyName;
}

export async function getFamilyDataOnServer(): Promise<FamilyData> {
  if (familyDataCache) return familyDataCache;

  const data = await loadConfigOnServer<FamilyData>('family-data.json', defaultFamilyData);
  familyDataCache = data;
  return data;
}

// Public config for client
export function getPublicConfig(): PublicConfig {
  return getPublicConfigFromEnv();
}

// For familyData, we need to fetch via API since it can be large
export function getFamilyData(): FamilyData {
  return defaultFamilyData; // 这只是一个默认值，实际数据将通过API加载
} 