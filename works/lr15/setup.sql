-- ЛР15. Виконуйте блоками в SQL Editor (той самий проєкт, що й у ЛР12, таблиця public.games)

-- 1. Таблиця ролей
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin'))
);

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from anon, authenticated;

-- 2. Подивіться UUID двох створених у Authentication -> Users користувачів
select id, email from auth.users order by created_at;

-- 3. Підставте свої UUID (без зміни лапок) і виконайте
insert into public.user_roles (user_id, role)
values
  ('UUID_ЗВИЧАЙНОГО_КОРИСТУВАЧА', 'user'),
  ('UUID_АДМІНІСТРАТОРА', 'admin');

select u.email, r.role
from public.user_roles as r
join auth.users as u on u.id = r.user_id
order by u.email;

-- 4. Функція перевірки адміністратора (для політик RLS)
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- 5. Нові політики для таблиці games
drop policy if exists "Public can add games" on public.games;
drop policy if exists "Public can read games" on public.games;

revoke all on table public.games from anon, authenticated;
grant select on table public.games to anon, authenticated;
grant insert (title, genre, players) on table public.games to authenticated;
grant update (title, genre, players) on table public.games to authenticated;
grant delete on table public.games to authenticated;

create policy "Games can be read"
on public.games for select
to anon, authenticated
using (true);

create policy "Admins can insert games"
on public.games for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update games"
on public.games for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete games"
on public.games for delete
to authenticated
using ((select private.is_admin()));

-- 6. Функція для інтерфейсу (повертає true/false)
create or replace function public.check_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.check_admin() from public, anon, authenticated;
grant execute on function public.check_admin() to authenticated;
