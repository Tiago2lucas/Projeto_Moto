import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import {
  MaterialIcons,
  FontAwesome,
  AntDesign,
} from '@expo/vector-icons';
import * as Location from 'expo-location'; // Para obter a localização do usuário
import MapView, { Marker } from 'react-native-maps'; // Para o mini mapa

// Importa os dados das borracharias/oficinas de um arquivo JSON local
// Certifique-se de que 'locais.json' esteja na mesma pasta que este arquivo App.js
import allTireShops from './Locais/locais.json'; 

// Função para abrir o Google Maps para um destino específico
const openGoogleMapsToDestination = (destinationLatitude: number, destinationLongitude: number, label: string) => {
  let mapUrl = '';
  if (Platform.OS === 'ios') {
    mapUrl = `http://maps.apple.com/?ll=${destinationLatitude},${destinationLongitude}&q=${label}`;
  } else {
    mapUrl = `geo:${destinationLatitude},${destinationLongitude}?q=${label}`;
  }

  Linking.openURL(mapUrl).catch(err => {
    console.error('Erro ao abrir o Google Maps:', err);
    Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas. Certifique-se de que ele está instalado.');
  });
};

// Função para abrir o WhatsApp
const openWhatsApp = (phoneNumber: string, message: string) => {
  let url = '';
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
  url = `whatsapp://send?phone=${cleanedPhoneNumber}&text=${encodeURIComponent(message)}`;

  Linking.openURL(url).catch(err => {
    console.error('Erro ao abrir o WhatsApp:', err);
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Certifique-se de que ele está instalado.');
  });
};

// Função para fazer uma chamada telefônica
const makePhoneCall = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url).catch(err => {
    console.error('Erro ao fazer a chamada:', err);
    Alert.alert('Erro', 'Não foi possível fazer a chamada.');
  });
};


export default function App() {
  const whatsappPhoneNumber = '5581999999999'; // <-- SUBSTITUA PELO SEU NÚMERO DE WHATSAPP
  const whatsappMessage = 'Olá! Gostaria de verificar a disponibilidade de serviços.';

  // Estados para a localização do usuário e locais próximos
  const [userLocation, setUserLocation] = useState<string>('Buscando localização...');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  // O tipo de 'locaisProximos' agora se baseia na estrutura importada do JSON
  const [locaisProximos, setLocaisProximos] = useState<typeof allTireShops>([]); 
  const [mapRegion, setMapRegion] = useState({
    latitude: -8.1030, // Default para Jaboatão dos Guararapes
    longitude: -34.9284,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);

  // Função para calcular a distância entre duas coordenadas (Fórmula de Haversine)
  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    function toRad(x: number): number {
      return (x * Math.PI) / 180;
    }
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  }

  // Efeito para obter a localização ao montar o componente e solicitar permissão
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permissão para acessar a localização foi negada.');
        Alert.alert('Permissão Negada', 'Precisamos da sua permissão para mostrar a localização no mapa e encontrar locais próximos. Por favor, habilite nas configurações do seu dispositivo.');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

        setCurrentLocationCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setMapRegion(prev => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));

        // Filtrar locais próximos usando os dados importados de 'locais.json'
        const raioDeBuscaKm = 20; // Definir o raio de busca em km
        const filteredLocais = allTireShops.filter((local) => { // 'allTireShops' agora é o import
          const distancia = calcularDistancia(
            location.coords.latitude,
            location.coords.longitude,
            local.latitude,
            local.longitude
          );
          return distancia < raioDeBuscaKm;
        });
        setLocaisProximos(filteredLocais);

        // Geocodificação reversa para o endereço no cabeçalho
        let geocodedAddress = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocodedAddress && geocodedAddress.length > 0) {
          const address = geocodedAddress[0];
          let formattedAddress = '';
          if (address.street) formattedAddress += address.street;
          if (address.city) formattedAddress += (formattedAddress ? ', ' : '') + address.city;
          if (address.region) formattedAddress += (formattedAddress ? ' - ' : '') + address.region;
          setUserLocation(formattedAddress || `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
        } else {
          setUserLocation(`Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setLocationErrorMsg('Não foi possível obter a localização.');
        Alert.alert('Erro de Localização', 'Não foi possível obter sua localização. Verifique as configurações de GPS ou tente novamente.');
        setUserLocation('Localização indisponível');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="dark" />

      {/* Cabeçalho do Aplicativo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => Alert.alert('Navegação', 'Botão Voltar Pressionado')}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Image
             // SUBSTITUA PELO CAMINHO DO SEU LOGOTIPO
            style={styles.logo}
            resizeMode="contain"
          />
          {/* Componente de localização no cabeçalho, agora dinâmico */}
          <TouchableOpacity
            style={styles.locationDisplay}
            onPress={() => locationErrorMsg ? Alert.alert('Erro de Localização', locationErrorMsg) : Alert.alert('Localização', `Sua localização atual: ${userLocation}.`)}
          >
            <MaterialIcons name="location-on" size={18} color="#555" />
            <Text style={styles.locationTextHeader}>
              {userLocation}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Área Principal de Conteúdo */}
      <View style={styles.mainContentWrapper}>
        {/* Botões de Navegação Lateral Esquerda */}
        <View style={styles.leftNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => Alert.alert('Contato', 'Função de Ligar acionada (implementar chamada)')}>
            <MaterialIcons name="phone" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#25D366' }]} onPress={() => openWhatsApp(whatsappPhoneNumber, whatsappMessage)}>
            <FontAwesome name="whatsapp" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => Alert.alert('Localização', 'Veja sua localização no mapa abaixo!')}>
            <MaterialIcons name="location-on" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, { backgroundColor: '#6c757d' }]} onPress={() => openGoogleMapsToDestination(mapRegion.latitude, mapRegion.longitude, 'Minha Localização')}>
            <Text style={styles.navButtonText}>Route</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo Rolável */}
        <ScrollView style={styles.scrollContent}>
          {/* Imagem Principal da Seção (com resizeMode="contain" para evitar cortes) */}
          <Image
            source={require('./assets/pneu.png')} // SUBSTITUA PELA IMAGEM GRANDE DO PNEU/CABEÇALHO
            style={styles.tireImage}
            resizeMode="contain" // Garante que a imagem não seja cortada
          />

          {/* Botão "Send WhatsApp Availabilities" */}
          <TouchableOpacity style={styles.whatsAppButton} onPress={() => openWhatsApp(whatsappPhoneNumber, whatsappMessage)}>
            <Text style={styles.whatsAppButtonText}>Send WhatsApp Availabilities</Text>
          </TouchableOpacity>

          {/* Seção de AutoServices */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AutoServices</Text>
              <AntDesign name="minus" size={20} color="black" />
            </View>
            <TouchableOpacity style={styles.serviceItem} onPress={() => Alert.alert('Serviço', 'Tire Repair selecionado')}>
              <MaterialIcons name="check-circle" size={20} color="#5cb85c" />
              <Text style={styles.serviceText}>Tire Repair</Text>
              <AntDesign name="right" size={16} color="#cccccc" style={styles.arrowIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem} onPress={() => Alert.alert('Serviço', 'Wheel Alignment selecionado')}>
              <MaterialIcons name="check-circle" size={20} color="#5cb85c" />
              <Text style={styles.serviceText}>Wheel Alignment</Text>
              <AntDesign name="right" size={16} color="#cccccc" style={styles.arrowIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem} onPress={() => Alert.alert('Serviço', 'General Alignment selecionado')}>
              <MaterialIcons name="check-circle" size={20} color="#5cb85c" />
              <Text style={styles.serviceText}>General Alignment</Text>
              <AntDesign name="right" size={16} color="#cccccc" style={styles.arrowIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceItem} onPress={() => Alert.alert('Serviço', 'General Maintenance selecionado')}>
              <MaterialIcons name="check-circle" size={20} color="#5cb85c" />
              <Text style={styles.serviceText}>General Maintenance</Text>
              <AntDesign name="right" size={16} color="#cccccc" style={styles.arrowIcon} />
            </TouchableOpacity>
          </View>

          {/* NOVA SEÇÃO: Locais Próximos (Borracharias/Oficinas) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Locais Próximos ({locaisProximos.length} encontrados)</Text>
              <AntDesign name="minus" size={20} color="black" />
            </View>
            {locaisProximos.length > 0 ? (
              locaisProximos.map((local) => (
                <View key={local.id} style={styles.nearbyPlaceItem}>
                  <View style={styles.nearbyPlaceTextContainer}>
                    <Text style={styles.nearbyPlaceName}>{local.name}</Text>
                    <Text style={styles.nearbyPlaceType}>{local.type}</Text>
                  </View>
                  <View style={styles.nearbyPlaceButtons}>
                    <TouchableOpacity
                      style={styles.nearbyPlaceButton}
                      onPress={() => makePhoneCall(local.phoneNumber)}
                    >
                      <Text style={styles.nearbyPlaceButtonText}>Ligar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.nearbyPlaceButton, { backgroundColor: '#28a745' }]} // Verde para Rota
                      onPress={() => openGoogleMapsToDestination(local.latitude, local.longitude, local.name)}
                    >
                      <Text style={styles.nearbyPlaceButtonText}>Rota</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noNearbyPlacesText}>
                {locationErrorMsg || "Nenhum local próximo encontrado no raio de 20 km."}
              </Text>
            )}
          </View>

          {/* Seção de Localização com Mini Mapa */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sua Localização no Mapa</Text>
              <AntDesign name="minus" size={20} color="black" />
            </View>
            <View style={styles.mapContainer}>
              {currentLocationCoords ? (
                <MapView
                  style={styles.miniMap}
                  region={mapRegion}
                  showsUserLocation={true} // Mostra a bolinha azul da localização do usuário
                  // onRegionChangeComplete={setMapRegion} // Opcional: permite arrastar o mapa e atualizar a região
                >
                  {currentLocationCoords && (
                    <Marker
                      coordinate={currentLocationCoords}
                      title="Você está aqui"
                      description={userLocation}
                    />
                  )}
                  {/* Marcadores para as borracharias/oficinas próximas */}
                  {locaisProximos.map(local => (
                    <Marker
                      key={local.id}
                      coordinate={{ latitude: local.latitude, longitude: local.longitude }}
                      title={local.name}
                      description={local.type}
                      pinColor="blue" // Cor diferente para os marcadores das lojas
                    />
                  ))}
                </MapView>
              ) : (
                <View style={styles.mapLoadingContainer}>
                  <Text style={styles.mapLoadingText}>
                    {locationErrorMsg || "Carregando mapa e buscando sua localização..."}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Espaço para garantir a rolagem do conteúdo acima da barra de navegação inferior */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Barra de Navegação Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => Alert.alert('Navegação', 'Home')}>
          <AntDesign name="home" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => Alert.alert('Navegação', 'Search')}>
          <AntDesign name="search1" size={24} color="#6c757d" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => Alert.alert('Navegação', 'Services')}>
          <AntDesign name="appstore-o" size={24} color="#6c757d" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => Alert.alert('Navegação', 'Profile')}>
          <FontAwesome name="user-o" size={24} color="#6c757d" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  logo: {
    width: 120,
    height: 30,
    marginRight: 10,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#f2f2f2',
    flexShrink: 1,
  },
  locationTextHeader: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  mainContentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  leftNav: {
    width: 70,
    backgroundColor: '#343a40',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    zIndex: 5,
  },
  navButton: {
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  tireImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'contain', // GARANTIDO: Imagem não será cortada
  },
  whatsAppButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  whatsAppButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serviceText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
  // Estilos para a seção de locais próximos
  nearbyPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },
  nearbyPlaceTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  nearbyPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nearbyPlaceType: {
    fontSize: 14,
    color: '#666',
  },
  nearbyPlaceButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearbyPlaceButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  nearbyPlaceButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noNearbyPlacesText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
  },
  // Estilos para a seção do mapa
  mapContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  mapLoadingText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  bottomNavItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavText: {
    fontSize: 12,
    color: '#6c757d',
  },
});
