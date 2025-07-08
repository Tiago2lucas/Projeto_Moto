import { Platform, Linking, Alert } from 'react-native';

export const openGoogleMapsToDestination = (destinationLatitude: number, destinationLongitude: number, label: string) => {
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

export function calcularDistancia(
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
  return R * c;
}