// src/screens/AddLocationScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert,
  ActivityIndicator, Image, TouchableOpacity, Platform, StatusBar, Switch
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { TireShop } from '../types/interface'; // Importar o tipo atualizado

interface AddLocationScreenProps {
  onGoBack: () => void;
  onLocationAdded: () => void;
}

export const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ onGoBack, onLocationAdded }) => {
  // Campos de texto
  const [nomeLocal, setNomeLocal] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState(''); // Rua, Bairro, Cidade - UF
  const [pontoDeReferenciaSimplificado, setPontoDeReferenciaSimplificado] = useState('');
  const [telefoneObrigatorio, setTelefoneObrigatorio] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState(''); // Número do WhatsApp
  const [servicosOferecidos, setServicosOferecidos] = useState('');
  const [pontoDeReferenciaDetalhado, setPontoDeReferenciaDetalhado] = useState('');

  // Estados de switches e checkboxes
  const [hasWhatsApp, setHasWhatsApp] = useState(false); // Telefone para WhatsApp
  const [is24Hours, setIs24Hours] = useState(false); // Aberto 24 Horas?

  // Estados de localização e imagens
  const [geocodedCoords, setGeocodedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Para indicar que está salvando (mock)
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Campos intermediários para geocodificação (preenchidos pelo ViaCEP)
  const [logradouroViaCep, setLogradouroViaCep] = useState('');
  const [bairroViaCep, setBairroViaCep] = useState('');
  const [cidadeViaCep, setCidadeViaCep] = useState('');
  const [estadoViaCep, setEstadoViaCep] = useState('');

  // Efeito para solicitar permissão da galeria
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Desculpe, precisamos de permissões da galeria para isso funcionar!');
        }
      }
    })();
  }, []);

  // Efeito para geocodificar o endereço completo quando os campos mudam
  useEffect(() => {
    // A geocodificação automática pode ser pesada ou falhar com endereços parciais.
    // É melhor ter um botão manual para "Geocodificar".
    // Mantenho a lógica de geocodificação aqui, mas a chamada será via botão.
  }, [logradouroViaCep, numero, bairroViaCep, cidadeViaCep, estadoViaCep]);


  const handleCEPChange = async (text: string) => {
    setCep(text);
    if (text.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${text}/json/`);
        const data = await response.json();
        if (data.erro) {
          Alert.alert('Erro', 'CEP não encontrado.');
          setLogradouroViaCep('');
          setBairroViaCep('');
          setCidadeViaCep('');
          setEstadoViaCep('');
          setEnderecoCompleto(''); // Limpa o campo combinado
        } else {
          setLogradouroViaCep(data.logradouro);
          setBairroViaCep(data.bairro);
          setCidadeViaCep(data.localidade);
          setEstadoViaCep(data.uf);
          // Atualiza o campo de endereço completo automaticamente
          setEnderecoCompleto(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        Alert.alert('Erro', 'Não foi possível buscar o CEP.');
      }
    }
  };

  const geocodeAddress = useCallback(async () => {
    // Agora usando os campos do formulário para montar o endereço para geocodificação
    const fullAddressToGeocode = `${enderecoCompleto}, ${numero}, Brasil`; // `enderecoCompleto` já inclui cidade e estado

    if (!fullAddressToGeocode || !nomeLocal) { // Nome do local também é bom para a geocodificação
      Alert.alert('Campos Incompletos', 'Preencha Nome do Local, Endereço e Número para geocodificar.');
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await Location.geocodeAsync(fullAddressToGeocode);
      if (result && result.length > 0) {
        setGeocodedCoords({ latitude: result[0].latitude, longitude: result[0].longitude });
        Alert.alert('Geocodificação Sucesso', `Latitude: ${result[0].latitude.toFixed(4)}, Longitude: ${result[0].longitude.toFixed(4)}`);
      } else {
        setGeocodedCoords(null);
        Alert.alert('Erro', 'Não foi possível geocodificar o endereço. Tente ser mais específico ou verifique o endereço.');
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      Alert.alert('Erro de Geocodificação', 'Ocorreu um erro ao tentar geocodificar o endereço. Verifique sua conexão ou tente novamente.');
    } finally {
      setIsGeocoding(false);
    }
  }, [nomeLocal, enderecoCompleto, numero]); // Dependências da geocodificação

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5, // Limite de 5 imagens
    });

    if (!result.canceled) {
      // Adiciona novas imagens às já selecionadas, limitando a 5 no total
      setSelectedImages(prevImages => {
        const newImages = [...prevImages, ...result.assets];
        return newImages.slice(0, 5); // Garante que não exceda 5
      });
    }
  };

  const removeImage = (uriToRemove: string) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uriToRemove));
  };


  const handleSaveLocation = async () => {
    // VALIDAÇÃO BÁSICA DOS CAMPOS OBRIGATÓRIOS
    if (!nomeLocal.trim() || !cep.trim() || !numero.trim() || !enderecoCompleto.trim() ||
        !telefoneObrigatorio.trim() || !geocodedCoords) {
      Alert.alert('Campos Faltando', 'Por favor, preencha todos os campos obrigatórios e geocodifique o endereço antes de salvar.');
      return;
    }

    if (hasWhatsApp && !whatsappNumber.trim()) {
        Alert.alert('Campo WhatsApp', 'Por favor, insira o número do WhatsApp se a opção "Sim" estiver selecionada.');
        return;
    }

    setIsSaving(true);
    let imageUrls: string[] = [];

    try {
      // *** ESTE TRECHO ABAIXO VAI PRECISAR SER MODIFICADO PARA SEU BACKEND PHP/MYSQL ***
      // Por enquanto, ele apenas simula o processo ou se usaria o Firebase se ainda estivesse ativo.
      // O objetivo agora é capturar os dados para o backend entender.

      // Simulando upload de imagens para um serviço de armazenamento (e.g., Cloudinary, S3, ou seu próprio backend)
      // Para o backend, você enviaria cada imagem para um endpoint de upload e coletaria as URLs.
      // Por agora, vamos simular URLs para o mock de dados:
      imageUrls = selectedImages.map((img, index) => `http://mock-server.com/images/<span class="math-inline">\{nomeLocal\.replace\(/\\s/g, '\_'\)\}\_</span>{index}.jpg`);


      const newShop: Omit<TireShop, 'id'> = {
        name: nomeLocal,
        type: 'Borracharia/Oficina', // Definido como padrão por enquanto, pode ser um campo dropdown futuro
        address: `${enderecoCompleto}, ${numero}`, // Endereço formatado para exibição
        cep: cep,
        number: numero,
        latitude: geocodedCoords.latitude,
        longitude: geocodedCoords.longitude,
        simplifiedReferencePoint: pontoDeReferenciaSimplificado.trim() || undefined,
        phone: telefoneObrigatorio.trim(),
        hasWhatsApp: hasWhatsApp,
        whatsappNumber: hasWhatsApp ? whatsappNumber.trim() : undefined,
        is24Hours: is24Hours,
        servicesOffered: servicosOferecidos.trim() || undefined,
        detailedReferencePoint: pontoDeReferenciaDetalhado.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        createdAt: new Date(), // Simula timestamp
        addedBy: 'frontend_user_mock', // Placeholder para o backend gerenciar a autenticação real
      };

      console.log("Dados da Nova Borracharia para Backend:", JSON.stringify(newShop, null, 2));

      // *** AQUI VOCÊ FARIA A REQUISIÇÃO POST PARA SEU BACKEND PHP/MYSQL ***
      // Exemplo (usando fetch, precisaria da URL correta da sua API):
      /*
      const response = await fetch('http://YOUR_BACKEND_IP_OR_DOMAIN/api/v1/tire_shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer seu_token_aqui' // Se seu backend tiver autenticação
        },
        body: JSON.stringify(newShop),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar no backend');
      }

      const responseData = await response.json();
      console.log('Resposta do Backend:', responseData);
      */

      // Simulando o tempo de salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert('Sucesso!', 'Local cadastrado com sucesso! (Dados prontos para o Backend)');
      // Limpa os campos após o sucesso (opcional)
      setNomeLocal('');
      setCep('');
      setNumero('');
      setEnderecoCompleto('');
      setPontoDeReferenciaSimplificado('');
      setTelefoneObrigatorio('');
      setHasWhatsApp(false);
      setWhatsappNumber('');
      setIs24Hours(false);
      setServicosOferecidos('');
      setPontoDeReferenciaDetalhado('');
      setGeocodedCoords(null);
      setSelectedImages([]);

      onLocationAdded(); // Retorna para a tela principal (ou apenas navega para onde for apropriado)
    } catch (error) {
      console.error('Erro ao preparar ou salvar local:', error);
      Alert.alert('Erro', `Não foi possível cadastrar o local: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Cadastro de Borracharia e Oficina 24 horas</Text>
      </View>

      <Text style={styles.label}>Nome do Local</Text>
      <TextInput style={styles.input} placeholder="Nome da Borracharia/Oficina" value={nomeLocal} onChangeText={setNomeLocal} />

      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={styles.input}
        placeholder="CEP com autocompletar"
        value={cep}
        onChangeText={handleCEPChange}
        keyboardType="numeric"
        maxLength={8}
      />

      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        placeholder="Número do endereço"
        value={numero}
        onChangeText={setNumero}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Endereço (Rua, Bairro, Cidade - UF)</Text>
      <TextInput
        style={styles.input}
        placeholder="Preenchido automaticamente pelo CEP"
        value={enderecoCompleto}
        onChangeText={setEnderecoCompleto} // Permite edição manual se o usuário quiser ajustar
      />
      <TouchableOpacity
            style={styles.geocodeButton}
            onPress={geocodeAddress}
            disabled={isGeocoding}
          >
            {isGeocoding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.geocodeButtonText}>Geocodificar Endereço</Text>
            )}
          </TouchableOpacity>

      {geocodedCoords && (
        <Text style={styles.coordsText}>
          Coordenadas: Lat {geocodedCoords.latitude.toFixed(6)}, Lon {geocodedCoords.longitude.toFixed(6)}
        </Text>
      )}

      <Text style={styles.label}>Ponto de Referência Simplificado</Text>
      <Text style={styles.hintText}>(Local próximo para motoboys se basear)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Próximo à padaria X"
        value={pontoDeReferenciaSimplificado}
        onChangeText={setPontoDeReferenciaSimplificado}
      />

      <Text style={styles.label}>Telefone (Obrigatório)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: (81) 99999-8888"
        value={telefoneObrigatorio}
        onChangeText={setTelefoneObrigatorio}
        keyboardType="phone-pad"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Telefone para WhatsApp:</Text>
        <TouchableOpacity style={styles.radioOption} onPress={() => setHasWhatsApp(true)}>
          <View style={styles.radioCircle}>
            {hasWhatsApp && <View style={styles.selectedRadioCircle} />}
          </View>
          <Text style={styles.radioText}>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioOption} onPress={() => setHasWhatsApp(false)}>
          <View style={styles.radioCircle}>
            {!hasWhatsApp && <View style={styles.selectedRadioCircle} />}
          </View>
          <Text style={styles.radioText}>Não</Text>
        </TouchableOpacity>
      </View>
      {hasWhatsApp && (
        <TextInput
          style={styles.input}
          placeholder="Número do WhatsApp (se diferente do principal)"
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          keyboardType="phone-pad"
        />
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Aberto 24 Horas?</Text>
        <Switch
          onValueChange={setIs24Hours}
          value={is24Hours}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={is24Hours ? "#007BFF" : "#f4f3f4"}
        />
      </View>

      <Text style={styles.label}>Serviços Oferecidos</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Ex: Reparo de Pneus, Alinhamento, Balanceamento, Venda de Pneus..."
        value={servicosOferecidos}
        onChangeText={setServicosOferecidos}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Ponto de Referência Detalhado</Text>
      <Text style={styles.hintText}>(limite de 200 caracteres)</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Descreva detalhes como cor do prédio, portão, fachada, placas próximas."
        value={pontoDeReferenciaDetalhado}
        onChangeText={setPontoDeReferenciaDetalhado}
        multiline
        numberOfLines={6}
        maxLength={200}
      />

      <Text style={styles.label}>Fotos do Local</Text>
      <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
        <MaterialIcons name="add-a-photo" size={24} color="#fff" style={styles.addPhotoIcon} />
        <Text style={styles.addPhotoButtonText}>Adicionar Mais Fotos ({selectedImages.length}/5)</Text>
      </TouchableOpacity>
      <ScrollView horizontal style={styles.imagePreviewScrollView}>
        {selectedImages.map((image, index) => (
          <View key={image.uri} style={styles.imagePreviewContainer}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageIcon} onPress={() => removeImage(image.uri)}>
              <MaterialIcons name="cancel" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveLocation}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>SALVAR LOCAL</Text>
        )}
      </TouchableOpacity>
      {isSaving && <Text style={styles.savingText}>Preparando dados para o backend...</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Fundo claro para combinar com o layout
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 40,
    paddingBottom: 40, // Espaço extra no final
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Para que o título ocupe o espaço restante
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222831',
    marginBottom: 8,
    marginTop: 15,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  multilineInput: {
    height: 100, // Altura inicial para multiline
    textAlignVertical: 'top', // Inicia o texto no topo
    paddingVertical: 12,
  },
  geocodeButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  geocodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coordsText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  selectedRadioCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007BFF',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  addPhotoButton: {
    backgroundColor: '#28A745', // Cor verde vibrante
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  addPhotoIcon: {
    marginRight: 10,
  },
  addPhotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewScrollView: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  }
});