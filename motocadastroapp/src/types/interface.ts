// src/types/interface.ts

// Esta interface deve corresponder EXATAMENTE aos nomes das colunas do seu banco de dados
// e aos dados retornados pelo seu backend Node.js no endpoint /locais.
export interface TireShop {
  id: number;
  nome_local: string; // Corresponde a 'name' no mock, mas vem como 'nome_local' do DB
  cep: string;
  numero_endereco: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
  ponto_referencia_simplificado: string | null;
  telefone: string;
  telefone_whatsapp: number; // 0 ou 1 do MySQL
  numero_whatsapp: string | null; // A nova coluna para o número do WhatsApp
  aberto_24_horas: number; // 0 ou 1 do MySQL
  servicos_oferecidos: string | null;
  ponto_referencia_detalhado: string | null;
  fotos_local_json: string; // Vem como string JSON do MySQL, precisará de JSON.parse()
  data_cadastro: string; // Timestamp do MySQL
  // Removi os campos 'name', 'address', 'type', 'phone', 'hasWhatsApp', 'whatsappNumber', 'is24Hours', 'servicesOffered', 'detailedReferencePoint', 'simplifiedReferencePoint', 'images', 'createdAt', 'addedBy'
  // que eram do mock ou da interface anterior e não batem com o DB diretamente.
}

// Definindo a interface para as coordenadas de localização (apenas latitude e longitude)
export interface LocationCoords {
  latitude: number;
  longitude: number;
}
