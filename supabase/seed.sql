-- Seed data for King of Shades (run AFTER 001_phase2_schema.sql)
-- Safe to re-run: uses ON CONFLICT where possible

insert into public.site_settings (business_name, phone, email, address_line1, address_line2, social_links, business_hours)
values (
  'King of Shades',
  '(555) 846-2337',
  'kingofshades2025@gmail.com',
  '1420 Chrome Avenue, Bay 7',
  'Metropolis, NJ 90210',
  '[{"label":"Instagram","href":"#","icon":"instagram"},{"label":"Facebook","href":"#","icon":"facebook"}]'::jsonb,
  '[{"day":"Monday – Friday","time":"8:00 AM – 6:00 PM"},{"day":"Saturday","time":"9:00 AM – 4:00 PM"},{"day":"Sunday","time":"Closed"}]'::jsonb
)
on conflict do nothing;

insert into public.content_sections (section_key, title, body, metadata) values
  ('hero_badge', 'Rated 5 stars by 2,100+ drivers', null, '{}'),
  ('hero_title', 'The Royal Standard in Window Tinting', null, '{"highlight":"Window Tinting"}'),
  ('hero_subtitle', null, 'Premium automotive, residential, and commercial tint plus custom vinyl — installed by certified technicians and backed by a lifetime warranty.', '{}'),
  ('hero_card_left', 'Up to 88%', 'Infrared heat rejected', '{"icon":"snowflake"}'),
  ('hero_card_right', '99% UV', 'Blocked', '{"icon":"shield"}'),
  ('hero_visual', 'Precision-cut, bubble-free finish', 'Nano-ceramic heat rejection', '{"badge":"Ceramic 20%"}'),
  ('homepage_stats', null, null, '{"items":[{"label":"Vehicles Tinted","value":"12,400+"},{"label":"5-Star Reviews","value":"2,100+"},{"label":"Years in Business","value":"15"},{"label":"Warranty","value":"Lifetime"}]}'),
  ('feature_strip', null, null, '{"items":[{"label":"UV Protection","icon":"sun"},{"label":"Heat Rejection","icon":"snowflake"},{"label":"Glare Reduction","icon":"eye"},{"label":"Lifetime Warranty","icon":"shield"}]}'),
  ('about_section', 'A tint shop obsessed with the details', 'King of Shades was founded on one belief: tinting is craftsmanship, not a commodity. Every piece of film is computer-cut and hand-applied in our dust-controlled bays, then inspected to a standard most shops never reach.', '{"eyebrow":"Who We Are","bullets":["Manufacturer-certified installers","Premium ceramic & carbon films only","Transparent, itemized pricing","Lifetime workmanship warranty"],"visual_label":"15 years of flawless installs","visual_sublabel":"Dust-controlled install bays","stat_value":"12k+","stat_label":"Vehicles tinted"}'),
  ('services_section', 'Tint solutions for every surface', 'From show cars to storefronts, we have a film and a finish for the job.', '{"eyebrow":"What We Do"}'),
  ('why_choose_section', 'The difference is in the finish', 'Anyone can stick film on glass. We deliver a result you''ll be proud of for as long as you own it.', '{"eyebrow":"Why King of Shades","items":[{"title":"Lifetime Warranty","description":"Every install is backed by a lifetime workmanship guarantee against bubbling, peeling, and fading.","icon":"shield"},{"title":"Certified Installers","description":"Factory-trained, manufacturer-certified technicians with thousands of flawless installs.","icon":"badge"},{"title":"Premium Films Only","description":"We exclusively use top-tier nano-ceramic and carbon films — never cheap dyed alternatives.","icon":"gem"},{"title":"Same-Week Booking","description":"Fast scheduling and most vehicles completed in a single visit, often the same day.","icon":"clock"}]}'),
  ('before_after_section', 'Before & after', 'Drag the slider to reveal how our film tames glare and heat while elevating the look.', '{"eyebrow":"See the Difference","slider_label":"Automotive — Ceramic 20%","cards":[{"title":"Glare gone","text":"Harsh reflections cut for safer, easier driving."},{"title":"Cooler cabin","text":"Surface temps drop dramatically in direct sun."},{"title":"Refined look","text":"A clean, uniform shade that complements any build."}]}'),
  ('process_section', 'A simple, four-step process', null, '{"eyebrow":"How It Works","steps":[{"step":"01","title":"Consult & Quote","description":"Tell us your goals and get a transparent, itemized estimate."},{"step":"02","title":"Choose Your Film","description":"Pick the perfect shade and performance tier with expert guidance."},{"step":"03","title":"Precision Install","description":"Computer-cut film applied in our dust-controlled install bays."},{"step":"04","title":"Cure & Enjoy","description":"Drive away with care instructions and a lifetime warranty."}]}'),
  ('testimonials_section', 'Trusted by thousands of drivers & owners', null, '{"eyebrow":"Customer Love","rating_text":"4.9 average · 2,100+ reviews"}'),
  ('cta_band', 'Ready to upgrade your shade?', 'Book your appointment online or request a free, no-obligation quote. Most vehicles done same day.', '{}'),
  ('cta_band_gallery', 'Want your ride in our gallery?', 'Book your install and join thousands of clean, cool, and protected vehicles and properties.', '{}'),
  ('footer_tagline', null, 'Premium automotive, residential, and commercial window tinting plus custom decals and vinyl graphics — installed by certified pros and backed for life.', '{}'),
  ('page_services', 'Premium film for every surface', 'Whether it''s a single windshield or an entire commercial facade, we match the right film to your goals — heat, privacy, security, or pure style.', '{"eyebrow":"Our Services"}'),
  ('page_services_cta', 'Not sure which film is right for you?', 'Tell us about your vehicle or property and we''ll recommend the perfect film and shade — free of charge.', '{}'),
  ('page_gallery', 'A gallery of flawless finishes', 'Real projects across cars, trucks, SUVs, homes, businesses, and custom vinyl.', '{"eyebrow":"Our Work"}'),
  ('page_contact', 'Let''s talk shade', 'Questions, quotes, or fleet inquiries — reach out and our team will get right back to you.', '{"eyebrow":"Contact Us","form_title":"Send us a message","form_subtitle":"Fill out the form and we''ll respond within one business hour."}'),
  ('page_booking', 'Schedule your install', 'Five quick steps to request your appointment. We''ll confirm by email.', '{"eyebrow":"Book Appointment"}')
on conflict (section_key) do update set
  title = excluded.title,
  body = excluded.body,
  metadata = excluded.metadata;

insert into public.services (slug, title, tagline, description, category, price_label, accent, benefits, features, sort_order) values
  ('automotive', 'Automotive Window Tinting', 'Cooler rides, sharper looks, total UV defense.',
   'From daily drivers to show cars, our precision-cut films deliver a flawless finish.',
   'automotive', '$199', 'automotive',
   '["Up to 99% UV rejection","Rejects up to 88% infrared heat","Reduces glare","Protects interior"]'::jsonb,
   '[{"name":"Full Vehicle Packages","detail":"Front, rear & sides cut to spec."},{"name":"Ceramic Tint","detail":"Maximum heat rejection."}]'::jsonb, 0),
  ('residential', 'Residential Window Tinting', 'Comfort, privacy, and lower energy bills at home.',
   'Transform any room with films that cut heat and glare while protecting furnishings.',
   'residential', '$12 / sq ft', 'residential',
   '["Lower cooling costs","Daytime privacy","Glare reduction","UV protection"]'::jsonb,
   '[{"name":"Energy Efficiency","detail":"Reduce hot spots."},{"name":"Privacy Enhancement","detail":"Reflective and frosted films."}]'::jsonb, 1),
  ('commercial', 'Commercial Window Tinting', 'Professional film solutions that protect your bottom line.',
   'Improve tenant comfort, brand your storefront, and harden your glass.',
   'commercial', 'Custom quote', 'commercial',
   '["Cut cooling costs","Professional appearance","Security film options","Employee comfort"]'::jsonb,
   '[{"name":"Office Buildings","detail":"Uniform exterior look."},{"name":"Storefronts","detail":"Branding and sun control."}]'::jsonb, 2),
  ('decals', 'Decals & Vinyl Graphics', 'Custom branding that turns heads on glass and metal.',
   'Custom decals and vinyl graphics from subtle accents to full wraps.',
   'decals', '$89', 'decals',
   '["Fade-resistant designs","Clean removal","Fleet branding","Fast turnaround"]'::jsonb,
   '[{"name":"Custom Decals","detail":"Die-cut decals."},{"name":"Vehicle Graphics","detail":"Wraps and lettering."}]'::jsonb, 3)
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  price_label = excluded.price_label,
  benefits = excluded.benefits,
  features = excluded.features;

insert into public.testimonials (customer_name, role, review, rating, is_approved, sort_order) values
  ('Marcus Reyes', 'Tesla Model 3 Owner', 'The ceramic tint on my Model 3 is flawless — no bubbles, and the cabin stays cool even in July.', 5, true, 0),
  ('Dana Whitfield', 'Homeowner, Hillcrest', 'Our west-facing living room used to be unbearable. After King of Shades tinted the windows, the glare is gone.', 5, true, 1),
  ('Priya Nair', 'Owner, Brew & Co. Café', 'They branded our entire storefront with frosted graphics and tinted the front glass.', 5, true, 2)
on conflict do nothing;

insert into public.gallery_items (title, category, description, tint, sort_order) values
  ('BMW M4 Competition', 'Cars', 'Full ceramic package', '20%', 0),
  ('Ford F-150 Lariat', 'Trucks', 'Cab + rear ceramic', '15%', 1),
  ('Range Rover Sport', 'SUVs', 'Premium ceramic tint', '35%', 2),
  ('Hillside Modern Home', 'Residential', 'Solar control film', null, 3)
on conflict do nothing;

-- After creating your admin user in Supabase Auth, run:
-- insert into public.admin_profiles (id, email, role)
-- values ('YOUR_USER_UUID', 'your@email.com', 'super_admin');
