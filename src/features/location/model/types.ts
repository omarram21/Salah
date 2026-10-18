export type Coordinates = { latitude: number; longitude: number };

export type AppLocation = Coordinates & {
  source: 'gps' | 'city';
  /** Human-readable name, e.g. "Cairo, Egypt". */
  label: string;
  /** ISO 3166-1 alpha-2, when known. */
  countryCode?: string;
  /** For built-in cities, so the label can be shown in the current language. */
  cityId?: string;
};
