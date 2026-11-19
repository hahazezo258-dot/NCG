import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function sanitizeEnvValue(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? '';
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const supabaseUrl = sanitizeEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

let initializedClient: SupabaseClient | null = null;
let configError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  configError =
    'Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to your Supabase project.';
} else if (!isValidHttpUrl(supabaseUrl)) {
  configError =
    'VITE_SUPABASE_URL is not a valid HTTP/HTTPS URL. Verify the Supabase project URL in your environment settings.';
} else {
  try {
    initializedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    configError =
      err instanceof Error ? err.message : 'Unable to initialize Supabase client.';
    initializedClient = null;
  }
}

export const supabase: SupabaseClient | null = initializedClient;

export const isSupabaseConfigured = Boolean(supabase);

export const supabaseConfigError = configError;

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new SupabaseConfigurationError(
      supabaseConfigError ??
        'Supabase client is not configured. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  return supabase;
}
