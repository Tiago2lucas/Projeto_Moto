import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

interface HeaderProps {
  themeColors: any; // Ajustar o tipo se for necessário
  userLocation: string;
  locationErrorMsg: string | null;
  toggleAppTheme: () => void;
  currentTheme: 'light' | 'dark';
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  handleSearch: () => void;
}

export const Header = ({
  themeColors,
  userLocation,
  locationErrorMsg,
  toggleAppTheme,
  currentTheme,
  searchQuery,
  setSearchQuery,
  handleSearch,
}: HeaderProps) => {
  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <View style={dynamicStyles.header}>
      <View style={dynamicStyles.headerTop}>
        <TouchableOpacity style={dynamicStyles.backButton} onPress={() => console.log('Botão Voltar Pressionado')}>
          <AntDesign name="arrowleft" size={24} color={themeColors.headerIcon} />
        </TouchableOpacity>
        <Text style={dynamicStyles.appTitle}>Borracharia App</Text>
        <TouchableOpacity
          style={dynamicStyles.themeToggleButton}
          onPress={toggleAppTheme}
        >
          <MaterialIcons name={currentTheme === 'light' ? 'wb-sunny' : 'nightlight-round'} size={24} color={themeColors.headerIcon} />
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.headerBottom}>
        <TouchableOpacity
          style={dynamicStyles.locationDisplay}
          onPress={() => locationErrorMsg ? Alert.alert('Erro de Localização', locationErrorMsg) : Alert.alert('Localização', `Sua localização atual: ${userLocation}.`)}
        >
          <MaterialIcons name="location-on" size={18} color={themeColors.primary} />
          <Text style={dynamicStyles.locationTextHeader}>
            {userLocation}
          </Text>
        </TouchableOpacity>

        <View style={dynamicStyles.searchBarContainer}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor={themeColors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={dynamicStyles.searchButton} onPress={handleSearch}>
            <AntDesign name="search1" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Movido para fora para evitar re-renderização desnecessária, usando o tema diretamente.
const getThemedStyles = (themeColors: any) => StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 40,
    backgroundColor: themeColors.headerBackground,
    borderBottomWidth: 0,
    paddingBottom: 15,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: themeColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: themeColors.shadowColor === '#000' ? 0.1 : 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.text,
    marginLeft: 10,
    flex: 1,
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: themeColors.cardBackground,
    flexShrink: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: themeColors.borderColor,
  },
  locationTextHeader: {
    fontSize: 12,
    color: themeColors.locationTextHeaderColor,
    marginLeft: 4,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    backgroundColor: themeColors.cardBackground,
    borderRadius: 20,
    height: 40,
    paddingLeft: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    color: themeColors.text,
  },
  searchButton: {
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleButton: { // Estilos para o botão de tema
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});