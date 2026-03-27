'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Bug, 
  ShieldAlert, 
  Leaf,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon,
  Droplets,
  Scissors,
  Sprout,
  Shovel,
  Apple,
  Search,
  Settings,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from 'next-themes';
import type { Section } from '@/lib/types';
import {
  categories,
  cultures,
  articles,
  diseases,
  pests,
  MONTHS,
  MOON_PHASES,
  generateCalendarMonth,
  getCultureBySlug,
  getArticleBySlug,
  getDiseaseBySlug,
  getPestBySlug
} from '@/lib/data';
import { APP_VERSION } from '@/lib/constants';
import { usePWA } from '@/hooks/use-pwa';
import { InstallBanner } from '@/components/InstallBanner';
import { IOSInstallBanner } from '@/components/IOSInstallBanner';

// Типы данных
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  order: number;
}

interface Culture {
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

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string;
  tags: string | null;
}

interface Disease {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  symptoms: string | null;
  causes: string | null;
  treatment: string | null;
  prevention: string | null;
}

interface Pest {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  damage: string | null;
  signs: string | null;
  control: string | null;
  prevention: string | null;
}

interface MoonDay {
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

export default function GardenManager() {
  // PWA functionality
  const { canInstall, isStandalone, isInstalled, install, needsUpdate, applyUpdate } = usePWA();
  
  // Состояние навигации
  const [section, setSection] = useState<Section>('home');
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // UI состояние
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Theme
  const { theme, setTheme } = useTheme();
  
  // Календарь на текущий месяц
  const [calendarMonth, setCalendarMonth] = useState<MoonDay[]>([]);
  
  // Mounted state для hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Генерация календаря при смене месяца
  useEffect(() => {
    setCalendarMonth(generateCalendarMonth(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  // Фильтрация культур по поиску
  const filteredCultures = cultures.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Фильтрация культур по категории
  const culturesByCategory = selectedCategory 
    ? filteredCultures.filter(c => c.categoryId === categories.find(cat => cat.slug === selectedCategory)?.id)
    : filteredCultures;

  // Парсинг markdown содержания статьи
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-primary">{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold my-1">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('- **')) {
        const parts = line.slice(2).split('**:');
        return (
          <p key={index} className="my-1 ml-4">
            <span className="font-semibold">{parts[0]}:</span>{parts[1]}
          </p>
        );
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 my-1">{line.slice(2)}</li>;
      } else if (line.match(/^\d\./)) {
        return <li key={index} className="ml-4 my-1 list-decimal">{line.slice(3)}</li>;
      } else if (line.startsWith('| ')) {
        return null;
      } else if (line.trim() === '---') {
        return <hr key={index} className="my-4 border-border" />;
      } else if (line.trim()) {
        return <p key={index} className="my-2">{line}</p>;
      }
      return null;
    });
  };

  // Извлечение оглавления из markdown
  const extractTOC = (content: string) => {
    const lines = content.split('\n');
    const toc: { id: string; title: string; level: number }[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        toc.push({ id: line.slice(3).toLowerCase().replace(/\s+/g, '-'), title: line.slice(3), level: 2 });
      } else if (line.startsWith('### ')) {
        toc.push({ id: line.slice(4).toLowerCase().replace(/\s+/g, '-'), title: line.slice(4), level: 3 });
      }
    });
    
    return toc;
  };

  // Навигация
  const navigate = (newSection: Section) => {
    setSection(newSection);
    setSelectedCulture(null);
    setSelectedArticle(null);
    setSelectedDisease(null);
    setSelectedPest(null);
    setSelectedCategory(null);
    setMenuOpen(false);
  };

  const goBack = () => {
    if (selectedCulture || selectedArticle || selectedDisease || selectedPest) {
      setSelectedCulture(null);
      setSelectedArticle(null);
      setSelectedDisease(null);
      setSelectedPest(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate('home');
    }
  };

  // Получить текущий день
  const today = new Date().toISOString().split('T')[0];
  const todayData = calendarMonth.find(d => d.date === today);

  // Навигационное меню
  const NavMenu = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`flex ${mobile ? 'flex-col gap-2' : 'gap-1'}`}>
      <Button
        variant={section === 'home' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('home')}
      >
        <Home className="h-5 w-5" />
        Главная
      </Button>
      <Button
        variant={section === 'calendar' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('calendar')}
      >
        <Calendar className="h-5 w-5" />
        Календарь
      </Button>
      <Button
        variant={section === 'catalog' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('catalog')}
      >
        <Leaf className="h-5 w-5" />
        Каталог
      </Button>
      <Button
        variant={section === 'articles' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('articles')}
      >
        <BookOpen className="h-5 w-5" />
        Статьи
      </Button>
      <Button
        variant={section === 'diseases' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('diseases')}
      >
        <ShieldAlert className="h-5 w-5" />
        Болезни
      </Button>
      <Button
        variant={section === 'pests' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('pests')}
      >
        <Bug className="h-5 w-5" />
        Вредители
      </Button>
      <Button
        variant={section === 'settings' ? 'default' : 'ghost'}
        className={`justify-start gap-3 ${mobile ? 'w-full' : ''}`}
        onClick={() => navigate('settings')}
      >
        <Settings className="h-5 w-5" />
        Настройки
      </Button>
    </nav>
  );

  // Главный экран
  const HomePage = () => (
    <div className="space-y-6">
      {/* Приветствие */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">🌱 Садовый менеджер</h1>
        <p className="text-muted-foreground">Ваш справочник по уходу за садом и огородом</p>
      </div>

      {/* Сегодня в календаре */}
      {todayData && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Сегодня {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{MOON_PHASES[todayData.moonPhase]}</span>
              <div>
                <p className="font-semibold">{todayData.moonPhaseName}</p>
                <p className="text-sm text-muted-foreground">
                  {todayData.zodiacSign} • {todayData.zodiacElement}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {todayData.isGoodForSowing && <Badge variant="secondary"><Sprout className="h-3 w-3 mr-1" /> Посев</Badge>}
              {todayData.isGoodForPlanting && <Badge variant="secondary"><Leaf className="h-3 w-3 mr-1" /> Посадка</Badge>}
              {todayData.isGoodForTransplanting && <Badge variant="secondary"><Apple className="h-3 w-3 mr-1" /> Пересадка</Badge>}
              {todayData.isGoodForWatering && <Badge variant="secondary"><Droplets className="h-3 w-3 mr-1" /> Полив</Badge>}
              {todayData.isGoodForFertilizing && <Badge variant="secondary"><Sun className="h-3 w-3 mr-1" /> Подкормка</Badge>}
              {todayData.isGoodForPruning && <Badge variant="secondary"><Scissors className="h-3 w-3 mr-1" /> Обрезка</Badge>}
              {todayData.isGoodForHarvesting && <Badge variant="secondary"><Moon className="h-3 w-3 mr-1" /> Сбор урожая</Badge>}
              {todayData.isGoodForSoilWork && <Badge variant="secondary"><Shovel className="h-3 w-3 mr-1" /> Почва</Badge>}
              {todayData.isForbidden && <Badge variant="destructive">Запрещённый день</Badge>}
            </div>
            {todayData.recommendation && (
              <p className="mt-3 text-sm">{todayData.recommendation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Быстрые разделы */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('calendar')}>
          <CardContent className="p-6 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Лунный календарь</h3>
            <p className="text-sm text-muted-foreground">Фазы луны и рекомендации</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('catalog')}>
          <CardContent className="p-6 text-center">
            <Leaf className="h-10 w-10 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Каталог культур</h3>
            <p className="text-sm text-muted-foreground">Овощи, цветы, ягоды</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('articles')}>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Статьи</h3>
            <p className="text-sm text-muted-foreground">Обучающие материалы</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('diseases')}>
          <CardContent className="p-6 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-destructive" />
            <h3 className="font-semibold">Болезни</h3>
            <p className="text-sm text-muted-foreground">Описание и лечение</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('pests')}>
          <CardContent className="p-6 text-center">
            <Bug className="h-10 w-10 mx-auto mb-2 text-destructive" />
            <h3 className="font-semibold">Вредители</h3>
            <p className="text-sm text-muted-foreground">Методы борьбы</p>
          </CardContent>
        </Card>
      </div>

      {/* Категории культур */}
      <div>
        <h2 className="text-xl font-bold mb-4">Категории культур</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map(cat => {
            const count = cultures.filter(c => c.categoryId === cat.id).length;
            return (
              <Card 
                key={cat.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => { setSelectedCategory(cat.slug); setSection('catalog'); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{count} культур</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Последние статьи */}
      <div>
        <h2 className="text-xl font-bold mb-4">Последние статьи</h2>
        <div className="space-y-3">
          {articles.slice(0, 3).map(article => (
            <Card 
              key={article.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedArticle(article)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Лунный календарь
  const CalendarPage = () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Лунный посевной календарь
      </h1>

      {/* Выбор месяца */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" size="icon" onClick={() => {
          if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
          } else {
            setCurrentMonth(currentMonth - 1);
          }
        }}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">{MONTHS[currentMonth - 1]} {currentYear}</h2>
        </div>
        
        <Button variant="outline" size="icon" onClick={() => {
          if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
          } else {
            setCurrentMonth(currentMonth + 1);
          }
        }}>
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      {/* Быстрый выбор месяца */}
      <div className="flex flex-wrap gap-1 justify-center">
        {MONTHS.map((m, i) => (
          <Button
            key={i}
            variant={currentMonth === i + 1 ? 'default' : 'outline'}
            size="sm"
            className="text-xs px-2"
            onClick={() => setCurrentMonth(i + 1)}
          >
            {m.slice(0, 3)}
          </Button>
        ))}
      </div>

      {/* Календарь */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground p-1">
                {d}
              </div>
            ))}
          </div>
          
          {/* Дни */}
          <div className="grid grid-cols-7 gap-1">
            {/* Пустые ячейки для выравнивания */}
            {Array.from({ length: new Date(currentYear, currentMonth - 1, 1).getDay() || 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {calendarMonth.map(day => {
              const isToday = day.date === today;
              return (
                <div
                  key={day.date}
                  className={`aspect-square p-1 rounded-lg text-center cursor-pointer transition-colors
                    ${isToday ? 'ring-2 ring-primary bg-primary/10' : ''}
                    ${day.isForbidden ? 'bg-destructive/20' : ''}
                    ${day.isGoodForSowing || day.isGoodForPlanting ? 'bg-primary/20' : ''}
                    hover:bg-accent
                  `}
                  title={`${day.moonPhaseName}\n${day.zodiacSign}\n${day.recommendation || ''}`}
                >
                  <div className="text-xs sm:text-sm font-medium">{day.day}</div>
                  <div className="text-lg sm:text-xl">{MOON_PHASES[day.moonPhase]}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Легенда */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Легенда</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span>Благоприятно</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/20" />
              <span>Запрещено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-primary" />
              <span>Сегодня</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌑🌒🌓🌔🌕🌖🌗🌘</span>
              <span>Фазы</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Рекомендации по фазам */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Рекомендации по фазам</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <span className="text-2xl">🌑</span>
            <div>
              <p className="font-semibold">Новолуние</p>
              <p className="text-sm text-muted-foreground">Отдых. Не сажать и не пересаживать.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🌒🌓🌔</span>
            <div>
              <p className="font-semibold">Растущая луна</p>
              <p className="text-sm text-muted-foreground">Посев и посадка растений надземной части.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🌕</span>
            <div>
              <p className="font-semibold">Полнолуние</p>
              <p className="text-sm text-muted-foreground">Сбор урожая, заготовки.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🌖🌗🌘</span>
            <div>
              <p className="font-semibold">Убывающая луна</p>
              <p className="text-sm text-muted-foreground">Корнеплоды, луковичные, обрезка, пересадка.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Каталог культур
  const CatalogPage = () => (
    <div className="space-y-4">
      {!selectedCategory && !selectedCulture ? (
        <>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            Каталог культур
          </h1>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск культур..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Категории */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Все
            </Button>
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>

          {/* Список культур */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {culturesByCategory.map(culture => {
              const cat = categories.find(c => c.id === culture.categoryId);
              return (
                <Card
                  key={culture.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCulture(getCultureBySlug(culture.slug) as Culture)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                        {cat?.icon || '🌱'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{culture.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat?.name}</p>
                      </div>
                    </div>
                    {culture.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {culture.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : selectedCulture ? (
        <CultureDetail culture={selectedCulture} onBack={goBack} />
      ) : (
        <CategoryDetail 
          category={categories.find(c => c.slug === selectedCategory)!}
          cultures={culturesByCategory}
          onSelectCulture={(slug) => setSelectedCulture(getCultureBySlug(slug) as Culture)}
          onBack={goBack}
        />
      )}
    </div>
  );

  // Детальная страница культуры
  const CultureDetail = ({ culture, onBack }: { culture: Culture; onBack: () => void }) => {
    const cat = categories.find(c => c.id === culture.categoryId);
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{cat?.icon || '🌱'}</span>
              <div>
                <CardTitle className="text-2xl">{culture.name}</CardTitle>
                <CardDescription>{cat?.name}</CardDescription>
              </div>
            </div>
          </CardHeader>
          {culture.description && (
            <CardContent>
              <p className="text-muted-foreground">{culture.description}</p>
            </CardContent>
          )}
        </Card>

        <Accordion type="multiple" className="w-full">
          {culture.history && (
            <AccordionItem value="history">
              <AccordionTrigger>📜 История</AccordionTrigger>
              <AccordionContent>{culture.history}</AccordionContent>
            </AccordionItem>
          )}

          {culture.plantingTime && (
            <AccordionItem value="planting">
              <AccordionTrigger>🌱 Когда сажать</AccordionTrigger>
              <AccordionContent>{culture.plantingTime}</AccordionContent>
            </AccordionItem>
          )}

          {culture.careTips && (
            <AccordionItem value="care">
              <AccordionTrigger>💚 Уход</AccordionTrigger>
              <AccordionContent>{culture.careTips}</AccordionContent>
            </AccordionItem>
          )}

          {culture.watering && (
            <AccordionItem value="watering">
              <AccordionTrigger>💧 Полив</AccordionTrigger>
              <AccordionContent>{culture.watering}</AccordionContent>
            </AccordionItem>
          )}

          {culture.fertilizing && (
            <AccordionItem value="fertilizing">
              <AccordionTrigger>🧪 Удобрение</AccordionTrigger>
              <AccordionContent>{culture.fertilizing}</AccordionContent>
            </AccordionItem>
          )}

          {culture.harvesting && (
            <AccordionItem value="harvesting">
              <AccordionTrigger>🧺 Сбор урожая</AccordionTrigger>
              <AccordionContent>{culture.harvesting}</AccordionContent>
            </AccordionItem>
          )}

          {culture.storage && (
            <AccordionItem value="storage">
              <AccordionTrigger>🏠 Хранение</AccordionTrigger>
              <AccordionContent>{culture.storage}</AccordionContent>
            </AccordionItem>
          )}

          {(culture.goodNeighbors || culture.badNeighbors) && (
            <AccordionItem value="neighbors">
              <AccordionTrigger>🌿 Совместимость</AccordionTrigger>
              <AccordionContent>
                {culture.goodNeighbors && (
                  <div className="mb-2">
                    <p className="font-semibold text-primary">✅ Хорошие соседи:</p>
                    <p>{culture.goodNeighbors}</p>
                  </div>
                )}
                {culture.badNeighbors && (
                  <div>
                    <p className="font-semibold text-destructive">❌ Плохие соседи:</p>
                    <p>{culture.badNeighbors}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    );
  };

  // Детальная страница категории
  const CategoryDetail = ({ category, cultures, onSelectCulture, onBack }: {
    category: Category;
    cultures: Culture[];
    onSelectCulture: (slug: string) => void;
    onBack: () => void;
  }) => (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Назад
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <CardTitle className="text-2xl">{category.name}</CardTitle>
              {category.description && <CardDescription>{category.description}</CardDescription>}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cultures.map(c => (
          <Card
            key={c.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectCulture(c.slug)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold">{c.name}</h3>
              {c.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Статьи
  const ArticlesPage = () => (
    <div className="space-y-4">
      {!selectedArticle ? (
        <>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Обучающие статьи
          </h1>

          <div className="space-y-3">
            {articles.map(article => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedArticle(article)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {article.tags?.split(',').map(tag => (
                      <Badge key={tag} variant="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <ArticleDetail article={selectedArticle} onBack={goBack} />
      )}
    </div>
  );

  // Детальная страница статьи
  const ArticleDetail = ({ article, onBack }: { article: Article; onBack: () => void }) => {
    const toc = extractTOC(article.content);
    
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{article.title}</CardTitle>
            {article.excerpt && <CardDescription>{article.excerpt}</CardDescription>}
          </CardHeader>
        </Card>

        {/* Оглавление */}
        {toc.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Оглавление</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {toc.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm text-primary hover:underline ${item.level === 3 ? 'ml-4' : ''}`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* Содержание */}
        <Card>
          <CardContent className="prose prose-sm max-w-none py-4">
            {renderMarkdown(article.content)}
          </CardContent>
        </Card>

        {/* Теги */}
        {article.tags && (
          <div className="flex flex-wrap gap-1">
            {article.tags.split(',').map(tag => (
              <Badge key={tag} variant="secondary">{tag.trim()}</Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Болезни
  const DiseasesPage = () => (
    <div className="space-y-4">
      {!selectedDisease ? (
        <>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" />
            Болезни растений
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {diseases.map(disease => (
              <Card
                key={disease.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedDisease(disease)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{disease.name}</CardTitle>
                  <Badge variant="outline">{disease.type}</Badge>
                </CardHeader>
                <CardContent>
                  {disease.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{disease.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <DiseaseDetail disease={selectedDisease} onBack={goBack} />
      )}
    </div>
  );

  // Детальная страница болезни
  const DiseaseDetail = ({ disease, onBack }: { disease: Disease; onBack: () => void }) => (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Назад
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{disease.name}</CardTitle>
            <Badge>{disease.type}</Badge>
          </div>
          {disease.description && <CardDescription>{disease.description}</CardDescription>}
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="w-full">
        {disease.symptoms && (
          <AccordionItem value="symptoms">
            <AccordionTrigger>🔍 Симптомы</AccordionTrigger>
            <AccordionContent>{disease.symptoms}</AccordionContent>
          </AccordionItem>
        )}

        {disease.causes && (
          <AccordionItem value="causes">
            <AccordionTrigger>⚡ Причины</AccordionTrigger>
            <AccordionContent>{disease.causes}</AccordionContent>
          </AccordionItem>
        )}

        {disease.treatment && (
          <AccordionItem value="treatment">
            <AccordionTrigger>💊 Лечение</AccordionTrigger>
            <AccordionContent>{disease.treatment}</AccordionContent>
          </AccordionItem>
        )}

        {disease.prevention && (
          <AccordionItem value="prevention">
            <AccordionTrigger>🛡️ Профилактика</AccordionTrigger>
            <AccordionContent>{disease.prevention}</AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );

  // Вредители
  const PestsPage = () => (
    <div className="space-y-4">
      {!selectedPest ? (
        <>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Вредители
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pests.map(pest => (
              <Card
                key={pest.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPest(pest)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pest.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {pest.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{pest.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <PestDetail pest={selectedPest} onBack={goBack} />
      )}
    </div>
  );

  // Детальная страница вредителя
  const PestDetail = ({ pest, onBack }: { pest: Pest; onBack: () => void }) => (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Назад
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{pest.name}</CardTitle>
          {pest.description && <CardDescription>{pest.description}</CardDescription>}
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="w-full">
        {pest.damage && (
          <AccordionItem value="damage">
            <AccordionTrigger>⚠️ Наносимый вред</AccordionTrigger>
            <AccordionContent>{pest.damage}</AccordionContent>
          </AccordionItem>
        )}

        {pest.signs && (
          <AccordionItem value="signs">
            <AccordionTrigger>🔍 Признаки</AccordionTrigger>
            <AccordionContent>{pest.signs}</AccordionContent>
          </AccordionItem>
        )}

        {pest.control && (
          <AccordionItem value="control">
            <AccordionTrigger>🎯 Методы борьбы</AccordionTrigger>
            <AccordionContent>{pest.control}</AccordionContent>
          </AccordionItem>
        )}

        {pest.prevention && (
          <AccordionItem value="prevention">
            <AccordionTrigger>🛡️ Профилактика</AccordionTrigger>
            <AccordionContent>{pest.prevention}</AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );

  // Страница настроек
  const SettingsPage = () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Настройки
      </h1>

      {/* Тема */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {mounted && theme === 'dark' ? <Moon className="h-5 w-5" /> : 
             mounted && theme === 'light' ? <Sun className="h-5 w-5" /> : 
             <Monitor className="h-5 w-5" />}
            Тема оформления
          </CardTitle>
          <CardDescription>Выберите предпочитаемую тему</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-5 w-5" />
              <span className="text-xs">Светлая</span>
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Тёмная</span>
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-xs">Авто</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Разработчик */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Разработчик</CardTitle>
          <CardDescription>Связаться с разработчиком</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="https://t.me/gettocode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍💻</span>
              <div>
                <p className="font-semibold">@gettocode</p>
                <p className="text-sm text-muted-foreground">Telegram</p>
              </div>
            </div>
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>

      {/* О приложении */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">О приложении</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Версия</span>
            <Badge variant="secondary">{APP_VERSION}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Платформа</span>
            <span className="font-medium">PWA</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Язык</span>
            <span className="font-medium">Русский</span>
          </div>
        </CardContent>
      </Card>

      {/* Возможности */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Возможности</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Лунный посевной календарь
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Каталог культур с описанием
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Обучающие статьи
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Справочник болезней
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Справочник вредителей
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Работает офлайн
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  // Рендер контента
  const renderContent = () => {
    switch (section) {
      case 'home':
        return <HomePage />;
      case 'calendar':
        return <CalendarPage />;
      case 'catalog':
        return <CatalogPage />;
      case 'articles':
        return <ArticlesPage />;
      case 'diseases':
        return <DiseasesPage />;
      case 'pests':
        return <PestsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Мобильное меню */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <button 
              onClick={() => navigate('home')}
              className="flex items-center gap-2 font-bold text-primary"
            >
              <span className="text-xl">🌱</span>
              <span className="hidden sm:inline">Садовый менеджер</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex">
            <NavMenu />
          </nav>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-background"
            >
              <div className="p-4">
                <NavMenu mobile />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={section + (selectedCulture?.id || '') + (selectedArticle?.id || '') + (selectedDisease?.id || '') + (selectedPest?.id || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="container px-4 py-4 text-center text-sm text-muted-foreground">
          <p>🌱 Садовый менеджер — справочник садовода</p>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-bottom">
        <div className="flex justify-around py-2">
          <Button
            variant={section === 'home' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2 px-3"
            onClick={() => navigate('home')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Главная</span>
          </Button>
          <Button
            variant={section === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2 px-3"
            onClick={() => navigate('calendar')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Календарь</span>
          </Button>
          <Button
            variant={section === 'catalog' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2 px-3"
            onClick={() => navigate('catalog')}
          >
            <Leaf className="h-5 w-5" />
            <span className="text-xs">Каталог</span>
          </Button>
          <Button
            variant={section === 'articles' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2 px-3"
            onClick={() => navigate('articles')}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Статьи</span>
          </Button>
          <Button
            variant={section === 'settings' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2 px-3"
            onClick={() => navigate('settings')}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Ещё</span>
          </Button>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16" />

      {/* Update notification */}
      {needsUpdate && (
        <div className="fixed top-4 left-4 right-4 z-[60] max-w-md mx-auto">
          <Card className="bg-primary text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className="font-semibold text-sm">Доступно обновление</p>
                    <p className="text-xs opacity-90">Новая версия приложения</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={applyUpdate}
                  className="shrink-0"
                >
                  Обновить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PWA Install Banners */}
      <InstallBanner
        onInstall={install}
        canInstall={canInstall}
        isInstalled={isInstalled}
      />
      <IOSInstallBanner
        isStandalone={isStandalone}
        isInstalled={isInstalled}
      />
    </div>
  );
}
