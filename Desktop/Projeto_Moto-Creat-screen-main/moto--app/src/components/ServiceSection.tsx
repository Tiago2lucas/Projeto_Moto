// src/components/ServiceSection.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface ServiceSectionProps {
  themeColors: any;
  expandedServices: boolean;
  toggleServices: () => void;
  servicesToDisplay: string | null; // <--- TIPO ATUALIZADO AQUI: agora aceita string ou null
}

export const ServiceSection: React.FC<ServiceSectionProps> = ({
  themeColors,
  expandedServices,
  toggleServices,
  servicesToDisplay, // Recebe a string de serviços ou null
}) => {
  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <View style={dynamicStyles.section}>
      <TouchableOpacity style={dynamicStyles.sectionHeader} onPress={toggleServices}>
        <Text style={dynamicStyles.sectionTitle}>Serviços</Text>
        <AntDesign name={expandedServices ? "minus" : "plus"} size={20} color={themeColors.text} />
      </TouchableOpacity>
      {expandedServices && (
        <View style={dynamicStyles.sectionContent}>
          {/* Exibe os serviços passados via prop, ou uma mensagem padrão se for null */}
          <Text style={dynamicStyles.servicesText}>
            {servicesToDisplay || "Nenhum serviço disponível para este local ou nenhum local selecionado."}
          </Text>
          {/* Você pode adicionar mais detalhes ou formatar os serviços aqui */}
        </View>
      )}
    </View>
  );
};

const getThemedStyles = (themeColors: any) => StyleSheet.create({
  section: {
    backgroundColor: themeColors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.text,
  },
  sectionContent: {
    // Estilos para o conteúdo da seção de serviços
  },
  servicesText: { // Novo estilo para o texto dos serviços
    fontSize: 16,
    color: themeColors.subText,
    lineHeight: 24,
  },
});
