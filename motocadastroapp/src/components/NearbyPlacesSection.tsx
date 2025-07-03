// src/components/NearbyPlacesSection.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { TireShop, LocationCoords } from '../types/interface'; // Importa o tipo TireShop e LocationCoords
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // ADICIONE FontAwesome

interface NearbyPlacesSectionProps {
  themeColors: any;
  locaisProximos: TireShop[]; // Agora receberá os dados reais do backend
  locationErrorMsg: string | null;
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  currentLocationCoords: LocationCoords | null;
}

// Componente para renderizar um item da lista de locais
const PlaceItem: React.FC<{ place: TireShop; themeColors: any; }> = ({ place, themeColors }) => {
  // O campo fotos_local_json vem como string JSON do DB, precisamos parsear
  let fotosArray: string[] = [];
  try {
    if (place.fotos_local_json) {
      fotosArray = JSON.parse(place.fotos_local_json);
    }
  } catch (e) {
    console.error("Erro ao parsear fotos_local_json:", e);
    fotosArray = []; // Em caso de erro, define como array vazio
  }

  return (
    <View style={[styles.placeItem, { backgroundColor: themeColors.cardBackground }]}>
      {/* Usando nome_local do DB */}
      <Text style={[styles.placeName, { color: themeColors.text }]}>{place.nome_local}</Text>
      {/* Montando endereço completo com base nos campos do DB */}
      <Text style={[styles.placeAddress, { color: themeColors.subText }]}>{`${place.rua}, ${place.numero_endereco}, ${place.bairro}, ${place.cidade} - ${place.uf}`}</Text>
      
      {/* aberto_24_horas vem como 0 ou 1 do DB, então verificamos se é 1 */}
      {place.aberto_24_horas === 1 && (
        <View style={styles.badge24h}>
          <Text style={styles.badgeText}>24H</Text>
        </View>
      )}

      {place.telefone && (
        <View style={styles.contactRow}>
          <MaterialIcons name="phone" size={16} color={themeColors.icon} />
          <Text style={[styles.contactText, { color: themeColors.subText }]}>{place.telefone}</Text>
          {/* telefone_whatsapp vem como 0 ou 1 do DB, numero_whatsapp é a nova coluna */}
          {place.telefone_whatsapp === 1 && place.numero_whatsapp && (
            <FontAwesome name="whatsapp" size={16} color="#25D366" style={{ marginLeft: 5 }} />
          )}
          {place.telefone_whatsapp === 1 && place.numero_whatsapp && (
            <Text style={[styles.contactText, { color: themeColors.subText }]}>{place.numero_whatsapp}</Text>
          )}
        </View>
      )}

      {place.servicos_oferecidos && (
        <Text style={[styles.servicesText, { color: themeColors.subText }]}>Serviços: {place.servicos_oferecidos}</Text>
      )}
      {place.ponto_referencia_simplificado && (
        <Text style={[styles.referencePointText, { color: themeColors.subText }]}>Ref. Simplificada: {place.ponto_referencia_simplificado}</Text>
      )}
      {place.ponto_referencia_detalhado && (
        <Text style={[styles.referencePointText, { color: themeColors.subText }]}>Ref. Detalhada: {place.ponto_referencia_detalhado}</Text>
      )}
      
      {/* Exibindo fotos se houverem */}
      {fotosArray.length > 0 && (
        <View style={styles.imageGallery}>
          {/* Você pode usar uma imagem real aqui se as URLs forem acessíveis */}
          {fotosArray.map((imgUrl, index) => (
            // Por enquanto, apenas um ícone, mas você pode substituir por <Image source={{ uri: imgUrl }} style={...} />
            <MaterialIcons key={index} name="image" size={20} color={themeColors.icon} style={{ marginRight: 5 }} />
          ))}
          <Text style={[styles.imageCountText, { color: themeColors.subText }]}>{fotosArray.length} fotos</Text>
        </View>
      )}
    </View>
  );
};

export const NearbyPlacesSection: React.FC<NearbyPlacesSectionProps> = ({
  themeColors,
  locaisProximos, // Agora são os dados reais
  locationErrorMsg,
  expandedNearbyPlaces,
  toggleNearbyPlaces,
  currentLocationCoords,
}) => {
  const displayedLocais = locaisProximos; // Agora já são os dados reais, sem mock

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity onPress={toggleNearbyPlaces} style={[styles.sectionHeader, { backgroundColor: themeColors.headerBackground, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Locais Próximos</Text>
        <MaterialIcons
          name={expandedNearbyPlaces ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={themeColors.icon}
        />
      </TouchableOpacity>

      {expandedNearbyPlaces && (
        <View style={[styles.listContainer, { backgroundColor: themeColors.cardBackground }]}>
          {locationErrorMsg ? (
            <Text style={[styles.errorText, { color: themeColors.errorText }]}>{locationErrorMsg}</Text>
          ) : displayedLocais.length === 0 ? (
            <Text style={[styles.noPlacesText, { color: themeColors.subText }]}>Nenhum local próximo encontrado.</Text>
          ) : (
            <FlatList
              data={displayedLocais}
              keyExtractor={(item) => item.id.toString()} // keyExtractor precisa de string
              renderItem={({ item }) => <PlaceItem place={item} themeColors={themeColors} />}
              scrollEnabled={false} // Para que a ScrollView pai controle a rolagem
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden', // Garante que o borderRadius funcione para os filhos
    borderWidth: 1,
    borderColor: '#ddd', // Borda sutil
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  placeItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  placeAddress: {
    fontSize: 14,
    marginBottom: 5,
  },
  badge24h: {
    backgroundColor: '#007BFF', // Azul
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start', // Para que o badge não ocupe a largura total
    marginBottom: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  contactText: {
    marginLeft: 5,
    fontSize: 14,
  },
  servicesText: {
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  referencePointText: {
    fontSize: 13,
    marginTop: 3,
    color: '#777',
  },
  imageGallery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  imageCountText: {
    fontSize: 12,
    marginLeft: 5,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  noPlacesText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
});
