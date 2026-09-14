-- 羽排 same-day singles rotation board
create table if not exists yupai_sessions (
  id text primary key,
  code text not null unique,
  host_token text not null,
  venue_name text not null,
  session_date date not null,
  start_time text not null,
  end_time text not null,
  court_count integer not null default 4,
  match_duration_min integer not null default 12,
  consecutive_limit integer not null default 2,
  force_rest_after_match boolean not null default true,
  ban_recent_opponent boolean not null default false,
  scoring_enabled boolean not null default false,
  weight_wait integer not null default 4,
  weight_plays integer not null default 4,
  weight_rematch integer not null default 3,
  weight_skill integer not null default 1,
  weight_preset text not null default 'fair',
  status text not null default 'active',
  controller_device_id text,
  transfer_pin text,
  transfer_pin_expires_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists yupai_players (
  id text primary key,
  session_id text not null references yupai_sessions(id) on delete cascade,
  nickname text not null,
  skill integer not null default 3,
  is_drop_in boolean not null default false,
  status text not null default 'not_arrived',
  locked boolean not null default false,
  court_no integer,
  consecutive_played integer not null default 0,
  play_count integer not null default 0,
  bye_count integer not null default 0,
  wait_total_sec integer not null default 0,
  play_total_sec integer not null default 0,
  last_wait_start timestamptz,
  last_opponent_id text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists yupai_players_nickname_idx
  on yupai_players (session_id, nickname);

create index if not exists yupai_players_session_idx on yupai_players (session_id);

create table if not exists yupai_restrictions (
  id text primary key,
  session_id text not null references yupai_sessions(id) on delete cascade,
  kind text not null,
  player_a_id text not null,
  player_b_id text not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists yupai_restrictions_session_idx
  on yupai_restrictions (session_id);

create table if not exists yupai_matches (
  id text primary key,
  session_id text not null references yupai_sessions(id) on delete cascade,
  court_no integer not null,
  player_a_id text not null,
  player_b_id text not null,
  started_at timestamptz,
  ended_at timestamptz,
  source text not null default 'manual',
  status text not null default 'live',
  winner_id text,
  score_a integer,
  score_b integer,
  duration_min integer not null,
  extended_sec integer not null default 0,
  pause_accumulated_ms integer not null default 0,
  paused_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists yupai_matches_session_idx on yupai_matches (session_id);

create table if not exists yupai_ops (
  id text primary key,
  session_id text not null references yupai_sessions(id) on delete cascade,
  action text not null,
  before_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists yupai_ops_session_idx
  on yupai_ops (session_id, created_at desc);
