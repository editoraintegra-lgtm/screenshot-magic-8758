create type public.app_role as enum ('admin','editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
  for each row execute function public.handle_first_admin();

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  section text not null,
  subsection text,
  kind text not null default 'article',
  author_name text,
  cover_url text,
  cover_alt text,
  cover_caption text,
  cover_credit text,
  video_url text,
  audio_url text,
  body jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  status text not null default 'draft',
  published_at timestamptz not null default now(),
  is_main_headline boolean not null default false,
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_pub_idx on public.articles (status, published_at desc);
create index articles_section_idx on public.articles (section, subsection);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "public reads published" on public.articles for select to anon, authenticated
  using (status in ('published','scheduled') and published_at <= now());
create policy "staff read all" on public.articles for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff insert" on public.articles for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "staff update" on public.articles for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "staff delete" on public.articles for delete to authenticated using (public.is_staff(auth.uid()));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "anyone subscribes" on public.newsletter_subscribers for insert to anon, authenticated
  with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) < 255);
create policy "staff reads subscribers" on public.newsletter_subscribers for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff deletes subscribers" on public.newsletter_subscribers for delete to authenticated using (public.is_staff(auth.uid()));

create policy "staff read media" on storage.objects for select to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "staff delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));

insert into public.articles (slug,title,subtitle,section,subsection,kind,author_name,cover_url,cover_alt,cover_caption,cover_credit,body,status,published_at,is_main_headline,is_featured,is_demo)
select
  'exemplo-' || s.slug,
  '[EXEMPLO] ' || s.title,
  'Texto de demonstração do layout. Este conteúdo é fictício e não descreve fatos reais.',
  s.section, s.subsection, s.kind,
  'Redação (exemplo)',
  s.img, 'Imagem ilustrativa de demonstração', 'Legenda de exemplo para a fotografia de abertura.', 'Imagem ilustrativa',
  '[{"type":"p","text":"Este é um **texto de demonstração** criado apenas para mostrar como a página de reportagem funciona. Nenhuma informação aqui deve ser lida como fato."},{"type":"h2","text":"Intertítulo de exemplo"},{"type":"p","text":"Parágrafos podem conter *itálico*, **negrito** e [links](/busca). O editor pode inserir fotos, galerias, vídeos e áudios em qualquer ponto do texto."},{"type":"quote","text":"Citação de exemplo para demonstrar o estilo tipográfico.","cite":"Fonte de exemplo"},{"type":"image","url":"/demo/archaeology.jpg","caption":"Foto adicional de exemplo, com legenda.","credit":"Imagem ilustrativa"},{"type":"list","items":["Item de lista de exemplo","Segundo item de exemplo","Terceiro item de exemplo"]},{"type":"gallery","images":[{"url":"/demo/city.jpg","caption":"Galeria de exemplo 1","credit":"Imagem ilustrativa"},{"url":"/demo/desert.jpg","caption":"Galeria de exemplo 2","credit":"Imagem ilustrativa"},{"url":"/demo/community.jpg","caption":"Galeria de exemplo 3","credit":"Imagem ilustrativa"}]},{"type":"p","text":"Fim do texto de demonstração."}]'::jsonb,
  'published', now() - (s.ord || ' hours')::interval, s.ord = 0, s.ord between 1 and 4, true
from (values
  (0,'israel-politica','Manchete principal de demonstração para a capa do portal','israel','politica','article','/demo/city.jpg'),
  (1,'oriente-diplomacia','Reportagem de exemplo sobre diplomacia regional','oriente-medio','diplomacia','article','/demo/desert.jpg'),
  (2,'tecnologia-1','Notícia de exemplo da editoria de Tecnologia','tecnologia',null,'article','/demo/tech.jpg'),
  (3,'arqueologia-1','Notícia de exemplo da editoria de Arqueologia','arqueologia',null,'article','/demo/archaeology.jpg'),
  (4,'mundo-judaico-brasil','Notícia de exemplo sobre comunidades no Brasil','mundo-judaico','brasil','article','/demo/community.jpg'),
  (5,'israel-sociedade','Notícia de exemplo de Sociedade','israel','sociedade','article','/demo/city.jpg'),
  (6,'israel-economia','Notícia de exemplo de Economia','israel','economia','article','/demo/tech.jpg'),
  (7,'oriente-seguranca','Notícia de exemplo de Segurança','oriente-medio','seguranca','article','/demo/desert.jpg'),
  (8,'ciencia-1','Notícia de exemplo da editoria de Ciência','ciencia',null,'article','/demo/tech.jpg'),
  (9,'mundo-judaico-europa','Notícia de exemplo sobre comunidades na Europa','mundo-judaico','europa','article','/demo/community.jpg'),
  (10,'especial-1','Grande reportagem de exemplo para a área Especial','especial',null,'article','/demo/archaeology.jpg'),
  (11,'mundo-judaico-america-norte','Notícia de exemplo da América do Norte','mundo-judaico','america-do-norte','article','/demo/community.jpg'),
  (12,'video-1','Vídeo de demonstração do layout','videos',null,'video','/demo/desert.jpg'),
  (13,'mundo-judaico-america-sul','Notícia de exemplo da América do Sul','mundo-judaico','america-do-sul','article','/demo/city.jpg'),
  (14,'mundo-judaico-oceania','Notícia de exemplo de Oceania e África','mundo-judaico','oceania-e-africa','article','/demo/desert.jpg'),
  (15,'israel-politica-2','Segunda notícia de exemplo de Política','israel','politica','article','/demo/community.jpg'),
  (16,'especial-2','Dossiê de exemplo para a área Especial','especial',null,'article','/demo/city.jpg')
) as s(ord,slug,title,section,subsection,kind,img);