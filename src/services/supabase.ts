import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export interface HeartbeatRow {
  id: number;
  message: string;
  updated_at: string;
}

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

export const upsertHeartbeat = async (message: string): Promise<HeartbeatRow> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(env.heartbeatTable)
    .upsert({ id: env.heartbeatRowId, message, updated_at: now })
    .select('id, message, updated_at')
    .single();

  if (error || !data) throw error ?? new Error('No heartbeat data returned');
  return data as HeartbeatRow;
};
