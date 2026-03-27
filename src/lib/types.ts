// Типы для приложения Садовый менеджер

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  order: number;
}

export interface Culture {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: Category;
  image: string | null;
  description: string | null;
  history: string | null;
  plantingTime: string | null;
  plantingDepth: string | null;
  spacing: string | null;
  careTips: string | null;
  watering: string | null;
  fertilizing: string | null;
  harvesting: string | null;
  storage: string | null;
  goodNeighbors: string | null;
  badNeighbors: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  image: string | null;
  excerpt: string | null;
  content: string;
  tableOfContents: string | null;
  tags: string | null;
}

export interface Disease {
  id: string;
  name: string;
  slug: string;
  type: string;
  image: string | null;
  description: string | null;
  symptoms: string | null;
  causes: string | null;
  treatment: string | null;
  prevention: string | null;
}

export interface Pest {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  damage: string | null;
  signs: string | null;
  control: string | null;
  prevention: string | null;
}

export interface MoonDay {
  id: string;
  date: string;
  year: number;
  month: number;
  day: number;
  moonPhase: string;
  moonPhaseName: string;
  moonDay: number;
  zodiacSign: string;
  zodiacElement: string;
  isGoodForSowing: boolean;
  isGoodForPlanting: boolean;
  isGoodForTransplanting: boolean;
  isGoodForWatering: boolean;
  isGoodForFertilizing: boolean;
  isGoodForPruning: boolean;
  isGoodForHarvesting: boolean;
  isGoodForSoilWork: boolean;
  isForbidden: boolean;
  recommendation: string | null;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

// Навигационные разделы
export type Section = 'home' | 'calendar' | 'catalog' | 'articles' | 'settings';
