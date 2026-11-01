create table if not exists creatures (
  wallet text primary key,
  creature_id text not null,
  save jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);

create index if not exists creatures_creature_id on creatures (creature_id);

create table if not exists hatches (
  id bigserial primary key,
  wallet text not null,
  owner_name text not null default 'friend',
  tx text,
  applied_at timestamptz
);

create index if not exists hatches_pending on hatches (id) where applied_at is null;
