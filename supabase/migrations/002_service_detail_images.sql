-- Add detail/finish image URLs for service pages
alter table public.services
  add column if not exists detail_image_url text,
  add column if not exists finish_image_url text;
