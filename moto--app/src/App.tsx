import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Platform, UIManager, Alert, LayoutAnimation } from 'react-native';

// Importar de hooks
import { useLocation } from './hooks/useLocation';
import { useTheme } from './hooks/useTheme';

// Importar de components
import { Header } from './components/Header';
import { ServiceSection } from './components/ServiceSection';
import { NearbyPlacesSection } from './components/NearbyPlacesSection';
import { MapSection } from './components/MapSection';
import { WhatsAppButton } from './components/WhatsAppButton';
import { BottomNav } from './components/BottomNav';

// Importar types
import { TireShop } from './types/interface'; // Sua interface existente

// Importar locais.json
// Ajuste o caminho conforme sua estrutura:
// Pela imagem, 'location' está dentro de 'src' no mesmo nível de 'App.tsx'
import allTireShops from './location/locais.json'; 

// Importar funções utilitárias que eram 'require' ou 'openGoogleMapsToDestination'
import { calcularDistancia, openGoogleMapsToDestination } from './utils/mapsUtils'; // <--- CORREÇÃO AQUI
import { openWhatsApp, makePhoneCall } from './utils/communicationUtils'; // <--- Adicione se precisar aqui (não usado diretamente no App.tsx atualmente)


// Habilitar LayoutAnimation para Android (ainda é um no-op na Nova Arquitetura, mas mantemos por compatibilidade)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const whatsappPhoneNumber = '558198950884';
  const whatsappMessage = 'Olá! Gostaria de verificar a disponibilidade de serviços.';

  // Estados e lógica de localização via hook
  const { userLocation, locationErrorMsg, currentLocationCoords, locaisProximos, setLocaisProximos } = useLocation(allTireShops as TireShop[]);

  // Estados e lógica de tema via hook
  const { currentTheme, themeColors, toggleAppTheme } = useTheme();

  const [mapRegion, setMapRegion] = useState({
    latitude: -8.1030, // Padrão inicial
    longitude: -34.9284, // Padrão inicial
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedServices, setExpandedServices] = useState(true);
  const [expandedNearbyPlaces, setExpandedNearbyPlaces] = useState(true);

  // Efeito para atualizar a região do mapa quando a localização muda
  useEffect(() => {
    if (currentLocationCoords) {
      setMapRegion(prev => ({
        ...prev,
        latitude: currentLocationCoords.latitude,
        longitude: currentLocationCoords.longitude,
      }));
    }
  }, [currentLocationCoords]);


  const handleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Adicionei animação à pesquisa
    if (searchQuery.trim() === '') {
      const raioDeBuscaKm = 20;
      if (currentLocationCoords) {
        const filteredLocais = (allTireShops as TireShop[]).filter((local: TireShop) => {
          // calcularDistancia agora vem da importação direta no topo
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

  const toggleNearbyPlaces = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedNearbyPlaces(!expandedNearbyPlaces);
  };

  return (
    <View style={getAppStyles(themeColors).container}>
      <ExpoStatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />

      <Header
        themeColors={themeColors}
        userLocation={userLocation}
        locationErrorMsg={locationErrorMsg}
        toggleAppTheme={toggleAppTheme}
        currentTheme={currentTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      <View style={getAppStyles(themeColors).mainContentWrapper}>
        <View style={getAppStyles(themeColors).leftNav} />

        <ScrollView style={getAppStyles(themeColors).scrollContent}>
          <Image
            source={require('./img/Borracharia.png')} // Caminho ajustado pela estrutura
            style={getAppStyles(themeColors).tireImage}
            resizeMode="cover"
          />

          <WhatsAppButton phoneNumber={whatsappPhoneNumber} message={whatsappMessage} />

          <ServiceSection
            themeColors={themeColors}
            expandedServices={expandedServices}
            toggleServices={toggleServices}
          />

          <NearbyPlacesSection
            themeColors={themeColors}
            locaisProximos={locaisProximos}
            locationErrorMsg={locationErrorMsg}
            expandedNearbyPlaces={expandedNearbyPlaces}
            toggleNearbyPlaces={toggleNearbyPlaces}
            currentLocationCoords={currentLocationCoords} // <--- PASSA A LOCALIZAÇÃO PARA O NearbyPlacesSection
          />

          <MapSection
            themeColors={themeColors}
            currentLocationCoords={currentLocationCoords}
            mapRegion={mapRegion}
            userLocation={userLocation}
            locaisProximos={locaisProximos}
            locationErrorMsg={locationErrorMsg}
          />

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      <BottomNav themeColors={themeColors} />
    </View>
  );
}

const getAppStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  mainContentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  leftNav: {
    width: 0, // Ajuste se for adicionar uma barra lateral
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
});