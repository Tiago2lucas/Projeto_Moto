// src/components/Header.tsx

import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Para o ícone de adição

interface HeaderProps {
  title: string;
  themeColors: any;
  onAddLocationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, themeColors, onAddLocationPress }) => {
  return (
    <View style={[
      styles.headerContainer,
      { backgroundColor: themeColors.headerBackground, borderBottomColor: themeColors.border }
    ]}>
      <Text style={[styles.headerTitle, { color: themeColors.text }]}>{title}</Text>
      {onAddLocationPress && (
        <TouchableOpacity style={styles.addButton} onPress={onAddLocationPress}>
          <MaterialIcons name="add-location-alt" size={28} color={themeColors.headerIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    // --- MUDANÇA AQUI: Adicionado (StatusBar.currentHeight ?? 0) ---
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    // ---------------------------------------------------------------
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    padding: 5,
    marginLeft: 15,
  }
});