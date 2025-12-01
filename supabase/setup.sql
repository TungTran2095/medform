-- Chạy script này trong Supabase SQL editor để tạo bảng lưu phản hồi
-- cùng với các RLS policies cần thiết.

create extension if not exists "pgcrypto";

create or replace function public.ensure_plan_responses()
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'plan_responses'
  ) then
    create table public.plan_responses (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default timezone('utc'::text, now()),
      unit_name text not null,
      unit_type text not null,
      unit_leader text not null,
      planner text not null,
      swot jsonb not null,
      bsc jsonb not null,
      action_plans jsonb not null,
      financial_forecast jsonb not null,
      commitment boolean not null default false
    );
  end if;

  alter table public.plan_responses enable row level security;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'plan_responses'
      and policyname = 'plan_responses_insert_anon'
  ) then
    create policy plan_responses_insert_anon
      on public.plan_responses
      for insert
      with check (auth.role() = 'anon');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'plan_responses'
      and policyname = 'plan_responses_read_service'
  ) then
    create policy plan_responses_read_service
      on public.plan_responses
      for select
      using (auth.role() = 'service_role');
  end if;
end;
$$;

select public.ensure_plan_responses();

drop function public.ensure_plan_responses();

