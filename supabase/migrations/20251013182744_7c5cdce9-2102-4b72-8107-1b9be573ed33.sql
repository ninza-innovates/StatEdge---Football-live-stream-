-- Create role enum
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policy: Users can view their own roles
create policy "Users can view own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- Policy: Only admins can insert/update/delete roles
create policy "Admins can manage roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Insert admin role for sharif123098@gmail.com
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'sharif123098@gmail.com'
on conflict (user_id, role) do nothing;