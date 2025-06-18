// src/types/interface.ts

export interface TireShop {
  id: string; // ID do documento (para o MySQL, será o ID da tabela)
  name: string; // Nome do Local
  type: string; // Tipo (Ex: "Borracharia", "Oficina")
  address: string; // Endereço completo formatado (Rua, Bairro, Cidade - UF)
  latitude: number;
  longitude: number;
  cep: string; // CEP
  number: string; // Número do endereço
  simplifiedReferencePoint?: string; // Ponto de Referência Simplificado
  phone: string; // Telefone (Obrigatório)
  hasWhatsApp?: boolean; // Se o telefone tem WhatsApp (true/false)
  whatsappNumber?: string; // Número do WhatsApp (visível se hasWhatsApp for true)
  is24Hours?: boolean; // Aberto 24 Horas? (true/false)
  servicesOffered?: string; // Serviços Oferecidos (texto multiline)
  detailedReferencePoint?: string; // Ponto de Referência Detalhado (texto multiline)
  images?: string[]; // Array de URLs das imagens (serão URLs do seu servidor/cloud)
  createdAt?: Date; // Timestamp de criação (gerado pelo backend)
  addedBy?: string; // ID do usuário que adicionou (gerado/validado pelo backend)
}