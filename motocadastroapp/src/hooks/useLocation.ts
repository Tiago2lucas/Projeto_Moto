// src/hooks/useLocation.ts

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { TireShop, LocationCoords } from '../types/interface'; // Importa o tipo TireShop e LocationCoords

// Defina a URL base do seu backend aqui.
// IMPORTANTE:
// - Para emuladores Android, use 'http://10.0.2.2:3000'
// - Para dispositivos físicos (celular real), use o ENDEREÇO IP DA SUA MÁQUINA
//   na rede local (ex: 'http://192.168.1.14:3000').
//   Certifique-se de que seu celular e computador estejam na mesma rede Wi-Fi.
const API_BASE_URL = 'http://192.168.1.14:3000'; // AJUSTE AQUI: Use o IP da sua máquina ou o do emulador

interface LocationHook {
  currentLocationCoords: LocationCoords | null;
  mapRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null;
  userLocation: Location.LocationObject | null;
  locationErrorMsg: string | null;
  locaisProximos: TireShop[];
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  isLoadingLocationAndShops: boolean;
  // Agora, podemos adicionar uma função para recarregar os locais, se necessário
  // reloadLocais: () => void; // Adicionei para permitir recarregar a lista
}

export const useLocation = (): LocationHook => {
  const [currentLocationCoords, setCurrentLocationCoords] = useState<LocationCoords | null>(null);
  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [locaisProximos, setLocaisProximos] = useState<TireShop[]>([]);
  const [expandedNearbyPlaces, setExpandedNearbyPlaces] = useState(false);
  const [isLoadingLocationAndShops, setIsLoadingLocationAndShops] = useState(true);

  // Função para alternar a expansão da seção "Locais Próximos"
  const toggleNearbyPlaces = useCallback(() => {
    setExpandedNearbyPlaces(prev => !prev);
  }, []);

  // FUNÇÃO PRINCIPAL: Buscar os locais do backend
  const fetchLocaisFromBackend = useCallback(async () => {
    setIsLoadingLocationAndShops(true); // Ativa o loading
    setLocationErrorMsg(null); // Limpa erros anteriores
    try {
      const response = await fetch(`${API_BASE_URL}/locais`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar locais do backend.');
      }

      const responseData = await response.json();
      
      // CONVERSÃO CRUCIAL: Mapeia os dados recebidos e converte latitude/longitude para números
      const convertedLocais: TireShop[] = responseData.data.map((local: any) => ({
        ...local,
        latitude: parseFloat(local.latitude), // Converte para número
        longitude: parseFloat(local.longitude), // Converte para número
      }));

      setLocaisProximos(convertedLocais); // Atualiza o estado com os dados convertidos
    } catch (err: any) {
      console.error('Erro ao buscar locais do backend:', err);
      setLocationErrorMsg(`Não foi possível carregar os locais: ${err.message}`);
      // Alert.alert('Erro', `Não foi possível carregar os locais: ${err.message}`); // Evitar muitos alerts em hooks
    } finally {
      setIsLoadingLocationAndShops(false); // Desativa o loading
    }
  }, []); // Sem dependências, pois API_BASE_URL é constante

  // Efeito para buscar a localização do usuário e, em seguida, os locais do backend
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingLocationAndShops(true); // Inicia o loading para ambas as operações

      // 1. Buscar localização do usuário
      let locationStatus = await Location.requestForegroundPermissionsAsync();
      if (locationStatus.status !== 'granted') {
        setLocationErrorMsg('Permissão para acessar a localização foi negada.');
        // Mesmo sem permissão de localização, tentamos carregar as lojas
      } else {
        try {
          let location = await Location.getCurrentPositionAsync({});
          setUserLocation(location);
          setCurrentLocationCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } catch (err) {
          console.error("Erro ao obter localização:", err);
          setLocationErrorMsg("Não foi possível obter sua localização atual.");
        }
      }

      // 2. Buscar locais do backend (sempre tenta, independentemente da localização)
      await fetchLocaisFromBackend(); // Chama a função de busca de locais
    };

    initializeData();
  }, [fetchLocaisFromBackend]); // Depende de fetchLocaisFromBackend para que seja chamado corretamente

  // Retorna os valores e funções que o componente precisa
  return {
    currentLocationCoords,
    mapRegion,
    userLocation,
    locationErrorMsg,
    locaisProximos, // Agora contém os dados reais do backend
    expandedNearbyPlaces,
    toggleNearbyPlaces,
    isLoadingLocationAndShops,
    // reloadLocais: fetchLocaisFromBackend, // Expor a função para recarregar a lista, se necessário
  };
};
