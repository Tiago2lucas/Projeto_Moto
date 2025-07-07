// src/types/interface.ts

// Esta interface deve corresponder EXATAMENTE aos nomes das colunas do seu banco de dados
// e aos dados retornados pelo seu backend Node.js no endpoint /locais.
export interface TireShop {
  id: number; // O ID do MySQL geralmente é um número
  nome_local: string; // Corresponde à coluna 'nome_local' no DB
  cep: string;
  numero_endereco: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number; // Conforme corrigimos para ser number
  longitude: number; // Conforme corrigimos para ser number
  ponto_referencia_simplificado: string | null;
  telefone: string;
  telefone_whatsapp: number; // 0 ou 1 do MySQL
  numero_whatsapp: string | null; // A nova coluna para o número do WhatsApp
  aberto_24_horas: number; // 0 ou 1 do MySQL
  servicos_oferecidos: string | null; // Corresponde à coluna 'servicos_oferecidos' no DB
  ponto_referencia_detalhado: string | null;
  fotos_local_json: string; // Vem como string JSON do MySQL
  data_cadastro: string; // Timestamp do MySQL
}

// Definindo a interface para as coordenadas de localização (apenas latitude e longitude)
export interface LocationCoords {
  latitude: number;
  longitude: number;
}
