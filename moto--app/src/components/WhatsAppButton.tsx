import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { openWhatsApp } from '../utils/communicationUtils'; // Importar de utils

interface WhatsAppButtonProps {
  phoneNumber: string;
  message: string;
}

export const WhatsAppButton = ({ phoneNumber, message }: WhatsAppButtonProps) => {
  return (
    <TouchableOpacity style={styles.whatsAppButton} onPress={() => openWhatsApp(phoneNumber, message)}>
      <FontAwesome name="whatsapp" size={24} color="white" style={{ marginRight: 10 }} />
      <Text style={styles.whatsAppButtonText}>Enviar Disponibilidade via WhatsApp</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  whatsAppButton: {
    backgroundColor: '#25D366', // Verde WhatsApp fixo
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