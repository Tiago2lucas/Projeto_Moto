// src/screens/AddLocationScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert,
  ActivityIndicator, Image, TouchableOpacity, Platform, StatusBar, Switch
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
// A interface TireShop não será mais usada diretamente para o payload do backend,
// pois o payload será mapeado diretamente para as colunas do DB.
// import { TireShop } from '../types/interface';

interface AddLocationScreenProps {
  onGoBack: () => void;
  onLocationAdded: () => void;
}

// Defina a URL base do seu backend aqui.
// IMPORTANTE:
// - Para emuladores Android, use 'http://10.0.2.2:3000'
// - Para dispositivos físicos (celular real), use o ENDEREÇO IP DA SUA MÁQUINA
//   na rede local (ex: 'http://192.168.1.14:3000').
//   Certifique-se de que seu celular e computador estejam na mesma rede Wi-Fi.
// Escolha a URL apropriada para o seu ambiente de teste:
const API_BASE_URL = 'http://192.168.1.14:3000'; // Exemplo: para dispositivo físico (seu IP encontrado)
// const API_BASE_URL = 'http://10.0.2.2:3000'; // Exemplo: para emulador Android

export const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ onGoBack, onLocationAdded }) => {
  // Campos de texto do formulário
  const [nomeLocal, setNomeLocal] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  // enderecoCompleto é para exibição, os campos ViaCEP são para o backend
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [pontoDeReferenciaSimplificado, setPontoDeReferenciaSimplificado] = useState('');
  const [telefoneObrigatorio, setTelefoneObrigatorio] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [servicosOferecidos, setServicosOferecidos] = useState('');
  const [pontoDeReferenciaDetalhado, setPontoDeReferenciaDetalhado] = useState('');

  // Estados de switches e checkboxes
  const [hasWhatsApp, setHasWhatsApp] = useState(false);
  const [is24Hours, setIs24Hours] = useState(false);

  // Estados de localização e imagens
  const [geocodedCoords, setGeocodedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Indica se o processo de salvamento está ativo
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // Campos intermediários preenchidos pelo ViaCEP, que serão enviados ao backend
  const [logradouroViaCep, setLogradouroViaCep] = useState(''); // Corresponde a 'rua' no backend
  const [bairroViaCep, setBairroViaCep] = useState('');       // Corresponde a 'bairro' no backend
  const [cidadeViaCep, setCidadeViaCep] = useState('');       // Corresponde a 'cidade' no backend
  const [estadoViaCep, setEstadoViaCep] = useState('');       // Corresponde a 'uf' no backend

  // Efeito para solicitar permissão da galeria ao iniciar a tela
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

  // Efeito para geocodificar o endereço (a chamada será via botão, não automática)
  useEffect(() => {
    // A geocodificação automática pode ser pesada ou falhar com endereços parciais.
    // É melhor ter um botão manual para "Geocodificar".
    // Mantenho a lógica de geocodificação aqui, mas a chamada será via botão.
  }, [logradouroViaCep, numero, bairroViaCep, cidadeViaCep, estadoViaCep]);


  // Função para buscar o CEP e preencher os campos de endereço
  const handleCEPChange = async (text: string) => {
    setCep(text);
    if (text.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${text}/json/`);
        const data = await response.json();
        if (data.erro) {
          Alert.alert('Erro', 'CEP não encontrado.');
          // Limpa todos os campos relacionados ao endereço se o CEP for inválido
          setLogradouroViaCep('');
          setBairroViaCep('');
          setCidadeViaCep('');
          setEstadoViaCep('');
          setEnderecoCompleto('');
        } else {
          setLogradouroViaCep(data.logradouro);
          setBairroViaCep(data.bairro);
          setCidadeViaCep(data.localidade);
          setEstadoViaCep(data.uf);
          // Atualiza o campo de endereço completo para exibição
          setEnderecoCompleto(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        Alert.alert('Erro', 'Não foi possível buscar o CEP.');
      }
    }
  };

  // Função para geocodificar o endereço (obter latitude e longitude)
  const geocodeAddress = useCallback(async () => {
    // Monta o endereço completo usando os campos do ViaCEP para maior precisão
    const fullAddressToGeocode = `${logradouroViaCep}, ${numero}, ${bairroViaCep}, ${cidadeViaCep}, ${estadoViaCep}, Brasil`;

    // Validação para garantir que os campos necessários para geocodificação estão preenchidos
    if (!nomeLocal.trim() || !logradouroViaCep.trim() || !numero.trim() || !bairroViaCep.trim() || !cidadeViaCep.trim() || !estadoViaCep.trim()) {
      Alert.alert('Campos Incompletos', 'Por favor, preencha Nome do Local, CEP, Número e aguarde o preenchimento automático do endereço antes de geocodificar.');
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
  }, [nomeLocal, logradouroViaCep, numero, bairroViaCep, cidadeViaCep, estadoViaCep]);

  // Função para selecionar imagens da galeria
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

  // Função para remover uma imagem selecionada
  const removeImage = (uriToRemove: string) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uriToRemove));
  };


  // FUNÇÃO PRINCIPAL: Lidar com o salvamento do local (enviar para o backend)
  const handleSaveLocation = async () => {
    // VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS ANTES DE ENVIAR
    if (!nomeLocal.trim() || !cep.trim() || !numero.trim() || !logradouroViaCep.trim() ||
        !bairroViaCep.trim() || !cidadeViaCep.trim() || !estadoViaCep.trim() ||
        !telefoneObrigatorio.trim() || !geocodedCoords) {
      Alert.alert('Campos Faltando', 'Por favor, preencha todos os campos obrigatórios, preencha o CEP e geocodifique o endereço antes de salvar.');
      return;
    }

    if (hasWhatsApp && !whatsappNumber.trim()) {
        Alert.alert('Campo WhatsApp', 'Por favor, insira o número do WhatsApp se a opção "Sim" estiver selecionada.');
        return;
    }

    setIsSaving(true); // Ativa o indicador de salvamento
    let imageUrls: string[] = [];

    try {
      // Em um cenário real, as imagens seriam enviadas para um serviço de armazenamento
      // (como Cloudinary, AWS S3, ou um endpoint de upload no seu próprio backend)
      // e você coletaria as URLs públicas aqui.
      // Por enquanto, estamos apenas coletando as URIs locais das imagens selecionadas.
      // O backend espera um array de strings para fotos_local_json.
      imageUrls = selectedImages.map(img => img.uri);


      // PREPARAÇÃO DOS DADOS PARA O BACKEND
      // O objeto `dataToSend` é mapeado diretamente para os nomes das colunas
      // da sua tabela `borracharias_oficinas` e os parâmetros esperados pelo seu backend Node.js.
      const dataToSend = {
        nome_local: nomeLocal.trim(),
        cep: cep.trim(),
        numero_endereco: numero.trim(),
        rua: logradouroViaCep.trim(), // Usando o logradouro do ViaCEP
        bairro: bairroViaCep.trim(),   // Usando o bairro do ViaCEP
        cidade: cidadeViaCep.trim(),   // Usando a cidade do ViaCEP
        uf: estadoViaCep.trim(),       // Usando o estado do ViaCEP
        ponto_referencia_simplificado: pontoDeReferenciaSimplificado.trim() || null, // Se vazio, envia null
        telefone: telefoneObrigatorio.trim(),
        telefone_whatsapp: hasWhatsApp, // Booleano (true/false)
        whatsapp_number: hasWhatsApp ? whatsappNumber.trim() : null, // Se não tem WhatsApp, envia null
        aberto_24_horas: is24Hours, // Booleano (true/false)
        servicos_oferecidos: servicosOferecidos.trim() || null, // Se vazio, envia null
        ponto_referencia_detalhado: pontoDeReferenciaDetalhado.trim() || null, // Se vazio, envia null
        fotos_local_json: imageUrls, // Array de URIs das imagens (o backend fará JSON.stringify)
        latitude: geocodedCoords.latitude,
        longitude: geocodedCoords.longitude,
      };

      console.log("Dados para o Backend:", JSON.stringify(dataToSend, null, 2));

      // REALIZANDO A REQUISIÇÃO POST PARA O BACKEND NODE.JS
      const response = await fetch(`${API_BASE_URL}/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Informa ao backend que estamos enviando JSON
          // 'Authorization': 'Bearer seu_token_aqui' // Adicione se seu backend tiver autenticação
        },
        body: JSON.stringify(dataToSend), // Converte o objeto JavaScript para uma string JSON
      });

      // Verifica se a resposta do servidor foi bem-sucedida (status 2xx)
      if (!response.ok) {
        const errorData = await response.json(); // Tenta ler a mensagem de erro do backend
        throw new Error(errorData.message || 'Erro ao salvar no backend');
      }

      const responseData = await response.json(); // Lê a resposta de sucesso do backend
      console.log('Resposta do Backend:', responseData);

      // Exibe mensagem de sucesso e limpa o formulário
      Alert.alert('Sucesso!', 'Local cadastrado com sucesso!');
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
      setLogradouroViaCep('');
      setBairroViaCep('');
      setCidadeViaCep('');
      setEstadoViaCep('');

      onLocationAdded(); // Chama a função de callback para indicar que o local foi adicionado
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      Alert.alert('Erro', `Não foi possível cadastrar o local: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false); // Desativa o indicador de salvamento
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
      {/* Este campo é preenchido automaticamente pelo CEP e pode ser editado */}
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
