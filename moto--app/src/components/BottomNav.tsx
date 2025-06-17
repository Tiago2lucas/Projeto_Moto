import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface BottomNavProps {
  themeColors: any;
}

export const BottomNav = ({ themeColors }: BottomNavProps) => {
  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <View style={dynamicStyles.bottomNav}>
      {/* Conteúdo da barra de navegação inferior pode ser adicionado aqui, se desejar */}
      {/* Exemplo:
      <TouchableOpacity style={dynamicStyles.navItem}>
        <MaterialIcons name="home" size={24} color={themeColors.text} />
        <Text style={dynamicStyles.navText}>Home</Text>
      </TouchableOpacity>
      */}
    </View>
  );
};

const getThemedStyles = (themeColors: any) => StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: themeColors.cardBackground,
    height: 65,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  // navItem: {
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // navText: {
  //   fontSize: 12,
  //   color: themeColors.text,
  // },
});