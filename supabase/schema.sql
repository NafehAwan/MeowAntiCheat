-- MeowAntiCheat Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Servers table
create table if not exists servers (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  ip text,
  plugin_bound boolean default false,
  server_key text unique,
  handle text unique,
  handle_consumed boolean default false,
  bound_at timestamptz,
  unbound_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Link challenges (temporary codes for linking)
create table if not exists link_challenges (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  server_id uuid references servers(id) on delete cascade,
  consumed boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Players table
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  uuid uuid unique not null,
  username text not null,
  skin_url text,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  suspicion_score integer default 0,
  total_incidents integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Incidents table
create table if not exists incidents (
  id uuid primary key default uuid_generate_v4(),
  incident_code text unique not null,
  player_id uuid references players(id) on delete cascade,
  server_id uuid references servers(id) on delete cascade,
  category text not null,
  confidence real not null,
  checks jsonb not null default '[]',
  status text default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  replay_size_bytes integer default 0,
  created_at timestamptz default now()
);

-- Player server history
create table if not exists player_servers (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid references players(id) on delete cascade,
  server_id uuid references servers(id) on delete cascade,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  unique(player_id, server_id)
);

-- Staff actions log
create table if not exists staff_actions (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references auth.users(id),
  action text not null,
  target_player_id uuid references players(id),
  target_incident_id uuid references incidents(id),
  details jsonb,
  created_at timestamptz default now()
);

-- Heartbeats (server status)
create table if not exists heartbeats (
  id uuid primary key default uuid_generate_v4(),
  server_id uuid references servers(id) on delete cascade,
  players_online integer default 0,
  tps real default 20,
  plugin_version text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_incidents_player on incidents(player_id);
create index if not exists idx_incidents_server on incidents(server_id);
create index if not exists idx_incidents_status on incidents(status);
create index if not exists idx_incidents_created on incidents(created_at desc);
create index if not exists idx_players_uuid on players(uuid);
create index if not exists idx_players_suspicion on players(suspicion_score desc);
create index if not exists idx_heartbeats_server on heartbeats(server_id);
create index if not exists idx_servers_owner on servers(owner_id);
create index if not exists idx_link_challenges_code on link_challenges(code);
create index if not exists idx_link_challenges_expires on link_challenges(expires_at);

-- Row Level Security
alter table servers enable row level security;
alter table players enable row level security;
alter table incidents enable row level security;
alter table heartbeats enable row level security;
alter table link_challenges enable row level security;

-- Owners can manage their servers
create policy "Owners can view their servers" on servers
  for select using (auth.uid() = owner_id);

create policy "Owners can update their servers" on servers
  for update using (auth.uid() = owner_id);

create policy "Owners can delete their servers" on servers
  for delete using (auth.uid() = owner_id);

create policy "Anyone can create a server" on servers
  for insert with check (auth.uid() = owner_id);

-- Players are readable by authenticated users
create policy "Auth users can view players" on players
  for select using (auth.role() = 'authenticated');

-- Incidents are readable by authenticated users
create policy "Auth users can view incidents" on incidents
  for select using (auth.role() = 'authenticated');

-- Heartbeats readable by authenticated users
create policy "Auth users can view heartbeats" on heartbeats
  for select using (auth.role() = 'authenticated');

-- Link challenges: owners can create and view for their servers
create policy "Owners can insert link challenges" on link_challenges
  for insert with check (
    exists (select 1 from servers where servers.id = link_challenges.server_id and servers.owner_id = auth.uid())
  );

create policy "Owners can view link challenges" on link_challenges
  for select using (
    exists (select 1 from servers where servers.id = link_challenges.server_id and servers.owner_id = auth.uid())
  );

create policy "Owners can update link challenges" on link_challenges
  for update using (
    exists (select 1 from servers where servers.id = link_challenges.server_id and servers.owner_id = auth.uid())
  );

-- Functions
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_servers_updated_at before update on servers
  for each row execute function update_updated_at();

create trigger update_players_updated_at before update on players
  for each row execute function update_updated_at();

-- Cleanup expired link challenges
create or replace function cleanup_expired_challenges()
returns void as $$
begin
  delete from link_challenges where expires_at < now();
end;
$$ language plpgsql;
