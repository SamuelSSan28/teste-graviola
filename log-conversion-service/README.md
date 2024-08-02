# Log Conversion Service

Este é um serviço backend desenvolvido com NestJS para converter arquivos de log do formato "MINHA CDN" para o formato "Agora". O serviço permite a conversão de logs através de uma URL fornecida e fornece endpoints para obter estatísticas gerais do sistema.

## Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) - Framework para construção de aplicações Node.js escaláveis e eficientes.
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript que adiciona tipos estáticos.
- [Axios](https://github.com/axios/axios) - Cliente HTTP baseado em promessas para o navegador e Node.js.
- [Firebase](https://firebase.google.com/) - Banco de Dados NoSQL.
- [Jest](https://jestjs.io/) - Framework de teste de JavaScript.

## Estrutura do Projeto

```plaintext
src/
├── controllers/
│   └── log.controller.ts
├── services/
│   └── log.service.ts
├── modules/
│   └── log.module.ts
├── dto/
│   └── convert-log.dto.ts
├── utils/
│   └── logConverter.ts
├── firebase/
│   └── firebase.service.ts
├── tests/
│   └── log.service.spec.ts
└── main.ts
firebaseConfig.ts
package.json
tsconfig.json
```

## Configuração do Firebase

Para configurar o Firebase, você precisará de um arquivo de credenciais JSON. Baixe suas credenciais do Firebase Console e salve o arquivo em um local acessível. Atualize o caminho do arquivo no `firebase.service.ts` conforme necessário.

## Instalação

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/yourusername/log-conversion-service.git
   cd log-conversion-service
   ```

2. **Instale as Dependências**

   ```bash
   npm install
   ```

3. **Configure o Firebase**

   - Coloque o arquivo de credenciais JSON em um diretório apropriado.
   - Atualize o caminho do arquivo no `firebase.service.ts`.

4. **Execute o Projeto**
   ```bash
   npm run start
   ```

## Endpoints da API

### Converter Log

**POST** `/logs/convert`

Request Body:

```json
{
  "sourceUrl": "string"
}
```

Response:

```plaintext
#Version: 1.0
#Date: ...
#Fields: provider http-method status-code uri-path time-taken response-size cache-status
"MINHA CDN" ...
```

### Obter Estatísticas

**GET** `/logs/stats`

Response:

```json
{
  "totalConversions": 90,
  "totalSuccess": 85,
  "totalErrors": 5,
  "conversionsPerDay": {
    "01/08/2024": 20,
    "02/08/2024": 30,
    ...
  },
  "averageProcessingTime": 135,
  "timeProcessedByDay": {
    "01/08/2024": 140,
    "02/08/2024": 130,
    ...
  }
  }
}
```

## Testes

Para executar os testes, use o comando:

```bash
npm run test
```
