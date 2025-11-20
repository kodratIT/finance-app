import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    sparkle: string;
    text: string;
    cardBg: string;
    inputBg: string;
    buttonText: string;
  };
}

export const themes: Record<string, Theme> = {
  purpleDream: {
    name: 'Purple Dream',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      sparkle: '#fbbf24',
      text: '#ffffff',
      cardBg: 'rgba(255, 255, 255, 0.15)',
      inputBg: 'rgba(255, 255, 255, 0.95)',
      buttonText: '#667eea',
    },
  },
  oceanBreeze: {
    name: 'Ocean Breeze',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      sparkle: '#fbbf24',
      text: '#ffffff',
      cardBg: 'rgba(255, 255, 255, 0.15)',
      inputBg: 'rgba(255, 255, 255, 0.95)',
      buttonText: '#0ea5e9',
    },
  },
  sunsetVibes: {
    name: 'Sunset Vibes',
    colors: {
      primary: '#f97316',
      secondary: '#dc2626',
      accent: '#fbbf24',
      sparkle: '#fbbf24',
      text: '#ffffff',
      cardBg: 'rgba(255, 255, 255, 0.15)',
      inputBg: 'rgba(255, 255, 255, 0.95)',
      buttonText: '#f97316',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeKey: string;
  setTheme: (themeKey: string) => Promise<void>;
  allThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<string>('purpleDream');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && themes[savedTheme]) {
        setThemeKey(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (newThemeKey: string) => {
    try {
      if (themes[newThemeKey]) {
        setThemeKey(newThemeKey);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeKey);
      }
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    currentTheme: themes[themeKey],
    themeKey,
    setTheme,
    allThemes: themes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
