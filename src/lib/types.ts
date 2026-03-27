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
  description: string | null;
  history: string | null;
  plantingTime: string | null;
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
  excerpt: string | null;
  content: string;
  tags: string | null;
}

export interface MoonDay {
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
  recommendation: string;
}

// Навигационные разделы
export type Section = 'home' | 'calendar' | 'catalog' | 'articles' | 'settings';
