-- Supabase RLS policies for the ERP app.
-- Run this in the Supabase SQL editor if inserts/updates/deletes are blocked
-- with "new row violates row-level security policy".

-- Importers
alter table if exists public.importers enable row level security;

drop policy if exists "Authenticated users can read importers" on public.importers;
create policy "Authenticated users can read importers"
on public.importers
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert importers" on public.importers;
create policy "Authenticated users can insert importers"
on public.importers
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update importers" on public.importers;
create policy "Authenticated users can update importers"
on public.importers
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete importers" on public.importers;
create policy "Authenticated users can delete importers"
on public.importers
for delete
to authenticated
using (true);

-- Exporters
alter table if exists public.exporters enable row level security;

drop policy if exists "Authenticated users can read exporters" on public.exporters;
create policy "Authenticated users can read exporters"
on public.exporters
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert exporters" on public.exporters;
create policy "Authenticated users can insert exporters"
on public.exporters
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update exporters" on public.exporters;
create policy "Authenticated users can update exporters"
on public.exporters
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete exporters" on public.exporters;
create policy "Authenticated users can delete exporters"
on public.exporters
for delete
to authenticated
using (true);

-- Importer addresses
alter table if exists public.importer_addresses enable row level security;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'importer_addresses'
      and column_name = 'address_line1'
  ) then
    alter table public.importer_addresses add column address_line1 text not null default '';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'importer_addresses'
      and column_name = 'is_default'
  ) then
    alter table public.importer_addresses add column is_default boolean not null default false;
  end if;
end $$;

drop policy if exists "Authenticated users can read importer addresses" on public.importer_addresses;
create policy "Authenticated users can read importer addresses"
on public.importer_addresses
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert importer addresses" on public.importer_addresses;
create policy "Authenticated users can insert importer addresses"
on public.importer_addresses
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update importer addresses" on public.importer_addresses;
create policy "Authenticated users can update importer addresses"
on public.importer_addresses
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete importer addresses" on public.importer_addresses;
create policy "Authenticated users can delete importer addresses"
on public.importer_addresses
for delete
to authenticated
using (true);

-- Exporter addresses
alter table if exists public.exporter_addresses enable row level security;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'exporter_addresses'
      and column_name = 'address_line1'
  ) then
    alter table public.exporter_addresses add column address_line1 text not null default '';
  end if;
end $$;

drop policy if exists "Authenticated users can read exporter addresses" on public.exporter_addresses;
create policy "Authenticated users can read exporter addresses"
on public.exporter_addresses
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert exporter addresses" on public.exporter_addresses;
create policy "Authenticated users can insert exporter addresses"
on public.exporter_addresses
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update exporter addresses" on public.exporter_addresses;
create policy "Authenticated users can update exporter addresses"
on public.exporter_addresses
for update
using (true)
with check (true);

drop policy if exists "Authenticated users can delete exporter addresses" on public.exporter_addresses;
create policy "Authenticated users can delete exporter addresses"
on public.exporter_addresses
for delete
to authenticated
using (true);

-- India Ports
alter table if exists public.india_ports enable row level security;

drop policy if exists "Authenticated users can read india ports" on public.india_ports;
create policy "Authenticated users can read india ports"
on public.india_ports
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert india ports" on public.india_ports;
create policy "Authenticated users can insert india ports"
on public.india_ports
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update india ports" on public.india_ports;
create policy "Authenticated users can update india ports"
on public.india_ports
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete india ports" on public.india_ports;
create policy "Authenticated users can delete india ports"
on public.india_ports
for delete
to authenticated
using (true);

-- China Ports
alter table if exists public.china_ports enable row level security;

drop policy if exists "Authenticated users can read china ports" on public.china_ports;
create policy "Authenticated users can read china ports"
on public.china_ports
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert china ports" on public.china_ports;
create policy "Authenticated users can insert china ports"
on public.china_ports
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update china ports" on public.china_ports;
create policy "Authenticated users can update china ports"
on public.china_ports
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete china ports" on public.china_ports;
create policy "Authenticated users can delete china ports"
on public.china_ports
for delete
to authenticated
using (true);

-- Containers
alter table if exists public.containers enable row level security;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'party'
  ) then
    alter table public.containers add column party text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'cha'
  ) then
    alter table public.containers add column cha text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'shipping_line'
  ) then
    alter table public.containers add column shipping_line text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'port_of_china'
  ) then
    alter table public.containers add column port_of_china text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'bl_no'
  ) then
    alter table public.containers add column bl_no text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'loading_days'
  ) then
    alter table public.containers add column loading_days text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'eta_days'
  ) then
    alter table public.containers add column eta_days text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'containers'
      and column_name = 'document_processed'
  ) then
    alter table public.containers add column document_processed text;
  end if;
end $$;

drop policy if exists "Authenticated users can read containers" on public.containers;
create policy "Authenticated users can read containers"
on public.containers
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert containers" on public.containers;
create policy "Authenticated users can insert containers"
on public.containers
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update containers" on public.containers;
create policy "Authenticated users can update containers"
on public.containers
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete containers" on public.containers;
create policy "Authenticated users can delete containers"
on public.containers
for delete
to authenticated
using (true);

-- Documents
create table if exists public.documents (
  id uuid primary key default gen_random_uuid(),
  container_id uuid references public.containers(id) on delete cascade,
  doc_type text not null,
  file_name text not null,
  file_path text not null,
  uploaded_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table if exists public.documents enable row level security;

drop policy if exists "Authenticated users can read documents" on public.documents;
create policy "Authenticated users can read documents"
on public.documents
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert documents" on public.documents;
create policy "Authenticated users can insert documents"
on public.documents
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update documents" on public.documents;
create policy "Authenticated users can update documents"
on public.documents
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete documents" on public.documents;
create policy "Authenticated users can delete documents"
on public.documents
for delete
to authenticated
using (true);
