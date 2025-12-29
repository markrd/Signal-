-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENTITIES (Knowledge Graph Nouns)
create table public.entities (
  id uuid default uuid_generate_v4() primary key,
  name text not null, 
  type text not null check (type in ('CATEGORY', 'TECH_STACK')), 
  synonyms text[] default '{}', 
  related_ids uuid[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (name, type)
);

alter table public.entities enable row level security;
create policy "Entities are viewable by everyone" on public.entities
  for select using (true);

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  role text check (role in ('HUNTER', 'SIGNAL')),
  email text,
  full_name text,
  company text,
  avatar_url text,
  bio text,
  budget text,
  verified boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select using ( true );

create policy "Users can insert their own profile."
  on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update using ( auth.uid() = id );

-- LISTINGS (Marketplace Items)
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text check (type in ('access', 'pitch')),
  title text not null,
  description text,
  price integer not null,
  tags text[],
  hooks text[],
  location text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone."
  on listings for select using ( true );

create policy "Users can insert their own listings."
  on listings for insert with check ( auth.uid() = user_id );

-- BIDS / BOOKINGS
create table public.bids (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  bidder_id uuid references public.profiles(id) not null,
  owner_id uuid references public.profiles(id) not null,
  amount integer not null,
  message text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bids enable row level security;

create policy "Users can see bids they sent or received."
  on bids for select using ( auth.uid() = bidder_id or auth.uid() = owner_id );

create policy "Users can create bids."
  on bids for insert with check ( auth.uid() = bidder_id );

-- MEETINGS (Confirmed events)
create table public.meetings (
  id uuid default uuid_generate_v4() primary key,
  bid_id uuid references public.bids(id) not null,
  host_id uuid references public.profiles(id) not null,
  guest_id uuid references public.profiles(id) not null,
  scheduled_at timestamp with time zone,
  status text default 'scheduled',
  meeting_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meetings enable row level security;

create policy "Participants can view meetings."
  on meetings for select using ( auth.uid() = host_id or auth.uid() = guest_id );
