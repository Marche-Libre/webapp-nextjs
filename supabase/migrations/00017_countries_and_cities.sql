create extension if not exists pgcrypto;

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  flag text not null,
  is_francophone boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_id uuid not null references public.countries(id) on delete cascade,
  region text,
  created_at timestamptz not null default now(),
  unique (name, country_id)
);

create index if not exists idx_cities_country_id on public.cities(country_id);
create index if not exists idx_cities_name on public.cities(name);

insert into public.countries (name, code, flag, is_francophone)
values
  ('France', 'FR', '🇫🇷', true),
  ('Belgique', 'BE', '🇧🇪', true),
  ('Suisse', 'CH', '🇨🇭', true),
  ('Canada', 'CA', '🇨🇦', true),
  ('Maroc', 'MA', '🇲🇦', true),
  ('Tunisie', 'TN', '🇹🇳', true),
  ('Sénégal', 'SN', '🇸🇳', true),
  ('Côte d''Ivoire', 'CI', '🇨🇮', true),
  ('États-Unis', 'US', '🇺🇸', false),
  ('Royaume-Uni', 'GB', '🇬🇧', false),
  ('Allemagne', 'DE', '🇩🇪', false),
  ('Espagne', 'ES', '🇪🇸', false),
  ('Italie', 'IT', '🇮🇹', false),
  ('Portugal', 'PT', '🇵🇹', false),
  ('Luxembourg', 'LU', '🇱🇺', true),
  ('Monaco', 'MC', '🇲🇨', true),
  ('Pays-Bas', 'NL', '🇳🇱', false),
  ('Algérie', 'DZ', '🇩🇿', true),
  ('Cameroun', 'CM', '🇨🇲', true),
  ('Gabon', 'GA', '🇬🇦', true),
  ('Maurice', 'MU', '🇲🇺', true),
  ('Madagascar', 'MG', '🇲🇬', true),
  ('La Réunion', 'RE', '🇷🇪', true),
  ('Guadeloupe', 'GP', '🇬🇵', true),
  ('Martinique', 'MQ', '🇲🇶', true)
on conflict (code) do nothing;
