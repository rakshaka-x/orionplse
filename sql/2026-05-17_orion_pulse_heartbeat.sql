-- Orion Pulse Lite isolated heartbeat table (idempotent, non-destructive)

create table if not exists public.orion_pulse_heartbeat (
  id integer primary key,
  message text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_orion_pulse_heartbeat_updated_at
  on public.orion_pulse_heartbeat (updated_at desc);

alter table public.orion_pulse_heartbeat enable row level security;

-- Read policy for authenticated users
create policy if not exists "orion_pulse_heartbeat_select_authenticated"
  on public.orion_pulse_heartbeat
  for select
  to authenticated
  using (true);

-- Update policy for authenticated users
create policy if not exists "orion_pulse_heartbeat_update_authenticated"
  on public.orion_pulse_heartbeat
  for update
  to authenticated
  using (true)
  with check (true);

-- Insert policy for authenticated users
create policy if not exists "orion_pulse_heartbeat_insert_authenticated"
  on public.orion_pulse_heartbeat
  for insert
  to authenticated
  with check (true);

-- Service role bypasses RLS by default in Supabase; explicit policy added for clarity/defense-in-depth.
create policy if not exists "orion_pulse_heartbeat_all_service_role"
  on public.orion_pulse_heartbeat
  for all
  to service_role
  using (true)
  with check (true);

insert into public.orion_pulse_heartbeat (id, message)
values (1, 'Orion Pulse Lite initialized')
on conflict (id) do nothing;
