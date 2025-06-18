// src/hooks/useTheme.ts

import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// -------------------------------------------------------------
// DEFINIÇÃO DAS INTERFACES PARA AS CORES DO TEMA
// -------------------------------------------------------------

// Interface para as cores do tema
export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  subText: string;
  primary: string;
  secondary: string;
  success: string;
  error: string; // Adicionado 'error' para lidar com mensagens de erro
  borderColor: string;
  headerBackground: string;
  shadowColor: string;
  headerIcon: string;
  locationTextHeaderColor: string; // Cor específica para o texto do cabeçalho de localização
  icon: string; // Cor para ícones gerais
  errorText: string; // Cor para texto de erro
}

// Objeto de temas (claro e escuro)
const lightTheme: ThemeColors = {
  background: '#f0f2f5',
  cardBackground: '#ffffff',
  text: '#333333',
  subText: '#666666',
  primary: '#007BFF',
  secondary: '#6C757D',
  success: '#28A745',
  error: '#DC3545',
  borderColor: '#e0e0e0',
  headerBackground: '#ffffff',
  shadowColor: '#000',
  headerIcon: '#007BFF',
  locationTextHeaderColor: '#333333',
  icon: '#333333',
  errorText: '#DC3545',
};

const darkTheme: ThemeColors = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#E0E0E0',
  subText: '#B0B0B0',
  primary: '#BB86FC',
  secondary: '#03DAC6',
  success: '#66BB6A',
  error: '#CF6679',
  borderColor: '#333333',
  headerBackground: '#1E1E1E',
  shadowColor: '#fff', // Sombra clara para tema escuro
  headerIcon: '#BB86FC',
  locationTextHeaderColor: '#E0E0E0',
  icon: '#E0E0E0',
  errorText: '#CF6679',
};

// -------------------------------------------------------------
// HOOK useTheme
// -------------------------------------------------------------

// O hook agora retorna um objeto que inclui as cores do tema (themeColors),
// o tema atual (currentTheme) e se o tema é escuro (isDark)
// E uma função para alternar o tema (toggleTheme) - se você quiser adicionar um botão no futuro
export const useTheme = () => {
  const colorScheme = useColorScheme(); // 'light' ou 'dark' do sistema
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(colorScheme || 'light');

  useEffect(() => {
    // Atualiza o tema se o esquema de cores do sistema mudar
    if (colorScheme) {
      setCurrentTheme(colorScheme);
    }
  }, [colorScheme]);

  const themeColors: ThemeColors = currentTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = currentTheme === 'dark';

  // Função para alternar o tema manualmente (opcional, para um botão de tema, por exemplo)
  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Retorna um objeto com todas as propriedades necessárias
  return {
    themeColors, // O objeto de cores específico do tema
    currentTheme,
    isDark,
    toggleTheme, // A função para alternar o tema
  };
};