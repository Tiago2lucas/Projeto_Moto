import { useState } from 'react';
import {  useColorScheme, LayoutAnimation } from 'react-native';
import { Colors } from '../utils/colors';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [userSelectedTheme, setUserSelectedTheme] = useState<'light' | 'dark' | null>(null);

  const currentTheme: 'light' | 'dark' = userSelectedTheme || systemColorScheme || 'light';
  const themeColors = Colors[currentTheme];

  const toggleAppTheme = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUserSelectedTheme((prevTheme: 'light' | 'dark' | null) => { // <-- CORREÇÃO AQUI
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return null; // Volta para o tema do sistema
      return systemColorScheme === 'light' ? 'dark' : 'light';
    });
  };

  return { currentTheme, themeColors, toggleAppTheme };
};