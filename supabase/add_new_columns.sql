-- Migration script để thêm các cột mới vào bảng plan_responses
-- Chạy script này trong Supabase SQL editor

create or replace function public.add_new_columns_to_plan_responses()
returns void
language plpgsql
as $$
begin
  -- Thêm cột professional_orientation nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'professional_orientation'
  ) then
    alter table public.plan_responses
    add column professional_orientation jsonb;
  end if;

  -- Thêm cột strategic_products nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'strategic_products'
  ) then
    alter table public.plan_responses
    add column strategic_products jsonb;
  end if;

  -- Thêm cột new_services_2026 nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'new_services_2026'
  ) then
    alter table public.plan_responses
    add column new_services_2026 jsonb;
  end if;

  -- Thêm cột recruitment nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'recruitment'
  ) then
    alter table public.plan_responses
    add column recruitment jsonb;
  end if;

  -- Thêm cột conferences nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'conferences'
  ) then
    alter table public.plan_responses
    add column conferences jsonb;
  end if;

  -- Thêm cột community_programs nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'community_programs'
  ) then
    alter table public.plan_responses
    add column community_programs jsonb;
  end if;

  -- Thêm cột revenue_recommendations nếu chưa tồn tại
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'plan_responses'
      and column_name = 'revenue_recommendations'
  ) then
    alter table public.plan_responses
    add column revenue_recommendations jsonb;
  end if;
end;
$$;

-- Chạy function để thêm các cột
select public.add_new_columns_to_plan_responses();

-- Xóa function sau khi chạy xong
drop function public.add_new_columns_to_plan_responses();

