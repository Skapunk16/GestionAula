import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'classic_slate',
    name: 'Institucional Slate',
    tagline: 'Azul sobrio y pizarra, el estándar corporativo universitario.',
    category: 'Clásico',
    isDark: false,
    palette: {
      primary: '#2563eb',
      secondary: '#4f46e5',
      accent: '#0284c7',
      background: '#f8fafc',
      card: '#ffffff',
      border: '#e2e8f0',
      text: '#0f172a',
    },
  },
  {
    id: 'minimal_white',
    name: 'Minimalista Swiss',
    tagline: 'Inspirado en el diseño suizo y Apple: blanco puro, acentos monocromáticos y tipografía nítida.',
    category: 'Clásico',
    isDark: false,
    palette: {
      primary: '#18181b',
      secondary: '#27272a',
      accent: '#52525b',
      background: '#ffffff',
      card: '#ffffff',
      border: '#e4e4e7',
      text: '#09090b',
    },
  },
  {
    id: 'midnight_dark',
    name: 'Midnight OLED',
    tagline: 'Modo oscuro profundo tipo GitHub/Spotify para reducir fatiga visual.',
    category: 'Modo Oscuro',
    isDark: true,
    palette: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#38bdf8',
      background: '#090d16',
      card: '#111827',
      border: '#1f2937',
      text: '#f8fafc',
    },
  },
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Tech',
    tagline: 'Negro espacial con reflejos cian y magenta neón de alta energía técnica.',
    category: 'Modo Oscuro',
    isDark: true,
    palette: {
      primary: '#06b6d4',
      secondary: '#d946ef',
      accent: '#22d3ee',
      background: '#030712',
      card: '#0f172a',
      border: '#0284c7',
      text: '#e0f2fe',
    },
  },
  {
    id: 'emerald_campus',
    name: 'Verde Campus',
    tagline: 'Tonos esmeralda y salvia inspirados en campus botánicos y sustentabilidad.',
    category: 'Colorido',
    isDark: false,
    palette: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      card: '#ffffff',
      border: '#bbf7d0',
      text: '#064e3b',
    },
  },
  {
    id: 'sunset_amber',
    name: 'Cálido Terracota',
    tagline: 'Tonos arcilla, ámbar y arena cálida que transmiten cercanía y lectura descansada.',
    category: 'Colorido',
    isDark: false,
    palette: {
      primary: '#d97706',
      secondary: '#ea580c',
      accent: '#f59e0b',
      background: '#fffdf5',
      card: '#ffffff',
      border: '#fde68a',
      text: '#78350f',
    },
  },
  {
    id: 'royal_purple',
    name: 'Púrpura Velvet',
    tagline: 'Elegancia moderna en violeta e índigo imperial con acentos lavanda.',
    category: 'Colorido',
    isDark: false,
    palette: {
      primary: '#7c3aed',
      secondary: '#6366f1',
      accent: '#a855f7',
      background: '#faf5ff',
      card: '#ffffff',
      border: '#e9d5ff',
      text: '#4c1d95',
    },
  },
  {
    id: 'high_contrast',
    name: 'Alto Contraste B&W',
    tagline: 'Bordes negros puros y legibilidad absoluta sin distracciones (Estándar WCAG AAA).',
    category: 'Accesibilidad',
    isDark: false,
    palette: {
      primary: '#000000',
      secondary: '#171717',
      accent: '#000000',
      background: '#ffffff',
      card: '#ffffff',
      border: '#000000',
      text: '#000000',
    },
  },
];

interface ThemeContextType {
  currentTheme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (themeId: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'gestion_escolar_v2_theme_style';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'classic_slate';
  });

  const themeConfig = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  const setTheme = (themeId: ThemeId) => {
    if (THEMES.some((t) => t.id === themeId)) {
      setCurrentTheme(themeId);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
      } catch {
        // Storage failure fallback
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    if (themeConfig.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme, themeConfig.isDark]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        setTheme,
        availableThemes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
