create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('member', 'direction', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.member_status as enum ('pending', 'active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.quota_status as enum ('pending', 'paid', 'overdue', 'exempt');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.event_status as enum ('draft', 'open', 'soon', 'sold_out', 'closed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.registration_status as enum ('pending', 'confirmed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending', 'paid', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.post_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.application_status as enum ('new', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.contact_status as enum ('new', 'read', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  number text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  birth_date date,
  joined_at date not null default current_date,
  status public.member_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_quotas (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  year integer not null,
  amount numeric(8, 2) not null default 12,
  status public.quota_status not null default 'pending',
  paid_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, year)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  long_description text not null,
  date_label text not null,
  event_date date,
  time_label text,
  event_time time,
  location text not null,
  price_member text not null,
  price_non_member text not null,
  capacity integer not null default 1,
  status public.event_status not null default 'draft',
  category text not null,
  image_emoji text not null default '🎉',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  member_number text,
  seats integer not null default 1,
  notes text,
  status public.registration_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  cover_emoji text not null default '📸',
  status public.post_status not null default 'draft',
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  birth_date date,
  notes text,
  wants_notifications boolean not null default true,
  accepts_data_treatment boolean not null default false,
  status public.application_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  message text not null,
  status public.contact_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

drop trigger if exists set_member_quotas_updated_at on public.member_quotas;
create trigger set_member_quotas_updated_at
before update on public.member_quotas
for each row
execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

drop trigger if exists set_event_registrations_updated_at on public.event_registrations;
create trigger set_event_registrations_updated_at
before update on public.event_registrations
for each row
execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists set_member_applications_updated_at on public.member_applications;
create trigger set_member_applications_updated_at
before update on public.member_applications
for each row
execute function public.set_updated_at();

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at
before update on public.contact_messages
for each row
execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin', 'direction')
  );
$$;

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.member_quotas enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.posts enable row level security;
alter table public.member_applications enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage members" on public.members;
create policy "Admins can manage members"
on public.members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Members can read own member record" on public.members;
create policy "Members can read own member record"
on public.members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can manage member quotas" on public.member_quotas;
create policy "Admins can manage member quotas"
on public.member_quotas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Members can read own quotas" on public.member_quotas;
create policy "Members can read own quotas"
on public.member_quotas
for select
to authenticated
using (
  exists (
    select 1
    from public.members
    where members.id = member_quotas.member_id
    and members.user_id = auth.uid()
  )
);

drop policy if exists "Public can read published events" on public.events;
create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
on public.events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can create event registrations" on public.event_registrations;
create policy "Public can create event registrations"
on public.event_registrations
for insert
to anon, authenticated
with check (
  seats > 0
  and exists (
    select 1
    from public.events
    where events.id = event_registrations.event_id
    and events.is_published = true
    and events.status = 'open'
  )
);

drop policy if exists "Admins can manage event registrations" on public.event_registrations;
create policy "Admins can manage event registrations"
on public.event_registrations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
on public.posts
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can create member applications" on public.member_applications;
create policy "Public can create member applications"
on public.member_applications
for insert
to anon, authenticated
with check (accepts_data_treatment = true);

drop policy if exists "Admins can manage member applications" on public.member_applications;
create policy "Admins can manage member applications"
on public.member_applications
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can create contact messages" on public.contact_messages;
create policy "Public can create contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can manage contact messages" on public.contact_messages;
create policy "Admins can manage contact messages"
on public.contact_messages
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


create or replace function public.create_admin_member(
  p_full_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_birth_date date,
  p_status public.member_status,
  p_notes text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
  member_number text;
begin
  if not public.is_admin() then
    raise exception 'Sem autorização para criar sócios.';
  end if;

  /*
   * Impede duas operações de calcularem o número
   * seguinte ao mesmo tempo.
   */
  perform pg_advisory_xact_lock(
    hashtext('ccd-member-number-generation')
  );

  select
    coalesce(
      max(
        case
          when number ~ '^[0-9]+$'
            then number::integer
          else null
        end
      ),
      0
    ) + 1
  into next_number
  from public.members;

  member_number :=
    lpad(next_number::text, 3, '0');

  insert into public.members (
    user_id,
    number,
    full_name,
    email,
    phone,
    address,
    birth_date,
    joined_at,
    status,
    notes
  )
  values (
    null,
    member_number,
    trim(p_full_name),
    trim(p_email),
    trim(p_phone),
    trim(p_address),
    p_birth_date,
    current_date,
    p_status,
    nullif(trim(p_notes), '')
  );

  return member_number;
end;
$$;

revoke all
on function public.create_admin_member(
  text,
  text,
  text,
  text,
  date,
  public.member_status,
  text
)
from public;

grant execute
on function public.create_admin_member(
  text,
  text,
  text,
  text,
  date,
  public.member_status,
  text
)
to authenticated;

create or replace function public.update_my_member_contact(
  p_phone text,
  p_address text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Não existe uma sessão autenticada.';
  end if;

  if nullif(trim(p_phone), '') is null then
    raise exception 'O telefone é obrigatório.';
  end if;

  if nullif(trim(p_address), '') is null then
    raise exception 'A morada é obrigatória.';
  end if;

  update public.members
  set
    phone = trim(p_phone),
    address = trim(p_address)
  where user_id = current_user_id;

  if not found then
    raise exception 'Não existe nenhum sócio associado a esta conta.';
  end if;
end;
$$;

revoke all
on function public.update_my_member_contact(text, text)
from public;

grant execute
on function public.update_my_member_contact(text, text)
to authenticated;