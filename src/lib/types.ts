export interface Location {
  id: string;
  lat: number;
  lng: number;
  location_name: string;
  location_image: string | null;
  user_id: string | null;
  created_at: string;
}
