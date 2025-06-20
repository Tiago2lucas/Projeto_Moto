// motoapp_backend/src/server.ts

import express, { Request, Response } from 'express'; // Importado Request e Response para tipagem correta
import mysql from 'mysql2/promise'; // Usar a versão 'promise' para operações assíncronas com o banco de dados
import cors from 'cors';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // A API vai rodar na porta 3000 por padrão, ou na porta definida em .env

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Essencial para permitir que seu aplicativo React Native se conecte à API
app.use(cors({
  origin: '*', // EM PRODUÇÃO, MUDE ISSO PARA O DOMÍNIO/IP EXATO DO SEU APLICATIVO REACT NATIVE!
              // Ex: 'http://localhost:19000' (para Expo/Metro Bundler) ou o IP do seu emulador/dispositivo
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));

// Middleware para parsear o corpo das requisições como JSON
app.use(express.json());

// Configurações do Banco de Dados
// É altamente recomendado usar variáveis de ambiente para credenciais de produção por segurança
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Senha do seu usuário MySQL (vazia se for o padrão do XAMPP)
  database: process.env.DB_NAME || 'motoapp_db', // O nome do seu banco de dados MySQL
};

let pool: mysql.Pool; // Declaração do pool de conexão com o banco de dados

// Função para inicializar o pool de conexão com o banco de dados
async function initializeDbPool() {
  try {
    pool = mysql.createPool(dbConfig); // Cria um pool de conexões para gerenciar as conexões com o DB
    console.log('Pool de conexão MySQL criado com sucesso.');

    // Opcional: Testa a conexão executando uma query simples
    const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
    console.log('Conexão MySQL testada: ', rows);

  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1); // Encerra o processo se não conseguir conectar ao DB
  }
}

// Endpoint de teste simples (GET)
// Acessível em http://localhost:3000/ ou http://10.0.2.2:3000/
app.get('/', (req: Request, res: Response) => { // Tipado req e res
  res.send('API de Cadastro de Borracharias e Oficinas está online!');
});

// Endpoint para cadastrar um novo local (POST)
// Recebe dados do aplicativo React Native
app.post('/cadastro', async (req: express.Request, res: express.Response) => { // req e res tipados
  // Desestruturação dos dados recebidos no corpo da requisição
  const {
    nome_local, cep, numero_endereco, rua, bairro, cidade, uf,
    ponto_referencia_simplificado, telefone, telefone_whatsapp,
    whatsapp_number, aberto_24_horas, servicos_oferecidos,
    ponto_referencia_detalhado, fotos_local_json, latitude, longitude
  } = req.body;

  // Validação básica dos campos obrigatórios
  if (!nome_local || !cep || !numero_endereco || !rua || !bairro || !cidade || !uf || !telefone) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
  }
  
  // Validação específica para o número do WhatsApp, se a opção for 'Sim'
  if (telefone_whatsapp && !whatsapp_number) {
    return res.status(400).json({ success: false, message: 'Número do WhatsApp é obrigatório se a opção "Sim" estiver selecionada.' });
  }

  try {
    // Query SQL para inserir um novo registro na tabela borracharias_oficinas
    // Usamos prepared statements (?) para evitar SQL Injection
    const query = `
      INSERT INTO borracharias_oficinas (
        nome_local, cep, numero_endereco, rua, bairro, cidade, uf,
        ponto_referencia_simplificado, telefone, telefone_whatsapp,
        whatsapp_number, aberto_24_horas, servicos_oferecidos,
        ponto_referencia_detalhado, fotos_local_json, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Converte valores booleanos para 0 ou 1, que é o formato ideal para BOOLEAN no MySQL
    const telefoneWhatsappDb = telefone_whatsapp ? 1 : 0;
    const aberto24HorasDb = aberto_24_horas ? 1 : 0;
    
    // Converte o array de URLs de fotos para uma string JSON
    // Se fotos_local_json for nulo/indefinido, usa um array vazio para não quebrar
    const fotosLocalJsonDb = JSON.stringify(fotos_local_json || []); 

    // Executa a query com os valores fornecidos, na ordem correta
    const [result] = await pool.execute(query, [
      nome_local,
      cep,
      numero_endereco,
      rua,
      bairro,
      cidade,
      uf,
      ponto_referencia_simplificado || null, // Se o campo for vazio, salva como NULL no DB
      telefone,
      telefoneWhatsappDb,
      whatsapp_number || null, // Se o campo for vazio, salva como NULL no DB
      aberto24HorasDb,
      servicos_oferecidos || null, // Se o campo for vazio, salva como NULL no DB
      ponto_referencia_detalhado || null, // Se o campo for vazio, salva como NULL no DB
      fotosLocalJsonDb,
      latitude || null, // Salva latitude ou NULL
      longitude || null // Salva longitude ou NULL
    ]);

    // O 'result' para operações de INSERT no mysql2 contém 'insertId'
    const insertId = (result as mysql.ResultSetHeader).insertId;

    // Responde ao cliente (aplicativo React Native) com sucesso
    res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso!', id: insertId });

  } catch (error) {
    console.error('Erro ao cadastrar local:', error);
    // Exemplo de tratamento de erro específico do MySQL (código de duplicidade)
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Este local já parece estar cadastrado.' });
    }
    // Responde com um erro genérico do servidor
    res.status(500).json({ success: false, message: 'Erro interno do servidor ao cadastrar local.' });
  }
});

// Inicia o servidor Express após a inicialização do pool de conexão com o banco de dados
async function startServer() {
  await initializeDbPool(); // Garante que a conexão com o DB seja estabelecida antes de iniciar o servidor
  app.listen(port, () => {
    console.log(`Servidor Node.js rodando em http://localhost:${port}`);
    console.log(`Para acessar via emulador Android, use http://10.0.2.2:${port}`);
  });
}

startServer(); // Chama a função para iniciar todo o processo
