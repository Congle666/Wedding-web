/**
 * Template metadata state held by TemplateBuilderPage outside of the
 * `TemplateConfig` JSON. These fields map to columns on the templates table.
 */
export interface TemplateMetadata {
  name: string;
  slug: string;
  category_id?: number;
  description: string;
  price_per_day: number;
  price_per_month: number;
  is_free: boolean;
  is_active: boolean;
  thumbnail_url: string;
}
