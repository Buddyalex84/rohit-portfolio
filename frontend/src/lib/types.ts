export type ColorOption = {
  id: number;
  slug: string;
  name: string;
  hex_value: string;
};

export type Fabric = {
  id: number;
  slug: string;
  name: string;
  description: string;
  texture_note: string;
  image: string;
};

export type SuitType = {
  id: number;
  slug: string;
  name: string;
  description: string;
  includes_trousers: boolean;
  includes_waistcoat: boolean;
  image: string;
};

export type CustomizationOption = {
  id: number;
  group: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  is_preference_prompt: boolean;
  viewer_variant: string;
  sort_order: number;
};

export type MeasurementField = {
  id: number;
  key: string;
  label: string;
  instruction: string;
  min_cm: string;
  max_cm: string;
  sort_order: number;
};

export type StandardSize = {
  id: number;
  code: string;
  label: string;
  sort_order: number;
};

export type GarmentModel3D = {
  id: number;
  name: string;
  category: string;
  src: string;
  procedural_preset: string;
  supported_options: Record<string, boolean>;
  material_slots: Record<string, string>;
  fallback_note: string;
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  sort_order: number;
  supports_suit_types: boolean;
  customization_groups: string[];
  suit_types: SuitType[];
  product_count?: number;
  options?: CustomizationOption[];
  measurement_fields?: MeasurementField[];
  sizes?: StandardSize[];
  models_3d?: GarmentModel3D[];
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  garment_type: string;
  description: string;
  image: string;
  category: string;
  suit_type: string | null;
  starting_price: string | null;
  quote_only: boolean;
  price_label: string;
  colors: ColorOption[];
  fabrics: Fabric[];
  gallery?: { id: number; image: string; alt_text: string }[];
};

export type SiteSettings = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  map_embed_url: string;
  instagram_url: string;
  facebook_url: string;
  max_upload_mb: number;
  email_configured: boolean;
  contact_configured: boolean;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
