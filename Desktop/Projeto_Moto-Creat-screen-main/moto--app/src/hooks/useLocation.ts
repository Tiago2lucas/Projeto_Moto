// src/hooks/useLocation.ts

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native'; // Mantido para alertas de permissão
import { TireShop, LocationCoords } from '../types/interface'; // Importa o tipo TireShop e LocationCoords
import { calcularDistancia } from '../utils/mapsUtils'; // Importado para uso futuro, se necessário

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
  userLocation: Location.LocationObject | null; // Tipo corrigido para Location.LocationObject
  locationErrorMsg: string | null;
  locaisProximos: TireShop[]; // Tipo corrigido para TireShop[]
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  isLoadingLocationAndShops: boolean;
  // reloadLocais: () => void; // Pode ser adicionado se precisar de uma função para recarregar manualmente
}

export const useLocation = (): LocationHook => { // Removido allTireShops do argumento
  const [currentLocationCoords, setCurrentLocationCoords] = useState<LocationCoords | null>(null);
  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null); // Estado para o objeto de localização completo
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [locaisProximos, setLocaisProximos] = useState<TireShop[]>([]); // Será preenchido por requisição a sua API
  const [expandedNearbyPlaces, setExpandedNearbyPlaces] = useState(false);
  const [isLoadingLocationAndShops, setIsLoadingLocationAndShops] = useState(true); // Controla o loading

  // Função para alternar a expansão da seção "Locais Próximos"
  const toggleNearbyPlaces = useCallback(() => {
    setExpandedNearbyPlaces(prev => !prev);
  }, []);

  // FUNÇÃO PRINCIPAL: Buscar os locais do backend
  const fetchLocaisFromBackend = useCallback(async () => {
    // setIsLoadingLocationAndShops(true); // O loading já é ativado pelo useEffect principal
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
        id: Number(local.id), // Garante que o ID seja um número
        latitude: parseFloat(local.latitude), // Converte para número
        longitude: parseFloat(local.longitude), // Converte para número
        // Certifica-se que 0/1 do DB vira booleanos para hasWhatsApp e is24Hours se forem usados diretamente
        telefone_whatsapp: Number(local.telefone_whatsapp), // Mantém como number (0 ou 1) para consistência com o DB
        aberto_24_horas: Number(local.aberto_24_horas), // Mantém como number (0 ou 1)
      }));

      setLocaisProximos(convertedLocais); // Atualiza o estado com os dados reais
    } catch (err: any) {
      console.error('Erro ao buscar locais do backend:', err);
      setLocationErrorMsg(`Não foi possível carregar os locais: ${err.message}`);
      // Alert.alert('Erro', `Não foi possível carregar os locais: ${err.message}`); // Evitar muitos alerts em hooks
    } finally {
      // setIsLoadingLocationAndShops(false); // O loading será desativado no useEffect principal
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
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setUserLocation(location); // Define o objeto de localização completo
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

          // Opcional: Reverter geocodificação para exibir o endereço do usuário
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
            // setUserLocation(formattedAddress || `Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`);
            // Se userLocation é um objeto, não sobrescreva com string aqui.
            // O Header pode usar userLocation.coords para exibir Lat/Lon ou fazer a geocodificação reversa.
          }
        } catch (err) {
          console.error("Erro ao obter localização:", err);
          setLocationErrorMsg("Não foi possível obter sua localização atual.");
        }
      }

      // 2. Buscar locais do backend (sempre tenta, independentemente da localização)
      await fetchLocaisFromBackend(); // Chama a função de busca de locais
      setIsLoadingLocationAndShops(false); // Desativa o loading após ambas as operações
    };

    initializeData();
  }, [fetchLocaisFromBackend]); // Depende de fetchLocaisFromBackend para que seja chamado corretamente

  // Retorna os valores e funções que o componente precisa
  return {
    currentLocationCoords,
    mapRegion,
    userLocation, // Retorna o objeto de localização
    locationErrorMsg,
    locaisProximos, // Agora contém os dados reais do backend
    expandedNearbyPlaces,
    toggleNearbyPlaces,
    isLoadingLocationAndShops,
    // reloadLocais: fetchLocaisFromBackend, // Expor a função para recarregar a lista, se necessário
  };
};
