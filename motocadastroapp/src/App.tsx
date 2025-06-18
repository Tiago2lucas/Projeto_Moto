// App.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { useTheme } from './hooks/useTheme';
import { MapSection } from './components/MapSection';
import { NearbyPlacesSection } from './components/NearbyPlacesSection';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { AddLocationScreen } from './screens/AddLocationScreen';
import { TireShop } from './types/interface';
import { useLocation } from './hooks/useLocation';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const HomeScreen: React.FC<{ onNavigateToAddLocation: () => void; themeColors: any; }> = ({ onNavigateToAddLocation, themeColors }) => {
  const {
    currentLocationCoords,
    mapRegion,
    userLocation,
    locationErrorMsg,
    expandedNearbyPlaces,
    toggleNearbyPlaces,
    locaisProximos,
    isLoadingLocationAndShops
  } = useLocation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.headerSpacer} />
      <Header
        title="Borracharia e Oficina 24 horas"
        themeColors={themeColors}
        onAddLocationPress={onNavigateToAddLocation}
      />
      <MapSection
        themeColors={themeColors}
        currentLocationCoords={currentLocationCoords}
        mapRegion={mapRegion}
        userLocation={userLocation}
        locaisProximos={locaisProximos}
        locationErrorMsg={locationErrorMsg}
      />
      <NearbyPlacesSection
        themeColors={themeColors}
        locaisProximos={locaisProximos}
        locationErrorMsg={locationErrorMsg}
        expandedNearbyPlaces={expandedNearbyPlaces}
        toggleNearbyPlaces={toggleNearbyPlaces}
        currentLocationCoords={currentLocationCoords}
      />
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};


export default function App() {
  // --- MUDANÇA AQUI: DESESTRUTURANDO O RETORNO DO useTheme ---
  const { themeColors, isDark } = useTheme();
  // -----------------------------------------------------------

  const [currentScreen, setCurrentScreen] = useState<'home' | 'addLocation'>('home');

  const handleNavigateToAddLocation = useCallback(() => {
    setCurrentScreen('addLocation');
  }, []);

  const handleGoBackFromAddLocation = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  const handleLocationAdded = useCallback(() => {
    setCurrentScreen('home');
  }, []);


  return (
    <View style={[styles.appContainer, { backgroundColor: themeColors.background }]}>
      {currentScreen === 'home' ? (
        <HomeScreen
          onNavigateToAddLocation={handleNavigateToAddLocation}
          themeColors={themeColors}
        />
      ) : (
        <AddLocationScreen
          onGoBack={handleGoBackFromAddLocation}
          onLocationAdded={handleLocationAdded}
        />
      )}
      {currentScreen === 'home' && <BottomNav themeColors={themeColors} />}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'} /* <--- USANDO 'isDark' AQUI */
        backgroundColor={themeColors.headerBackground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: 'transparent',
  },
  testButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});