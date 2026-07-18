-- Seed data: well-known Buenos Aires landmarks, unowned (user_id null) system pins.
insert into public.locations (lat, lng, location_name, location_image) values
  (-34.6037, -58.3816, 'Obelisco', 'https://picsum.photos/seed/obelisco/800/600'),
  (-34.6084, -58.3702, 'Casa Rosada', 'https://picsum.photos/seed/casa-rosada/800/600'),
  (-34.6345, -58.3631, 'Caminito, La Boca', 'https://picsum.photos/seed/caminito/800/600'),
  (-34.5875, -58.3931, 'Cementerio de la Recoleta', 'https://picsum.photos/seed/recoleta/800/600'),
  (-34.6010, -58.3831, 'Teatro Colón', 'https://picsum.photos/seed/teatro-colon/800/600'),
  (-34.6356, -58.3648, 'La Bombonera', 'https://picsum.photos/seed/bombonera/800/600'),
  (-34.6088, -58.3633, 'Puente de la Mujer', 'https://picsum.photos/seed/puente-mujer/800/600'),
  (-34.5658, -58.4116, 'Planetario Galileo Galilei', 'https://picsum.photos/seed/planetario/800/600'),
  (-34.5951, -58.3934, 'El Ateneo Grand Splendid', 'https://picsum.photos/seed/ateneo/800/600'),
  (-34.6083, -58.3712, 'Plaza de Mayo', 'https://picsum.photos/seed/plaza-mayo/800/600')
on conflict do nothing;
