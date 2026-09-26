alter table yupai_sessions
  add column if not exists transfer_attempts integer not null default 0;
