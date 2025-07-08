// App.tsx

import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Image, Platform, UIManager, ActivityIndicator, Text, TouchableOpacity, LayoutAnimation } from 'react-native';

// Importar de hooks
import { useLocation } from './hooks/useLocation';
import { useTheme } from './hooks/useTheme';

// Importar de components
import { Header } from './components/Header';
import { ServiceSection } from './components/ServiceSection';
import { NearbyPlacesSection } from './components/NearbyPlacesSection';
import { MapSection } from './components/MapSection';
import { BottomNav } from './components/BottomNav';


import { TireShop } from './types/interface'; 

// Habilitar LayoutAnimation para Android (ainda é um no-op na Nova Arquitetura, mas mantemos por compatibilidade)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  // Estados e lógica de localização e busca de locais via hook
  const { userLocation, locationErrorMsg, currentLocationCoords, locaisProximos, isLoadingLocationAndShops } = useLocation();

  // Estados e lógica de tema via hook
  const { currentTheme, themeColors, toggleAppTheme } = useTheme();

  // Estado para a região do mapa
  const [mapRegion, setMapRegion] = useState({
    latitude: -8.1030, // Padrão inicial
    longitude: -34.9284, // Padrão inicial
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Estados para a funcionalidade de busca
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayedLocais, setDisplayedLocais] = useState<TireShop[]>([]); // Nova lista para exibir (filtrada ou completa)

  // Estados para expansão/colapso das seções
  const [expandedServices, setExpandedServices] = useState(true);
  const [expandedNearbyPlaces, setExpandedNearbyPlaces] = useState(true);

  // NOVOS ESTADOS PARA SELEÇÃO DE LOCAL E IMAGEM DINÂMICA
  const [selectedTireShop, setSelectedTireShop] = useState<TireShop | null>(null);
  const [displayedImageUri, setDisplayedImageUri] = useState<string>(require('./img/Borracharia.png')); // Imagem padrão

  // Função de busca atualizada para filtrar os dados do backend
  const handleSearch = useCallback(() => {
    // CORREÇÃO AQUI: Removido o erro de digitação "LayoutLayoutAnimation"
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 

    if (searchQuery.trim() === '') {
      setDisplayedLocais(locaisProximos);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = locaisProximos.filter((local: TireShop) => {
        const matchesName = local.nome_local.toLowerCase().includes(query);
        const matchesServices = local.servicos_oferecidos?.toLowerCase().includes(query);
        return matchesName || matchesServices;
      });
      setDisplayedLocais(filtered);
    }
  }, [searchQuery, locaisProximos]);

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

  // Efeito para inicializar displayedLocais com os locais carregados do backend
  useEffect(() => {
    if (!isLoadingLocationAndShops && !locationErrorMsg) {
      if (searchQuery.trim() === '') {
        setDisplayedLocais(locaisProximos);
      } else {
        handleSearch();
      }
      // Se não houver local selecionado, e locaisProximos for carregado,
      // tente definir a imagem principal para a primeira imagem do primeiro local, se houver.
      if (!selectedTireShop && locaisProximos.length > 0) {
        const firstShop = locaisProximos[0];
        try {
          const fotosArray = firstShop.fotos_local_json ? JSON.parse(firstShop.fotos_local_json) : [];
          if (fotosArray.length > 0) {
            setDisplayedImageUri(fotosArray[0]);
          } else {
            setDisplayedImageUri(require('./img/Borracharia.png')); // Volta para a imagem padrão se não houver fotos
          }
        } catch (e) {
          console.error("Erro ao parsear fotos_local_json do primeiro local:", e);
          setDisplayedImageUri(require('./img/Borracharia.png'));
        }
      }
    }
  }, [locaisProximos, isLoadingLocationAndShops, locationErrorMsg, searchQuery, handleSearch, selectedTireShop]);

  // Função para lidar com a seleção de um local
  const handleShopSelect = useCallback((shop: TireShop) => {
    setSelectedTireShop(shop);
    // Tenta usar a primeira foto do local, se existir
    try {
      const fotosArray = shop.fotos_local_json ? JSON.parse(shop.fotos_local_json) : [];
      if (fotosArray.length > 0) {
        setDisplayedImageUri(fotosArray[0]);
      } else {
        setDisplayedImageUri(require('./img/Borracharia.png')); // Volta para a imagem padrão se não houver fotos
      }
    } catch (e) {
      console.error("Erro ao parsear fotos_local_json do local selecionado:", e);
      setDisplayedImageUri(require('./img/Borracharia.png'));
    }
    // Opcional: Rolar para o topo ou para a seção de serviços
    // scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Função para alternar a expansão da seção de serviços
  const toggleServices = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedServices(prev => !prev);
  }, []);

  // Função para alternar a expansão da seção de locais próximos
  const toggleNearbyPlaces = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedNearbyPlaces(prev => !prev);
  }, []);

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
          {/* IMAGEM SUPERIOR DINÂMICA COM MOLDURA */}
          <Image
            source={typeof displayedImageUri === 'string' ? { uri: displayedImageUri } : displayedImageUri}
            style={getAppStyles(themeColors).tireImage}
            resizeMode="cover"
            onError={(e) => {
              console.warn("Erro ao carregar imagem, usando fallback:", e.nativeEvent.error);
              setDisplayedImageUri(require('./img/Borracharia.png')); // Fallback em caso de erro na URI
            }}
          />

          <ServiceSection
            themeColors={themeColors}
            expandedServices={expandedServices}
            toggleServices={toggleServices}
            // PASSA OS SERVIÇOS DO LOCAL SELECIONADO OU UMA MENSAGEM PADRÃO
            servicesToDisplay={selectedTireShop ? selectedTireShop.servicos_oferecidos : "Nenhum local selecionado. Clique em um local próximo para ver os serviços."}
          />

          {isLoadingLocationAndShops ? (
            <View style={getAppStyles(themeColors).loadingContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text style={getAppStyles(themeColors).loadingText}>Carregando locais...</Text>
            </View>
          ) : locationErrorMsg ? (
            <View style={getAppStyles(themeColors).errorContainer}>
              <Text style={getAppStyles(themeColors).errorText}>{locationErrorMsg}</Text>
            </View>
          ) : (
            <NearbyPlacesSection
              themeColors={themeColors}
              locaisProximos={displayedLocais}
              locationErrorMsg={locationErrorMsg}
              expandedNearbyPlaces={expandedNearbyPlaces}
              toggleNearbyPlaces={toggleNearbyPlaces}
              currentLocationCoords={currentLocationCoords}
              onSelectShop={handleShopSelect}
            />
          )}

          <MapSection
            themeColors={themeColors}
            currentLocationCoords={currentLocationCoords}
            mapRegion={mapRegion}
            userLocation={userLocation}
            locaisProximos={displayedLocais}
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
    // ESTILOS PARA A MOLDURA ELEGANTE
    borderWidth: 2, // Espessura da borda
    borderColor: themeColors.primary, // Cor da borda (pode ser ajustada)
    shadowColor: '#000', // Cor da sombra
    shadowOffset: { width: 0, height: 4 }, // Deslocamento da sombra
    shadowOpacity: 0.3, // Opacidade da sombra
    shadowRadius: 6, // Raio da sombra
    elevation: 8, // Elevação para Android
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});
