// src/components/NearbyPlacesSection.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { TireShop } from '../types/interface'; // Importa o tipo TireShop
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // ADICIONE FontAwesome

// Definindo a interface para as coordenadas de localização (apenas latitude e longitude)
interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface NearbyPlacesSectionProps {
  themeColors: any;
  locaisProximos: TireShop[];
  locationErrorMsg: string | null;
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  // --- ADICIONADO/CORRIGIDO: A propriedade currentLocationCoords agora está aqui ---
  currentLocationCoords: LocationCoords | null;
}

const PlaceItem: React.FC<{ place: TireShop; themeColors: any; }> = ({ place, themeColors }) => (
  <View style={[styles.placeItem, { backgroundColor: themeColors.cardBackground }]}>
    <Text style={[styles.placeName, { color: themeColors.text }]}>{place.name}</Text>
    <Text style={[styles.placeAddress, { color: themeColors.subText }]}>{place.address}</Text>
    {place.is24Hours && (
      <View style={styles.badge24h}>
        <Text style={styles.badgeText}>24H</Text>
      </View>
    )}
    {place.phone && (
      <View style={styles.contactRow}>
        <MaterialIcons name="phone" size={16} color={themeColors.icon} />
        <Text style={[styles.contactText, { color: themeColors.subText }]}>{place.phone}</Text>
       {place.hasWhatsApp && (
    <FontAwesome name="whatsapp" size={16} color="#25D366" style={{ marginLeft: 5 }} />
)}
      </View>
    )}
    {/* --- NOVOS CAMPOS DO LAYOUT DA TELA DE CADASTRO --- */}
    {place.servicesOffered && (
        <Text style={[styles.servicesText, { color: themeColors.subText }]}>Serviços: {place.servicesOffered}</Text>
    )}
    {place.simplifiedReferencePoint && (
        <Text style={[styles.referencePointText, { color: themeColors.subText }]}>Ref. Simplificada: {place.simplifiedReferencePoint}</Text>
    )}
    {place.detailedReferencePoint && (
        <Text style={[styles.referencePointText, { color: themeColors.subText }]}>Ref. Detalhada: {place.detailedReferencePoint}</Text>
    )}
    {/* --- FIM DOS NOVOS CAMPOS --- */}
    {place.images && place.images.length > 0 && (
      <View style={styles.imageGallery}>
        {/* Aqui você pode usar uma imagem real em vez de um ícone, se quiser */}
        {place.images.map((imgUrl, index) => (
          <MaterialIcons key={index} name="image" size={20} color={themeColors.icon} style={{ marginRight: 5 }} />
        ))}
        <Text style={[styles.imageCountText, { color: themeColors.subText }]}>{place.images.length} fotos</Text>
      </View>
    )}
  </View>
);

export const NearbyPlacesSection: React.FC<NearbyPlacesSectionProps> = ({
  themeColors,
  locaisProximos,
  locationErrorMsg,
  expandedNearbyPlaces,
  toggleNearbyPlaces,
  currentLocationCoords, // Agora a prop é recebida aqui
}) => {
  // Você pode usar currentLocationCoords aqui para filtrar ou ordenar locais,
  // mas para este passo, vamos apenas garantir que a prop é recebida.
  const displayedLocais = locaisProximos; // Por enquanto, apenas exibe todos os locais mockados

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
              keyExtractor={(item) => item.id}
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