# 📍 SOS RODAS - Encontre a ajuda que você precisa!
Este projeto é um aplicativo mobile inovador desenvolvido para facilitar a busca e a localização de borracharias e oficinas próximas. Ideal para motoristas, motociclistas e ciclistas que precisam de serviços de pneu ou manutenção veicular com urgência ou para rotina.

## 👤 Para Usuários
⚠️ IMPORTANTE: Este projeto está atualmente em fase de desenvolvimento e testes. Ele não está disponível para uso público geral e suas funcionalidades são demonstrativas.

Esta seção é para quem deseja entender o que o aplicativo faz e como ele pode ser útil no dia a dia.

## ✨ Funcionalidades Principais
Localização Precisa: Encontre borracharias e oficinas próximas com base na sua localização atual.

Detalhes do Estabelecimento: Visualize informações importantes como endereço, número de telefone, tipo de serviços oferecidos e fotos do estabelecimento.

Rotas e Navegação: Obtenha rotas diretas para a borracharia ou oficina escolhida através do seu aplicativo de mapas preferido.

Contato Direto: Opção de contato rápido (ex: via WhatsApp, se implementado, ou telefone).

## 💡 Como Usar o Aplicativo
Instalação (Apenas para Testes): Para testar o aplicativo, utilize o Expo Go (ver seção "Para Desenvolvedores" para instruções de configuração local).

Permissões: Ao abrir o aplicativo pela primeira vez, conceda as permissões de acesso à sua localização quando solicitado. Isso é crucial para que ele encontre os estabelecimentos mais próximos.

Localização: O aplicativo automaticamente detectará sua posição e exibirá as borracharias e oficinas no mapa ou em uma lista.

Interação: Toque em um estabelecimento para ver seus detalhes completos e opções de contato ou para iniciar a navegação.

# 💻 Para Desenvolvedores
Esta seção é dedicada a desenvolvedores que desejam entender a arquitetura do projeto, configurar o ambiente e contribuir.

## 🚀 Tecnologias Utilizadas
Este projeto é dividido em duas partes principais: o Frontend (aplicativo mobile) e o Backend (API e Banco de Dados).

###  Frontend (Aplicativo Mobile)
* React Native: Framework para a construção da interface do usuário mobile.

* Expo: Ambiente de desenvolvimento e ferramentas para facilitar a criação e teste do app.

* TypeScript: Linguagem de programação que adiciona tipagem estática ao JavaScript.

* React Navigation: Gerenciamento de navegação entre as telas.

* Expo Location & Geolocation API (getCurrentPosition): Para obter a localização do usuário.

* APIs Nativas (fetch): Para comunicação com o backend.

* React Native Maps: Para exibir mapas e marcadores de borracharias/oficinas.

###  Backend (API e Banco de Dados)
* Node.js: Ambiente de execução para o servidor da API.

* Express.js: Framework web para Node.js, utilizado na construção da API RESTful.

* TypeScript: Linguagem de programação para o desenvolvimento do backend.
  
* XAMP: Servidor para o banco de dados.

* MySQL: Sistema de Gerenciamento de Banco de Dados Relacional para armazenar os dados.

* ts-node: Para executar arquivos TypeScript diretamente em desenvolvimento.

* nodemon: Para reiniciar o servidor automaticamente ao detectar mudanças no código.

### Ferramentas de Desenvolvimento e Auxiliares
* Git: Sistema de controle de versão.

* Visual Studio Code (VS Code): Editor de código.

* npm (Node Package Manager): Gerenciador de pacotes.

## ⚙️ Pré-requisitos
Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

* Node.js (versão LTS recomendada)

* npm (gerenciador de pacotes do Node.js)

* MySQL Server (servidor de banco de dados)

* Git (para clonar o repositório)

* Expo CLI (instalado globalmente via npm: npm install -g expo-cli)

## 💻 Instalação e Configuração
Siga os passos abaixo para configurar e rodar o projeto em seu ambiente local.

#### 1. Clonar o Repositório
Abra seu terminal ou prompt de comando e clone o repositório:

Bash
```
git clone <URL_DO_SEU_REPOSITORIO>
cd SOS-RODAS # Nome da pasta do seu projeto
```

### 2. Configuração do Backend
Navegue até a pasta do backend (assumindo que seja backend):

Bash
```
cd backend
npm install
```

Configuração do Banco de Dados MySQL
Crie um banco de dados MySQL vazio para o projeto (ex: borracharia_db).

Crie um arquivo .env na raiz da pasta backend com as seguintes variáveis de ambiente, substituindo pelos seus dados:

Snippet de código
```
.env no backend
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=borracharia_db
PORT=3000 # Porta que o backend irá rodar
```
Importe o Schema e Dados Iniciais:

Você precisará importar o script SQL do seu schema e dados iniciais para o banco de dados borracharia_db. Geralmente, isso é feito através do MySQL Workbench, phpMyAdmin ou linha de comando:

Bash

```
mysql -u seu_usuario_mysql -p borracharia_db < caminho/para/seu_schema.sql
(Substitua <caminho/para/seu_schema.sql> pelo caminho do arquivo .sql que cria suas tabelas e insere dados iniciais, se você tiver um.)
```
### 3. Configuração do Frontend
Navegue de volta para a raiz do projeto e depois para a pasta do frontend (assumindo que seja frontend):

Bash

```
cd .. # Volta para a raiz do projeto
cd frontend
npm install
```
Configuração da Conexão com a API
No seu código frontend (geralmente em um arquivo de configuração ou nas chamadas da API, ex: src/config.ts), certifique-se de que a URL base da API esteja apontando para onde seu backend está rodando.

Se você estiver testando em um emulador/simulador no mesmo computador: const API_BASE_URL = 'http://localhost:3000';

Se estiver testando em um dispositivo físico na mesma rede Wi-Fi, use o endereço IP da sua máquina em vez de localhost: const API_BASE_URL = 'http://SEU_IP_AQUI:3000';

▶️ Como Rodar o Projeto
Você precisará iniciar o backend e o frontend separadamente em terminais diferentes.

### 1. Iniciar o Backend
No terminal, dentro da pasta backend:

Bash
```
npm start
```
(Se você não tiver o script start configurado no package.json para rodar o backend, use npm run dev ou npx ts-node src/server.ts.)
(Você verá uma mensagem no console indicando que o servidor está rodando, ex: "Servidor Express rodando na porta 3000")

### 2. Iniciar o Frontend
Em um novo terminal, navegue até a pasta frontend:

Bash
```
npx expo start
```
(Isso abrirá o Expo Developer Tools no seu navegador. Você pode escanear o QR code com o aplicativo Expo Go no seu celular ou abrir em um emulador/simulador.)

📊 Status do Projeto
O projeto SOS RODAS está em fase de desenvolvimento e testes. As funcionalidades principais foram implementadas e estão sendo testadas para garantir a estabilidade e a qualidade. As etapas futuras incluem otimizações, adição de novas funcionalidades e possíveis expansões de dados e cobertura geográfica para um lançamento futuro.



## Demonstração do Projeto de extensão | SOS RODAS
Assista a um breve vídeo demonstrativo do aplicativo SOS RODAS em funcionamento:
[Link desmotrativo](https://youtu.be/1mgY06YbprI)

