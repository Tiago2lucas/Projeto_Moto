import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { makePhoneCall } from '../utils/communicationUtils';
import { openGoogleMapsToDestination, calcularDistancia } from '../utils/mapsUtils'; // <--- Importa calcularDistancia AQUI
import { TireShop } from '../types/interface'; // Sua interface existente

interface NearbyPlacesSectionProps {
  themeColors: any;
  locaisProximos: TireShop[];
  locationErrorMsg: string | null;
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  currentLocationCoords: { latitude: number, longitude: number } | null; // <--- NOVA PROP ADICIONADA
}

export const NearbyPlacesSection = ({
  themeColors,
  locaisProximos,
  locationErrorMsg,
  expandedNearbyPlaces,
  toggleNearbyPlaces,
  currentLocationCoords, // <--- DESESTRUTURADO AQUI PARA USO
}: NearbyPlacesSectionProps) => {
  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <View style={dynamicStyles.section}>
      <TouchableOpacity style={dynamicStyles.sectionHeader} onPress={toggleNearbyPlaces}>
        <Text style={dynamicStyles.sectionTitle}>Locais Próximos ({locaisProximos.length} encontrados)</Text>
        <AntDesign name={expandedNearbyPlaces ? "minus" : "plus"} size={20} color={themeColors.text} />
      </TouchableOpacity>
      {expandedNearbyPlaces && (
        locaisProximos.length > 0 ? (
          locaisProximos.map((local) => (
            <View key={local.id} style={dynamicStyles.nearbyPlaceItem}>
              <View style={dynamicStyles.nearbyPlaceTextContainer}>
                <Text style={dynamicStyles.nearbyPlaceName}>{local.name}</Text>
                <Text style={dynamicStyles.nearbyPlaceType}>{local.type}</Text>
                {/* --- CÓDIGO PARA EXIBIR A DISTÂNCIA --- */}
                {currentLocationCoords && ( // Só mostra se a localização do usuário estiver disponível
                  <Text style={dynamicStyles.localDistanciaText}>
                    {calcularDistancia(
                      currentLocationCoords.latitude,
                      currentLocationCoords.longitude,
                      local.latitude,
                      local.longitude
                    ).toFixed(2)} km de você
                  </Text>
                )}
                {!currentLocationCoords && !locationErrorMsg && ( // Mensagem enquanto busca localização
                  <Text style={dynamicStyles.localDistanciaLoading}>Buscando sua localização...</Text>
                )}
                {locationErrorMsg && ( // Mensagem se houver erro na localização
                  <Text style={dynamicStyles.localDistanciaError}>Erro ao obter localização</Text>
                )}
                {/* --- FIM DO CÓDIGO DA DISTÂNCIA --- */}
              </View>
              <View style={dynamicStyles.nearbyPlaceButtons}>
                <TouchableOpacity
                  style={dynamicStyles.nearbyPlaceButton}
                  onPress={() => makePhoneCall(local.phoneNumber)} // Assumindo que TireShop tem phoneNumber
                >
                  <Text style={dynamicStyles.nearbyPlaceButtonText}>Ligar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.nearbyPlaceButton, { backgroundColor: themeColors.success }]}
                  onPress={() => openGoogleMapsToDestination(local.latitude, local.longitude, local.name)}
                >
                  <Text style={dynamicStyles.nearbyPlaceButtonText}>Rota</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={dynamicStyles.noNearbyPlacesText}>
            {locationErrorMsg || "Nenhum local próximo encontrado no raio de 20 km."}
          </Text>
        )
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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  nearbyPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderColor,
    marginBottom: 5,
  },
  nearbyPlaceTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  nearbyPlaceName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  nearbyPlaceType: {
    fontSize: 14,
    color: themeColors.subText,
  },
  // NOVOS ESTILOS PARA A DISTÂNCIA
  localDistanciaText: {
    fontSize: 13,
    color: themeColors.primary,
    marginTop: 5,
    fontWeight: '600',
  },
  localDistanciaLoading: {
    fontSize: 12,
    color: themeColors.subText,
    marginTop: 5,
    fontStyle: 'italic',
  },
  localDistanciaError: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    fontStyle: 'italic',
  },
  nearbyPlaceButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyPlaceButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  nearbyPlaceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noNearbyPlacesText: {
    textAlign: 'center',
    color: themeColors.subText,
    paddingVertical: 20,
    fontSize: 15,
  },
});