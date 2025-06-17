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
  TextInput,
  LayoutAnimation,
  Platform as RNPlatform,
  UIManager,
  useColorScheme,
} from 'react-native';
import {
  MaterialIcons,
  FontAwesome,
  AntDesign,
} from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

interface TireShop {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}
import allTireShops from './Locais/locais.json';

// Habilitar LayoutAnimation para Android
if (RNPlatform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const openGoogleMapsToDestination = (destinationLatitude: number, destinationLongitude: number, label: string) => {
  let mapUrl = '';
  if (RNPlatform.OS === 'ios') {
    mapUrl = `http://maps.apple.com/?ll=${destinationLatitude},${destinationLongitude}&q=${label}`;
  } else {
    mapUrl = `geo:${destinationLatitude},${destinationLongitude}?q=${label}`;
  }

  Linking.openURL(mapUrl).catch(err => {
    console.error('Erro ao abrir o Google Maps:', err);
    Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas. Certifique-se de que ele está instalado.');
  });
};

const openWhatsApp = (phoneNumber: string, message: string) => {
  let url = '';
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
  url = `whatsapp://send?phone=${cleanedPhoneNumber}&text=${encodeURIComponent(message)}`;

  Linking.openURL(url).catch(err => {
    console.error('Erro ao abrir o WhatsApp:', err);
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Certifique-se de que ele está instalado.');
  });
};

const makePhoneCall = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url).catch(err => {
    console.error('Erro ao fazer a chamada:', err);
    Alert.alert('Erro', 'Não foi possível fazer a chamada.');
  });
};

const Colors = {
  light: {
    background: '#f0f2f5',
    cardBackground: '#ffffff',
    text: '#333333',
    subText: '#666666',
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    borderColor: '#e0e0e0',
    headerBackground: '#ffffff',
    shadowColor: '#000',
    headerIcon: '#333',
    locationTextHeaderColor: '#005bb5', // Cor mais específica para o texto de localização
  },
  dark: {
    background: '#1a1a2e',
    cardBackground: '#1e214d',
    text: '#e0e0e0',
    subText: '#b0b0b0',
    primary: '#6b92f7',
    secondary: '#9a9a9a',
    success: '#4CAF50',
    borderColor: '#3a3a5e',
    headerBackground: '#1e214d',
    shadowColor: '#000',
    headerIcon: '#e0e0e0',
    locationTextHeaderColor: '#8da8ff', // Cor mais específica para o texto de localização no tema escuro
  },
};

const getThemedStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    paddingTop: RNPlatform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 40,
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
    color: themeColors.locationTextHeaderColor, // Usando a nova cor específica
    marginLeft: 4,
    fontWeight: 'bold', // Mais vivo
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
  mainContentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  leftNav: {
    width: 0,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  tireImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  whatsAppButton: {
    backgroundColor: '#25D366', // Mantém o verde do WhatsApp
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  whatsAppButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
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
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderColor,
  },
  serviceText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: themeColors.text,
  },
  arrowIcon: {
    marginLeft: 'auto',
    color: themeColors.subText,
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
    fontWeight: 'bold', // Mais vivo
    color: themeColors.text, // Mais vivo
  },
  nearbyPlaceType: {
    fontSize: 14,
    color: themeColors.subText,
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: themeColors.cardBackground,
    height: 65,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: RNPlatform.OS === 'ios' ? 10 : 0,
  },
  themeToggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});

export default function App() {
  const whatsappPhoneNumber = '558198950884';
  const whatsappMessage = 'Olá! Gostaria de verificar a disponibilidade de serviços.';

  const [userLocation, setUserLocation] = useState<string>('Buscando localização...');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [locaisProximos, setLocaisProximos] = useState<TireShop[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: -8.1030,
    longitude: -34.9284,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedServices, setExpandedServices] = useState(true);
  const [expandedNearbyPlaces, setExpandedNearbyPlaces] = useState(true); // Novo estado para Locais Próximos

  const systemColorScheme = useColorScheme();
  const [userSelectedTheme, setUserSelectedTheme] = useState<'light' | 'dark' | null>(null);

  const currentTheme = userSelectedTheme || systemColorScheme || 'light';
  const themeColors = Colors[currentTheme];
  const dynamicStyles = getThemedStyles(themeColors);

  const toggleAppTheme = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUserSelectedTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return null; // Volta para o tema do sistema
      return systemColorScheme === 'light' ? 'dark' : 'light'; // Alterna se o sistema for desconhecido
    });
  };

  function calcularDistancia(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    function toRad(x: number): number {
      return (x * Math.PI) / 180;
    }
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

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

        const raioDeBuscaKm = 20;
        const filteredLocais = (allTireShops as TireShop[]).filter((local: TireShop) => {
          const distancia = calcularDistancia(
            location.coords.latitude,
            location.coords.longitude,
            local.latitude,
            local.longitude
          );
          return distancia < raioDeBuscaKm;
        });
        setLocaisProximos(filteredLocais);

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

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      const raioDeBuscaKm = 20;
      if (currentLocationCoords) {
        const filteredLocais = (allTireShops as TireShop[]).filter((local: TireShop) => {
          const distancia = calcularDistancia(
            currentLocationCoords.latitude,
            currentLocationCoords.longitude,
            local.latitude,
            local.longitude
          );
          return distancia < raioDeBuscaKm;
        });
        setLocaisProximos(filteredLocais);
      } else {
        setLocaisProximos([]);
      }
    } else {
      const filtered = (allTireShops as TireShop[]).filter((local: TireShop) =>
        local.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        local.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setLocaisProximos(filtered);
    }
  };

  const toggleServices = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedServices(!expandedServices);
  };

  const toggleNearbyPlaces = () => { // Nova função para Locais Próximos
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedNearbyPlaces(!expandedNearbyPlaces);
  };

  return (
    <View style={dynamicStyles.container}>
      <ExpoStatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />

      {/* Cabeçalho do Aplicativo */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerTop}>
          <TouchableOpacity style={dynamicStyles.backButton} onPress={() => Alert.alert('Navegação', 'Botão Voltar Pressionado')}>
            <AntDesign name="arrowleft" size={24} color={themeColors.headerIcon} />
          </TouchableOpacity>
          <Text style={dynamicStyles.appTitle}>Borracharia App</Text>
          {/* Botão de alternar tema */}
          <TouchableOpacity
            style={dynamicStyles.themeToggleButton}
            onPress={toggleAppTheme}
          >
            <MaterialIcons name={currentTheme === 'light' ? 'wb-sunny' : 'nightlight-round'} size={24} color={themeColors.headerIcon} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.headerBottom}>
          {/* Componente de localização no cabeçalho */}
          <TouchableOpacity
            style={dynamicStyles.locationDisplay}
            onPress={() => locationErrorMsg ? Alert.alert('Erro de Localização', locationErrorMsg) : Alert.alert('Localização', `Sua localização atual: ${userLocation}.`)}
          >
            <MaterialIcons name="location-on" size={18} color={themeColors.primary} />
            <Text style={dynamicStyles.locationTextHeader}>
              {userLocation}
            </Text>
          </TouchableOpacity>

          {/* Barra de Pesquisa */}
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

      {/* Área Principal de Conteúdo */}
      <View style={dynamicStyles.mainContentWrapper}>
        <View style={dynamicStyles.leftNav} />

        {/* Conteúdo Rolável */}
        <ScrollView style={dynamicStyles.scrollContent}>
          {/* Imagem Principal da Seção */}
          <Image
            source={require('./assets/Borracharia.png')}
            style={dynamicStyles.tireImage}
            resizeMode="cover"
          />

          {/* BOTÃO "ENVIAR DISPONIBILIDADE VIA WHATSAPP" */}
          <TouchableOpacity style={dynamicStyles.whatsAppButton} onPress={() => openWhatsApp(whatsappPhoneNumber, whatsappMessage)}>
            <FontAwesome name="whatsapp" size={24} color="white" style={{ marginRight: 10 }} />
            <Text style={dynamicStyles.whatsAppButtonText}>Enviar Disponibilidade via WhatsApp</Text>
          </TouchableOpacity>

          {/* Seção de AutoServiços - Com lógica de expansão/retração */}
          <View style={dynamicStyles.section}>
            <TouchableOpacity style={dynamicStyles.sectionHeader} onPress={toggleServices}>
              <Text style={dynamicStyles.sectionTitle}>AutoServiços</Text>
              <AntDesign name={expandedServices ? "minus" : "plus"} size={20} color={themeColors.text} />
            </TouchableOpacity>
            {expandedServices && (
              <View>
                <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => Alert.alert('Serviço', 'Reparo de Pneus selecionado')}>
                  <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
                  <Text style={dynamicStyles.serviceText}>Reparo de Pneus</Text>
                  <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => Alert.alert('Serviço', 'Alinhamento de Rodas selecionado')}>
                  <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
                  <Text style={dynamicStyles.serviceText}>Alinhamento de Rodas</Text>
                  <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => Alert.alert('Serviço', 'Alinhamento Geral selecionado')}>
                  <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
                  <Text style={dynamicStyles.serviceText}>Alinhamento Geral</Text>
                  <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => Alert.alert('Serviço', 'Manutenção Geral selecionado')}>
                  <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
                  <Text style={dynamicStyles.serviceText}>Manutenção Geral</Text>
                  <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Seção: Locais Próximos (Borracharias/Oficinas) - Agora com expansão/retração */}
          <View style={dynamicStyles.section}>
            <TouchableOpacity style={dynamicStyles.sectionHeader} onPress={toggleNearbyPlaces}>
              <Text style={dynamicStyles.sectionTitle}>Locais Próximos ({locaisProximos.length} encontrados)</Text>
              <AntDesign name={expandedNearbyPlaces ? "minus" : "plus"} size={20} color={themeColors.text} />
            </TouchableOpacity>
            {expandedNearbyPlaces && ( // Renderiza apenas se expandido
              locaisProximos.length > 0 ? (
                locaisProximos.map((local) => (
                  <View key={local.id} style={dynamicStyles.nearbyPlaceItem}>
                    <View style={dynamicStyles.nearbyPlaceTextContainer}>
                      <Text style={dynamicStyles.nearbyPlaceName}>{local.name}</Text>
                      <Text style={dynamicStyles.nearbyPlaceType}>{local.type}</Text>
                    </View>
                    <View style={dynamicStyles.nearbyPlaceButtons}>
                      <TouchableOpacity
                        style={dynamicStyles.nearbyPlaceButton}
                        onPress={() => makePhoneCall(local.phoneNumber)}
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

          {/* Seção de Localização com Mini Mapa */}
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>Sua Localização no Mapa</Text>
              <AntDesign name="minus" size={20} color={themeColors.text} />
            </View>
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
          </View>

          {/* Espaço para garantir a rolagem do conteúdo acima da barra de navegação inferior */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* Barra de Navegação Inferior - Agora vazia e branca */}
      <View style={dynamicStyles.bottomNav}>
        {/* Conteúdo da barra de navegação inferior pode ser adicionado aqui, se desejar */}
      </View>
    </View>
  );
}

// Estes estilos não são dinâmicos e foram movidos para fora de `getThemedStyles`
// para evitar redefinição desnecessária e manter a cor do WhatsApp fixa.
const styles = StyleSheet.create({
  whatsAppButton: {
    backgroundColor: '#25D366', // Verde WhatsApp
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  whatsAppButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});