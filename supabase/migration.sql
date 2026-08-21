-- Migration: Fix link_challenges RLS + simplify linking
-- Run this in Supabase SQL Editor

-- Drop and recreate link_challenges with proper schema
drop table if exists link_challenges;

create table if not exists link_challenges (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  server_id uuid references servers(id) on delete cascade,
  consumed boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists idx_link_challenges_code on link_challenges(code);
create index if not exists idx_link_challenges_expires on link_challenges(expires_at);

-- Enable RLS and add policies
alter table link_challenges enable row level security;

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

-- Clean up handle column from servers
alter table servers drop column if exists handle;
