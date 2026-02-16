/**
 * Comprehensive list of Lebanese locations for dropdowns and filters.
 * Each entry has a `value` (used for filtering/storage) and a `label` (display text).
 */

export interface LocationOption {
  value: string;
  label: string;
  region?: string; // Parent region for grouping
}

/** Top-level regions used in filter dropdowns */
export const REGION_OPTIONS: LocationOption[] = [
  { value: 'all', label: 'All Locations' },
  { value: 'beirut', label: 'Beirut' },
  { value: 'mount-lebanon', label: 'Mount Lebanon' },
  { value: 'north', label: 'North Lebanon' },
  { value: 'south', label: 'South Lebanon' },
  { value: 'bekaa', label: 'Bekaa' },
];

/** Detailed locations used in profile setup / sign-up */
export const LOCATION_OPTIONS: string[] = [
  // Beirut
  'Achrafieh, Beirut',
  'Hamra, Beirut',
  'Verdun, Beirut',
  'Ras Beirut',
  'Gemmayze, Beirut',
  'Mar Mikhael, Beirut',
  'Badaro, Beirut',
  'Ain el Mreiseh, Beirut',
  'Clemenceau, Beirut',
  'Sassine, Beirut',
  'Furn el Chebbak, Beirut',
  'Msaytbeh, Beirut',
  'Bachoura, Beirut',
  'Mazraa, Beirut',
  'Tariq el Jdideh, Beirut',

  // Mount Lebanon
  'Jounieh',
  'Byblos (Jbeil)',
  'Baabda',
  'Aley',
  'Broummana',
  'Beit Mery',
  'Antelias',
  'Dbayeh',
  'Zouk Mosbeh',
  'Zouk Mikael',
  'Kaslik',
  'Ghazir',
  'Bikfaya',
  'Rabieh',
  'Monteverde',
  'Mansourieh',
  'Naccache',
  'Hazmieh',
  'Sin el Fil',
  'Dekwaneh',
  'Bourj Hammoud',
  'Jal el Dib',
  'Adma',
  'Keserwan',
  'Chouf',
  'Damour',
  'Khaldeh',
  'Aramoun',

  // North Lebanon
  'Tripoli',
  'Mina, Tripoli',
  'Ehden',
  'Zgharta',
  'Batroun',
  'Bcharre',
  'Koura',
  'Chekka',
  'Enfeh',
  'Amioun',
  'Dinniyeh',
  'Akkar',
  'Halba',
  'Sir el Dinniyeh',

  // South Lebanon
  'Saida (Sidon)',
  'Tyre (Sour)',
  'Jezzine',
  'Nabatieh',
  'Bint Jbeil',
  'Marjayoun',
  'Hasbaya',
  'Khiam',
  'Deir el Qamar',
  'Tebnine',

  // Bekaa
  'Zahle',
  'Baalbek',
  'Chtaura',
  'Aanjar',
  'Rachaya',
  'Hermel',
  'Brital',
  'Deir el Ahmar',
  'Joub Jannine',
  'Machghara',
];
