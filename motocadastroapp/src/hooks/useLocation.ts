// src/hooks/useLocation.ts

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { TireShop } from '../types/interface'; // Importa o tipo TireShop

interface LocationHook {
  currentLocationCoords: { latitude: number; longitude: number } | null;
  mapRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null;
  userLocation: Location.LocationObject | null;
  locationErrorMsg: string | null;
  locaisProximos: TireShop[]; // Agora será populado via API ou mock local
  expandedNearbyPlaces: boolean;
  toggleNearbyPlaces: () => void;
  isLoadingLocationAndShops: boolean;
  // Não teremos mais fetchTireShops aqui diretamente para o banco de dados
  // fetchTireShops: () => Promise<void>; // Removido ou reescrito para API
}

export const useLocation = (): LocationHook => {
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [locaisProximos, setLocaisProximos] = useState<TireShop[]>([]); // Será preenchido por requisição a sua API
  const [expandedNearbyPlaces, setExpandedNearbyPlaces] = useState(false);
  const [isLoadingLocationAndShops, setIsLoadingLocationAndShops] = useState(true); // Controla o loading

  const toggleNearbyPlaces = useCallback(() => {
    setExpandedNearbyPlaces(prev => !prev);
  }, []);

  // Função para buscar a localização do usuário
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permissão para acessar a localização foi negada.');
        setIsLoadingLocationAndShops(false);
        return;
      }

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
      // Uma vez que a localização é obtida, agora simularíamos a busca das lojas
      // ou a HomeScreen chamaria a API.
      simulateFetchTireShopsFromAPI(); // Simula a busca de lojas após obter a localização
    })();
  }, []); // Executa apenas uma vez ao montar

  // SIMULAÇÃO: Como as lojas viriam de uma API (para preencher locaisProximos)
  const simulateFetchTireShopsFromAPI = useCallback(async () => {
    setIsLoadingLocationAndShops(true);
    try {
      // *** AQUI VOCÊ FARIA A REQUISIÇÃO GET PARA SEU BACKEND PHP/MYSQL ***
      // Exemplo: const response = await fetch('http://YOUR_BACKEND_IP_OR_DOMAIN/api/v1/tire_shops');
      // const data = await response.json();
      // setLocaisProximos(data);

      // Por enquanto, vamos usar dados mockados para o frontend funcionar
      const mockData: TireShop[] = [
        {
          id: 'mock1',
          name: 'Borracharia Central (Mock)',
          type: 'Borracharia',
          address: 'Rua da Saudade, 100, Boa Vista, Recife - PE',
          latitude: -8.0577, // Proximidade de Jaboatão
          longitude: -34.8827,
          cep: '50050000',
          number: '100',
          phone: '81911112222',
          is24Hours: true,
          images: ['https://via.placeholder.com/150/0000FF/FFFFFF?text=BC1', 'https://via.placeholder.com/150/FF0000/FFFFFF?text=BC2'],
          servicesOffered: 'Conserto de pneus, Venda de pneus novos, Balanceamento',
        },
        {
          id: 'mock2',
          name: 'Oficina Rápida (Mock)',
          type: 'Oficina',
          address: 'Av. Caxangá, 200, Caxangá, Recife - PE',
          latitude: -8.0490,
          longitude: -34.9358,
          cep: '50710000',
          number: '200',
          phone: '81933334444',
          is24Hours: false,
          images: ['https://via.placeholder.com/150/00FF00/000000?text=OR1'],
          servicesOffered: 'Troca de óleo, Alinhamento e balanceamento',
        },
        {
            id: 'mock3',
            name: 'Borracharia do Zé (Mock)',
            type: 'Borracharia',
            address: 'Rua do Sol, 50, Piedade, Jaboatão dos Guararapes - PE',
            latitude: -8.1738,
            longitude: -34.9080,
            cep: '54400000',
            number: '50',
            phone: '81955556666',
            is24Hours: true,
            hasWhatsApp: true,
            whatsappNumber: '81955556666',
            images: ['https://via.placeholder.com/150/FF00FF/000000?text=BZ1'],
            servicesOffered: 'Recapagem, Borracharia móvel',
            simplifiedReferencePoint: 'Esquina com a Avenida Principal',
            detailedReferencePoint: 'Prédio azul, portão grande de metal, em frente à loja de conveniência.'
        }
      ];
      setLocaisProximos(mockData);

    } catch (error) {
      console.error("Erro ao buscar locais (simulado):", error);
      setLocationErrorMsg("Erro ao carregar locais do servidor.");
    } finally {
      setIsLoadingLocationAndShops(false);
    }
  }, []);


  // Retorna os valores e funções que o componente precisa
  return {
    currentLocationCoords,
    mapRegion,
    userLocation,
    locationErrorMsg,
    locaisProximos,
    expandedNearbyPlaces,
    toggleNearbyPlaces,
    isLoadingLocationAndShops,
  };
};