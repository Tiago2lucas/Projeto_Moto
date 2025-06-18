// src/components/MapSection.tsx

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps'; // Importe Region
import { MaterialIcons } from '@expo/vector-icons';
import { TireShop } from '../types/interface'; // Certifique-se de que o TireShop está importado

// Definindo a interface para as coordenadas de localização (apenas latitude e longitude)
interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface MapSectionProps {
  themeColors: any; // Ajuste para um tipo mais específico se ThemeColors for uma interface
  currentLocationCoords: LocationCoords | null; // Pode ser null no início
  mapRegion: Region | null; // <--- MUDANÇA AQUI: Agora aceita null!
  userLocation: any; // Tipo mais específico se souber o formato exato de Location.LocationObject
  locaisProximos: TireShop[];
  locationErrorMsg: string | null;
}

export const MapSection: React.FC<MapSectionProps> = ({
  themeColors,
  currentLocationCoords,
  mapRegion,
  userLocation,
  locaisProximos,
  locationErrorMsg,
}) => {
  return (
    <View style={styles.mapContainer}>
      {locationErrorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: themeColors.errorText }]}>
            {locationErrorMsg}
          </Text>
        </View>
      ) : !currentLocationCoords || !mapRegion ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Carregando localização e locais próximos...
          </Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={mapRegion} // mapRegion agora pode ser null, mas o componente MapView já lida com isso se a região for válida
          showsUserLocation={true}
          loadingEnabled={true}
          // initialRegion={mapRegion} // Pode usar initialRegion se a região for estática, mas region é melhor para estado mutável
        >
          {/* Marcador da localização atual do usuário (já coberto por showsUserLocation) */}
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

          {/* Marcadores dos locais próximos */}
          {locaisProximos.map((local) => (
            <Marker
              key={local.id}
              coordinate={{
                latitude: local.latitude,
                longitude: local.longitude,
              }}
              title={local.name}
              description={local.address}
            >
              <MaterialIcons name="place" size={30} color="#28A745" /> {/* Ícone para as borracharias */}
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 300, // Altura fixa para o mapa
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Cor de fundo para o estado de carregamento
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe0e0', // Fundo vermelho claro para erro
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});