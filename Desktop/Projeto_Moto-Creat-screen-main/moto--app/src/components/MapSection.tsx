// src/components/MapSection.tsx

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { TireShop, LocationCoords } from '../types/interface'; // Importa TireShop e LocationCoords
import * as Location from 'expo-location'; // Importa Location para tipagem de LocationObject

interface MapSectionProps {
  themeColors: any;
  currentLocationCoords: LocationCoords | null;
  mapRegion: Region | null;
  userLocation: Location.LocationObject | null; // <--- TIPO CORRIGIDO AQUI
  locaisProximos: TireShop[]; // Agora virão do backend
  locationErrorMsg: string | null;
}

export const MapSection: React.FC<MapSectionProps> = ({
  themeColors,
  currentLocationCoords,
  mapRegion,
  userLocation, // Agora é Location.LocationObject | null
  locaisProximos,
  locationErrorMsg,
}) => {
  if (locationErrorMsg) {
    return (
      <View style={[styles.mapContainer, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.errorText, { color: themeColors.errorText }]}>
          {locationErrorMsg}
        </Text>
      </View>
    );
  }

  if (!mapRegion || !currentLocationCoords) {
    return (
      <View style={[styles.mapContainer, { backgroundColor: themeColors.cardBackground }]}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={[styles.loadingText, { color: themeColors.subText }]}>
          Carregando mapa e localização...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        followsUserLocation={true}
        loadingEnabled={true}
        loadingIndicatorColor="#007BFF"
        loadingBackgroundColor={themeColors.cardBackground}
      >
        {/* Marcador para a localização do usuário (se não for mostrado por showsUserLocation) */}
        {/* Se userLocation for um objeto Location.LocationObject, você pode usá-lo assim: */}
        {/* {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Sua Localização"
            description="Você está aqui"
          >
            <MaterialIcons name="person-pin-circle" size={30} color="#007BFF" />
          </Marker>
        )} */}

        {/* Marcadores dos Locais próximos */}
        {locaisProximos.map((local) => (
          <Marker
            key={local.id.toString()} // keyExtractor precisa de string
            coordinate={{
              latitude: local.latitude,
              longitude: local.longitude,
            }}
            title={local.nome_local} // Usando 'nome_local' do DB
            description={`${local.rua}, ${local.numero_endereco}, ${local.bairro}, ${local.cidade} - ${local.uf}`} // Construindo o endereço
          >
            <MaterialIcons name="place" size={30} color="#28A745" />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 300, // Altura fixa para o mapa
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
