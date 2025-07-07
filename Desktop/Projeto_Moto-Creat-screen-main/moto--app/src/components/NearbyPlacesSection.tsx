import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, FlatList, Linking, Alert } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { makePhoneCall } from '../utils/communicationUtils';
import { openGoogleMapsToDestination, calcularDistancia } from '../utils/mapsUtils';
import { TireShop, LocationCoords } from '../types/interface';

interface NearbyPlacesSectionProps {
  themeColors: any;
  locaisProximos: TireShop[];
  locationErrorMsg: string | null;
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  currentLocationCoords: LocationCoords | null;
  onSelectShop: (shop: TireShop) => void; // <--- NOVA PROP ADICIONADA AQUI
}

// Função para abrir o WhatsApp
const openWhatsAppChat = (phoneNumber: string, message: string = '') => {
  let cleanedPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove todos os não-dígitos

  if (cleanedPhoneNumber.length === 11 && cleanedPhoneNumber.substring(0, 2) !== '55') {
    cleanedPhoneNumber = '55' + cleanedPhoneNumber;
  }

  let url = `whatsapp://send?phone=${cleanedPhoneNumber}`;
  if (message) {
    url += `&text=${encodeURIComponent(message)}`;
  }
  Linking.openURL(url).catch(err => {
    console.error("Erro ao abrir WhatsApp:", err);
    Alert.alert("Erro", "Não foi possível abrir o WhatsApp. Verifique se o aplicativo está instalado e o número está correto.");
  });
};

// Componente para renderizar um item da lista de locais
const PlaceItem: React.FC<{
  place: TireShop;
  themeColors: any;
  currentLocationCoords: LocationCoords | null;
  locationErrorMsg: string | null;
  onSelectShop: (shop: TireShop) => void; // <--- NOVA PROP ADICIONADA AQUI TAMBÉM
}> = ({ place, themeColors, currentLocationCoords, locationErrorMsg, onSelectShop }) => { // Recebe onSelectShop
  let fotosArray: string[] = [];
  try {
    if (place.fotos_local_json) {
      fotosArray = JSON.parse(place.fotos_local_json);
    }
  } catch (e) {
    console.error("Erro ao parsear fotos_local_json:", e);
    fotosArray = []; // Em caso de erro, define como array vazio
  }

  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <TouchableOpacity // <--- ENVOLVENDO O ITEM COM TOUCHABLEOPACITY PARA TORNÁ-LO CLICÁVEL
      style={dynamicStyles.nearbyPlaceItem}
      onPress={() => onSelectShop(place)} // <--- CHAMA O CALLBACK AO CLICAR NO ITEM
    >
      <View style={dynamicStyles.nearbyPlaceTextContainer}>
        <Text style={dynamicStyles.nearbyPlaceName}>{place.nome_local}</Text>
        <Text style={dynamicStyles.nearbyPlaceAddress}>{`${place.rua}, ${place.numero_endereco}, ${place.bairro}, ${place.cidade} - ${place.uf}`}</Text>

        {place.aberto_24_horas === 1 && (
          <View style={dynamicStyles.badge24h}>
            <Text style={dynamicStyles.badgeText}>24H</Text>
          </View>
        )}

        {currentLocationCoords && (
          <Text style={dynamicStyles.localDistanciaText}>
            {calcularDistancia(
              currentLocationCoords.latitude,
              currentLocationCoords.longitude,
              place.latitude,
              place.longitude
            ).toFixed(2)} km de você
          </Text>
        )}
        {!currentLocationCoords && !locationErrorMsg && (
          <Text style={dynamicStyles.localDistanciaLoading}>Buscando sua localização...</Text>
        )}
        {locationErrorMsg && (
          <Text style={dynamicStyles.localDistanciaError}>Erro ao obter localização</Text>
        )}
        
        {place.servicos_oferecidos && (
          <View style={dynamicStyles.infoRow}>
            <MaterialIcons name="build" size={16} color={themeColors.icon} />
            <Text style={dynamicStyles.infoText}>Serviços: {place.servicos_oferecidos}</Text>
          </View>
        )}

        {place.ponto_referencia_simplificado && (
          <View style={dynamicStyles.infoRow}>
            <MaterialIcons name="location-on" size={16} color={themeColors.icon} />
            <Text style={dynamicStyles.infoText}>Ref. Simplificada: {place.ponto_referencia_simplificado}</Text>
          </View>
        )}
        {place.ponto_referencia_detalhado && (
          <View style={dynamicStyles.infoRow}>
            <MaterialIcons name="info" size={16} color={themeColors.icon} />
            <Text style={dynamicStyles.infoText}>Ref. Detalhada: {place.ponto_referencia_detalhado}</Text>
          </View>
        )}

        {fotosArray.length > 0 && (
          <View style={dynamicStyles.imageGallery}>
            <MaterialIcons name="photo-library" size={16} color={themeColors.icon} />
            <Text style={dynamicStyles.imageCountText}>{fotosArray.length} fotos</Text>
          </View>
        )}

      </View>
      <View style={dynamicStyles.nearbyPlaceButtons}>
        <TouchableOpacity
          style={dynamicStyles.nearbyPlaceButton}
          onPress={() => makePhoneCall(place.telefone)}
        >
          <Text style={dynamicStyles.nearbyPlaceButtonText}>Ligar</Text>
        </TouchableOpacity>
        {place.telefone_whatsapp === 1 && place.numero_whatsapp && (
          <TouchableOpacity
            style={[dynamicStyles.nearbyPlaceButton, dynamicStyles.whatsappButton, { paddingHorizontal: 15, paddingVertical: 9 }]}
            onPress={() => openWhatsAppChat(place.numero_whatsapp!, `Olá, estou entrando em contato pelo aplicativo Borracharia App sobre ${place.nome_local}.`)}
          >
            <FontAwesome name="whatsapp" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[dynamicStyles.nearbyPlaceButton, { backgroundColor: themeColors.success }]}
          onPress={() => openGoogleMapsToDestination(place.latitude, place.longitude, place.nome_local)}
        >
          <Text style={dynamicStyles.nearbyPlaceButtonText}>Rota</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity> 
  );
};

export const NearbyPlacesSection = ({
  themeColors,
  locaisProximos,
  locationErrorMsg,
  expandedNearbyPlaces,
  toggleNearbyPlaces,
  currentLocationCoords,
  onSelectShop, // <--- RECEBE A PROP AQUI
}: NearbyPlacesSectionProps) => { // <--- CORREÇÃO AQUI: NearbyPlacesSectionProps
  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <View style={dynamicStyles.section}>
      <TouchableOpacity style={dynamicStyles.sectionHeader} onPress={toggleNearbyPlaces}>
        <Text style={dynamicStyles.sectionTitle}>Locais Próximos ({locaisProximos.length} encontrados)</Text>
        <AntDesign name={expandedNearbyPlaces ? "minus" : "plus"} size={20} color={themeColors.text} />
      </TouchableOpacity>
      {expandedNearbyPlaces && (
        locaisProximos.length > 0 ? (
          <FlatList
            data={locaisProximos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PlaceItem
                place={item}
                themeColors={themeColors}
                currentLocationCoords={currentLocationCoords}
                locationErrorMsg={locationErrorMsg}
                onSelectShop={onSelectShop} // <--- PASSA PARA O PLACEITEM
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={dynamicStyles.noNearbyPlacesText}>
            {locationErrorMsg || "Nenhum local próximo encontrado."}
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
    alignItems: 'flex-start',
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
  nearbyPlaceAddress: {
    fontSize: 14,
    color: themeColors.subText,
    marginTop: 2,
  },
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
    flexDirection: 'column',
    alignItems: 'center',
  },
  nearbyPlaceButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyPlaceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  noNearbyPlacesText: {
    textAlign: 'center',
    color: themeColors.subText,
    paddingVertical: 20,
    fontSize: 15,
  },
  badge24h: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 5,
    marginBottom: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  infoText: {
    fontSize: 14,
    color: themeColors.subText,
    marginLeft: 5,
  },
  imageGallery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  imageCountText: {
    fontSize: 12,
    color: themeColors.subText,
    marginLeft: 5,
  },
});
