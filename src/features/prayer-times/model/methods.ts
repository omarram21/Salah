/** AlAdhan calculation methods (GET /v1/methods), minus "custom". */
export type MethodOption = { id: number; name: { en: string; ar: string } };

export const CALCULATION_METHODS: readonly MethodOption[] = [
  { id: 3, name: { en: 'Muslim World League', ar: 'رابطة العالم الإسلامي' } },
  { id: 4, name: { en: 'Umm Al-Qura University, Makkah', ar: 'جامعة أم القرى، مكة المكرمة' } },
  { id: 5, name: { en: 'Egyptian General Authority of Survey', ar: 'الهيئة المصرية العامة للمساحة' } },
  { id: 2, name: { en: 'Islamic Society of North America (ISNA)', ar: 'الجمعية الإسلامية لأمريكا الشمالية' } },
  { id: 1, name: { en: 'University of Islamic Sciences, Karachi', ar: 'جامعة العلوم الإسلامية، كراتشي' } },
  { id: 8, name: { en: 'Gulf Region', ar: 'منطقة الخليج' } },
  { id: 9, name: { en: 'Kuwait', ar: 'الكويت' } },
  { id: 10, name: { en: 'Qatar', ar: 'قطر' } },
  { id: 16, name: { en: 'Dubai', ar: 'دبي' } },
  { id: 23, name: { en: 'Ministry of Awqaf, Jordan', ar: 'وزارة الأوقاف والشؤون والمقدسات الإسلامية، الأردن' } },
  { id: 18, name: { en: 'Tunisia', ar: 'تونس' } },
  { id: 19, name: { en: 'Algeria', ar: 'الجزائر' } },
  { id: 21, name: { en: 'Morocco', ar: 'المغرب' } },
  { id: 13, name: { en: 'Diyanet İşleri Başkanlığı, Turkey', ar: 'رئاسة الشؤون الدينية، تركيا' } },
  { id: 12, name: { en: 'Union Organization Islamic de France', ar: 'اتحاد المنظمات الإسلامية في فرنسا' } },
  { id: 14, name: { en: 'Spiritual Administration of Muslims of Russia', ar: 'الإدارة الدينية لمسلمي روسيا' } },
  { id: 11, name: { en: 'Majlis Ugama Islam Singapura', ar: 'المجلس الإسلامي في سنغافورة' } },
  { id: 17, name: { en: 'JAKIM, Malaysia', ar: 'إدارة التنمية الإسلامية الماليزية (جاكيم)' } },
  { id: 20, name: { en: 'Kementerian Agama, Indonesia', ar: 'وزارة الشؤون الدينية الإندونيسية' } },
  { id: 22, name: { en: 'Comunidade Islamica de Lisboa', ar: 'الجالية الإسلامية في لشبونة' } },
  { id: 15, name: { en: 'Moonsighting Committee Worldwide', ar: 'لجنة رؤية الهلال العالمية' } },
  { id: 7, name: { en: 'Institute of Geophysics, University of Tehran', ar: 'معهد الجيوفيزياء، جامعة طهران' } },
  { id: 0, name: { en: 'Shia Ithna-Ashari, Leva Institute, Qum', ar: 'الشيعة الإثنا عشرية، معهد ليفا، قم' } },
];

export function findMethod(id: number | undefined): MethodOption | undefined {
  return id === undefined ? undefined : CALCULATION_METHODS.find((m) => m.id === id);
}
