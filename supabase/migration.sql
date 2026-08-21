-- Migration: Remove handle-based linking, switch to code-only flow
-- Run this in Supabase SQL Editor if you already created the schema

-- Drop old link_challenges table and recreate
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

-- Clean up handle column from servers if it exists
alter table servers drop column if exists handle;
