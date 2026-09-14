-- 1–18 級（含一位小數）存在 skill_rating；skill 維持整數顯示值。
-- 不加 ALTER TYPE，避免已套用 0002 的 PGLite 預覽卡死。

alter table yupai_players
  add column if not exists seed_skill numeric;

alter table yupai_players
  add column if not exists skill_rating numeric;

update yupai_players
set skill = case skill
  when 1 then 3
  when 2 then 6
  when 3 then 10
  when 4 then 14
  when 5 then 17
  else skill
end
where skill between 1 and 5
  and not exists (select 1 from yupai_players x where x.skill > 5);

update yupai_players
set skill_rating = skill
where skill_rating is null;

update yupai_players
set seed_skill = coalesce(skill_rating, skill)
where seed_skill is null;

alter table yupai_sessions
  alter column scoring_enabled set default true;
