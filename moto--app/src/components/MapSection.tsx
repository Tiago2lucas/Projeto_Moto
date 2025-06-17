import React, { useState } from 'react'; // Importar useState
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native'; // Importar TouchableOpacity, LayoutAnimation, Platform, UIManager
import MapView, { Marker } from 'react-native-maps';
import { AntDesign } from '@expo/vector-icons';
import { TireShop } from '../types/interface'; // Importar o tipo

// Habilitar LayoutAnimation para Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MapSectionProps {
  themeColors: any;
  currentLocationCoords: { latitude: number, longitude: number } | null;
  mapRegion: { latitude: number, longitude: number, latitudeDelta: number, longitudeDelta: number };
  userLocation: string;
  locaisProximos: TireShop[];
  locationErrorMsg: string | null;
}

export const MapSection = ({
  themeColors,
  currentLocationCoords,
  mapRegion,
  userLocation,
  locaisProximos,
  locationErrorMsg,
}: MapSectionProps) => {
  const dynamicStyles = getThemedStyles(themeColors);

  // NOVO ESTADO: Para controlar se a seção está expandida ou recolhida
  const [isExpanded, setIsExpanded] = useState(true); // Começa expandida por padrão

  // Função para alternar o estado de expansão
  const toggleExpand = () => {
    // Adiciona uma animação suave ao expandir/recolher
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={dynamicStyles.section}>
      {/* Torna o cabeçalho clicável */}
      <TouchableOpacity onPress={toggleExpand} style={dynamicStyles.sectionHeader}>
        <Text style={dynamicStyles.sectionTitle}>Sua Localização no Mapa</Text>
        {/* Altera o ícone com base no estado de expansão */}
        <AntDesign
          name={isExpanded ? "minus" : "plus"} // "minus" quando expandido, "plus" quando recolhido
          size={20}
          color={themeColors.text}
        />
      </TouchableOpacity>

      {/* Renderiza o conteúdo do mapa APENAS se isExpanded for true */}
      {isExpanded && (
        <View style={dynamicStyles.mapContainer}>
          {currentLocationCoords ? (
            <MapView
              style={dynamicStyles.miniMap}
              region={mapRegion}
              showsUserLocation={true}
            >
              {currentLocationCoords && (
                <Marker
                  coordinate={currentLocationCoords}
                  title="Você está aqui"
                  description={userLocation}
                />
              )}
              {locaisProximos.map(local => (
                <Marker
                  key={local.id}
                  coordinate={{ latitude: local.latitude, longitude: local.longitude }}
                  title={local.name}
                  description={local.type}
                  pinColor={themeColors.primary}
                />
              ))}
            </MapView>
          ) : (
            <View style={dynamicStyles.mapLoadingContainer}>
              <Text style={dynamicStyles.mapLoadingText}>
                {locationErrorMsg || "Carregando mapa e buscando sua localização..."}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const getThemedStyles = (themeColors: any) => StyleSheet.create({
  section: {
    backgroundColor: themeColors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Mantive o marginBottom para dar espaço ao conteúdo quando expandido
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  mapContainer: {
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: themeColors.borderColor,
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.background,
  },
  mapLoadingText: {
    color: themeColors.subText,
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
});