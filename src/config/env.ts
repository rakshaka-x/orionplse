import dotenv from 'dotenv';

dotenv.config();

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  heartbeatIntervalMs: toInt(process.env.HEARTBEAT_INTERVAL_MS, 7_200_000),
  port: toInt(process.env.PORT, 3000),
  heartbeatTable: process.env.HEARTBEAT_TABLE ?? 'heartbeat',
  heartbeatRowId: toInt(process.env.HEARTBEAT_ROW_ID, 1)
};

export const validateEnv = (): void => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  }
};
