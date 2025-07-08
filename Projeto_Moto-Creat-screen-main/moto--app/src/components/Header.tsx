// src/components/Header.tsx

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Importa Location para tipagem de LocationObject

interface HeaderProps {
  themeColors: any;
  userLocation: Location.LocationObject | null; // <--- TIPO CORRIGIDO AQUI
  locationErrorMsg: string | null;
  toggleAppTheme: () => void;
  currentTheme: string;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  handleSearch: () => void;
  onAddLocationPress?: () => void; // Adicionado para a navegação para a tela de cadastro
}

export const Header: React.FC<HeaderProps> = ({
  themeColors,
  userLocation,
  locationErrorMsg,
  toggleAppTheme,
  currentTheme,
  searchQuery,
  setSearchQuery,
  handleSearch,
  onAddLocationPress,
}) => {
  // Função para formatar o endereço a partir do objeto LocationObject
  const formatUserAddress = async (locationObject: Location.LocationObject | null) => {
    if (!locationObject) {
      return "Buscando localização...";
    }
    try {
      const geocodedAddress = await Location.reverseGeocodeAsync({
        latitude: locationObject.coords.latitude,
        longitude: locationObject.coords.longitude,
      });

      if (geocodedAddress && geocodedAddress.length > 0) {
        const address = geocodedAddress[0];
        let formattedAddress = '';
        if (address.street) formattedAddress += address.street;
        if (address.city) formattedAddress += (formattedAddress ? ', ' : '') + address.city;
        if (address.region) formattedAddress += (formattedAddress ? ' - ' : '') + address.region;
        return formattedAddress || `Lat: ${locationObject.coords.latitude.toFixed(4)}, Lon: ${locationObject.coords.longitude.toFixed(4)}`;
      } else {
        return `Lat: ${locationObject.coords.latitude.toFixed(4)}, Lon: ${locationObject.coords.longitude.toFixed(4)}`;
      }
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      return "Localização indisponível";
    }
  };

  const [displayAddress, setDisplayAddress] = React.useState<string>("Buscando localização...");

  React.useEffect(() => {
    formatUserAddress(userLocation).then(setDisplayAddress);
  }, [userLocation]);


  return (
    <View style={[styles.headerContainer, { backgroundColor: themeColors.headerBackground }]}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => console.log("Voltar pressionado")}>
          <AntDesign name="arrowleft" size={24} color={themeColors.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationButton}>
          <MaterialIcons name="location-on" size={20} color={themeColors.primary} />
          <Text style={[styles.locationText, { color: themeColors.text }]}>
            {locationErrorMsg ? "Erro de Localização" : displayAddress}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleAppTheme}>
          <MaterialIcons
            name={currentTheme === 'light' ? 'wb-sunny' : 'nightlight-round'}
            size={24}
            color={themeColors.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: themeColors.inputBackground, color: themeColors.text }]}
          placeholder="Pesquisar..."
          placeholderTextColor={themeColors.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch} // Permite pesquisar ao pressionar Enter/Done
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        {onAddLocationPress && (
          <TouchableOpacity style={styles.addButton} onPress={onAddLocationPress}>
            <MaterialIcons name="add-location-alt" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Para ocupar o espaço e centralizar o texto
    justifyContent: 'center',
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#28A745', // Verde para o botão de adicionar
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
