/**
 * Built-in cities for users who don't share their location.
 * Coordinates are city centres; prayer times barely change within a city.
 */
export type City = {
  id: string;
  name: { en: string; ar: string };
  country: { en: string; ar: string };
  countryCode: string;
  latitude: number;
  longitude: number;
};

type Row = [id: string, en: string, ar: string, cc: string, lat: number, lng: number];

const COUNTRIES: Record<string, { en: string; ar: string }> = {
  SA: { en: 'Saudi Arabia', ar: 'السعودية' },
  EG: { en: 'Egypt', ar: 'مصر' },
  AE: { en: 'United Arab Emirates', ar: 'الإمارات' },
  QA: { en: 'Qatar', ar: 'قطر' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
  BH: { en: 'Bahrain', ar: 'البحرين' },
  OM: { en: 'Oman', ar: 'عُمان' },
  JO: { en: 'Jordan', ar: 'الأردن' },
  PS: { en: 'Palestine', ar: 'فلسطين' },
  LB: { en: 'Lebanon', ar: 'لبنان' },
  SY: { en: 'Syria', ar: 'سوريا' },
  IQ: { en: 'Iraq', ar: 'العراق' },
  YE: { en: 'Yemen', ar: 'اليمن' },
  SD: { en: 'Sudan', ar: 'السودان' },
  LY: { en: 'Libya', ar: 'ليبيا' },
  TN: { en: 'Tunisia', ar: 'تونس' },
  DZ: { en: 'Algeria', ar: 'الجزائر' },
  MA: { en: 'Morocco', ar: 'المغرب' },
  MR: { en: 'Mauritania', ar: 'موريتانيا' },
  SO: { en: 'Somalia', ar: 'الصومال' },
  TR: { en: 'Türkiye', ar: 'تركيا' },
  IR: { en: 'Iran', ar: 'إيران' },
  PK: { en: 'Pakistan', ar: 'باكستان' },
  IN: { en: 'India', ar: 'الهند' },
  BD: { en: 'Bangladesh', ar: 'بنغلاديش' },
  ID: { en: 'Indonesia', ar: 'إندونيسيا' },
  MY: { en: 'Malaysia', ar: 'ماليزيا' },
  SG: { en: 'Singapore', ar: 'سنغافورة' },
  NG: { en: 'Nigeria', ar: 'نيجيريا' },
  KE: { en: 'Kenya', ar: 'كينيا' },
  ZA: { en: 'South Africa', ar: 'جنوب أفريقيا' },
  GB: { en: 'United Kingdom', ar: 'المملكة المتحدة' },
  FR: { en: 'France', ar: 'فرنسا' },
  DE: { en: 'Germany', ar: 'ألمانيا' },
  NL: { en: 'Netherlands', ar: 'هولندا' },
  BE: { en: 'Belgium', ar: 'بلجيكا' },
  SE: { en: 'Sweden', ar: 'السويد' },
  RU: { en: 'Russia', ar: 'روسيا' },
  US: { en: 'United States', ar: 'الولايات المتحدة' },
  CA: { en: 'Canada', ar: 'كندا' },
  AU: { en: 'Australia', ar: 'أستراليا' },
};

const ROWS: Row[] = [
  ['makkah', 'Makkah', 'مكة المكرمة', 'SA', 21.4225, 39.8262],
  ['madinah', 'Madinah', 'المدينة المنورة', 'SA', 24.4686, 39.6142],
  ['riyadh', 'Riyadh', 'الرياض', 'SA', 24.7136, 46.6753],
  ['jeddah', 'Jeddah', 'جدة', 'SA', 21.4858, 39.1925],
  ['dammam', 'Dammam', 'الدمام', 'SA', 26.4207, 50.0888],
  ['cairo', 'Cairo', 'القاهرة', 'EG', 30.0444, 31.2357],
  ['alexandria', 'Alexandria', 'الإسكندرية', 'EG', 31.2001, 29.9187],
  ['dubai', 'Dubai', 'دبي', 'AE', 25.2048, 55.2708],
  ['abu-dhabi', 'Abu Dhabi', 'أبوظبي', 'AE', 24.4539, 54.3773],
  ['doha', 'Doha', 'الدوحة', 'QA', 25.2854, 51.531],
  ['kuwait-city', 'Kuwait City', 'مدينة الكويت', 'KW', 29.3759, 47.9774],
  ['manama', 'Manama', 'المنامة', 'BH', 26.2285, 50.586],
  ['muscat', 'Muscat', 'مسقط', 'OM', 23.588, 58.3829],
  ['amman', 'Amman', 'عمّان', 'JO', 31.9454, 35.9284],
  ['jerusalem', 'Jerusalem', 'القدس', 'PS', 31.7683, 35.2137],
  ['gaza', 'Gaza', 'غزة', 'PS', 31.5017, 34.4668],
  ['beirut', 'Beirut', 'بيروت', 'LB', 33.8938, 35.5018],
  ['damascus', 'Damascus', 'دمشق', 'SY', 33.5138, 36.2765],
  ['baghdad', 'Baghdad', 'بغداد', 'IQ', 33.3152, 44.3661],
  ['sanaa', "Sana'a", 'صنعاء', 'YE', 15.3694, 44.191],
  ['khartoum', 'Khartoum', 'الخرطوم', 'SD', 15.5007, 32.5599],
  ['tripoli', 'Tripoli', 'طرابلس', 'LY', 32.8872, 13.1913],
  ['tunis', 'Tunis', 'تونس', 'TN', 36.8065, 10.1815],
  ['algiers', 'Algiers', 'الجزائر', 'DZ', 36.7538, 3.0588],
  ['casablanca', 'Casablanca', 'الدار البيضاء', 'MA', 33.5731, -7.5898],
  ['rabat', 'Rabat', 'الرباط', 'MA', 34.0209, -6.8416],
  ['nouakchott', 'Nouakchott', 'نواكشوط', 'MR', 18.0735, -15.9582],
  ['mogadishu', 'Mogadishu', 'مقديشو', 'SO', 2.0469, 45.3182],
  ['istanbul', 'Istanbul', 'إسطنبول', 'TR', 41.0082, 28.9784],
  ['ankara', 'Ankara', 'أنقرة', 'TR', 39.9334, 32.8597],
  ['tehran', 'Tehran', 'طهران', 'IR', 35.6892, 51.389],
  ['karachi', 'Karachi', 'كراتشي', 'PK', 24.8607, 67.0011],
  ['lahore', 'Lahore', 'لاهور', 'PK', 31.5204, 74.3587],
  ['islamabad', 'Islamabad', 'إسلام آباد', 'PK', 33.6844, 73.0479],
  ['delhi', 'Delhi', 'دلهي', 'IN', 28.6139, 77.209],
  ['dhaka', 'Dhaka', 'دكا', 'BD', 23.8103, 90.4125],
  ['jakarta', 'Jakarta', 'جاكرتا', 'ID', -6.2088, 106.8456],
  ['kuala-lumpur', 'Kuala Lumpur', 'كوالالمبور', 'MY', 3.139, 101.6869],
  ['singapore', 'Singapore', 'سنغافورة', 'SG', 1.3521, 103.8198],
  ['lagos', 'Lagos', 'لاغوس', 'NG', 6.5244, 3.3792],
  ['nairobi', 'Nairobi', 'نيروبي', 'KE', -1.2921, 36.8219],
  ['johannesburg', 'Johannesburg', 'جوهانسبرغ', 'ZA', -26.2041, 28.0473],
  ['london', 'London', 'لندن', 'GB', 51.5074, -0.1278],
  ['birmingham', 'Birmingham', 'برمنغهام', 'GB', 52.4862, -1.8904],
  ['paris', 'Paris', 'باريس', 'FR', 48.8566, 2.3522],
  ['berlin', 'Berlin', 'برلين', 'DE', 52.52, 13.405],
  ['amsterdam', 'Amsterdam', 'أمستردام', 'NL', 52.3676, 4.9041],
  ['brussels', 'Brussels', 'بروكسل', 'BE', 50.8503, 4.3517],
  ['stockholm', 'Stockholm', 'ستوكهولم', 'SE', 59.3293, 18.0686],
  ['moscow', 'Moscow', 'موسكو', 'RU', 55.7558, 37.6173],
  ['new-york', 'New York', 'نيويورك', 'US', 40.7128, -74.006],
  ['chicago', 'Chicago', 'شيكاغو', 'US', 41.8781, -87.6298],
  ['houston', 'Houston', 'هيوستن', 'US', 29.7604, -95.3698],
  ['los-angeles', 'Los Angeles', 'لوس أنجلوس', 'US', 34.0522, -118.2437],
  ['toronto', 'Toronto', 'تورونتو', 'CA', 43.6532, -79.3832],
  ['sydney', 'Sydney', 'سيدني', 'AU', -33.8688, 151.2093],
];

export const CITIES: readonly City[] = ROWS.map(([id, en, ar, cc, latitude, longitude]) => ({
  id,
  name: { en, ar },
  country: COUNTRIES[cc] ?? { en: cc, ar: cc },
  countryCode: cc,
  latitude,
  longitude,
}));

export function findCity(id: string | undefined): City | undefined {
  return id ? CITIES.find((c) => c.id === id) : undefined;
}

/** Case/diacritic-insensitive search over English and Arabic city and country names. */
export function searchCities(query: string): readonly City[] {
  const q = normalize(query);
  if (!q) return CITIES;
  return CITIES.filter((c) =>
    [c.name.en, c.name.ar, c.country.en, c.country.ar].some((s) => normalize(s).includes(q)),
  );
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ًͯ-ْ]/g, '') // Latin accents + Arabic harakat
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();
}
