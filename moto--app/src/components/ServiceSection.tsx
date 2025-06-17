import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

interface ServiceSectionProps {
  themeColors: any;
  expandedServices: boolean;
  toggleServices: () => void;
}

export const ServiceSection = ({ themeColors, expandedServices, toggleServices }: ServiceSectionProps) => {
  const dynamicStyles = getThemedStyles(themeColors);

  return (
    <View style={dynamicStyles.section}>
      <TouchableOpacity style={dynamicStyles.sectionHeader} onPress={toggleServices}>
        <Text style={dynamicStyles.sectionTitle}>AutoServiços</Text>
        <AntDesign name={expandedServices ? "minus" : "plus"} size={20} color={themeColors.text} />
      </TouchableOpacity>
      {expandedServices && (
        <View>
          <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => console.log('Reparo de Pneus selecionado')}>
            <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
            <Text style={dynamicStyles.serviceText}>Reparo de Pneus</Text>
            <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => console.log('Alinhamento de Rodas selecionado')}>
            <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
            <Text style={dynamicStyles.serviceText}>Alinhamento de Rodas</Text>
            <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => console.log('Alinhamento Geral selecionado')}>
            <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
            <Text style={dynamicStyles.serviceText}>Alinhamento Geral</Text>
            <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.serviceItem} onPress={() => console.log('Manutenção Geral selecionado')}>
            <MaterialIcons name="check-circle" size={20} color={themeColors.success} />
            <Text style={dynamicStyles.serviceText}>Manutenção Geral</Text>
            <AntDesign name="right" size={16} color={dynamicStyles.arrowIcon.color} style={dynamicStyles.arrowIcon} />
          </TouchableOpacity>
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
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.borderColor,
  },
  serviceText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: themeColors.text,
  },
  arrowIcon: {
    marginLeft: 'auto',
    color: themeColors.subText,
  },
});