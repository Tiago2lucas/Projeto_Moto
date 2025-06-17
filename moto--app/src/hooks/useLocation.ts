import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { calcularDistancia } from '../utils/mapsUtils'; // Importar de utils

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const useLocation = (allTireShops: any[]) => { // allTireShops agora é passado como argumento
  const [userLocation, setUserLocation] = useState<string>('Buscando localização...');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [currentLocationCoords, setCurrentLocationCoords] = useState<LocationCoords | null>(null);
  const [locaisProximos, setLocaisProximos] = useState<any[]>([]); // Use any[] ou defina um tipo mais específico

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

        const raioDeBuscaKm = 20;
        const filteredLocais = allTireShops.filter((local: any) => { // Use any ou TireShop
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
  }, [allTireShops]); // Adicionado allTireShops como dependência

  return { userLocation, locationErrorMsg, currentLocationCoords, locaisProximos, setLocaisProximos };
};