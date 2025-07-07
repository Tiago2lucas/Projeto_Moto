import { Linking, Alert } from 'react-native';

export const openWhatsApp = (phoneNumber: string, message: string) => {
  let url = '';
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
  url = `whatsapp://send?phone=${cleanedPhoneNumber}&text=${encodeURIComponent(message)}`;

  Linking.openURL(url).catch(err => {
    console.error('Erro ao abrir o WhatsApp:', err);
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Certifique-se de que ele está instalado.');
  });
};

export const makePhoneCall = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url).catch(err => {
    console.error('Erro ao fazer a chamada:', err);
    Alert.alert('Erro', 'Não foi possível fazer a chamada.');
  });
};