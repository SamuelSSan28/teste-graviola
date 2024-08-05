# Log Conversion Service

Este é um serviço backend desenvolvido com NestJS para converter arquivos de log do formato "MINHA CDN" para o formato "Agora". O serviço permite a conversão de logs através de uma URL fornecida e fornece endpoints para obter estatísticas gerais do sistema.

## Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) - Framework para construção de aplicações Node.js escaláveis e eficientes.
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript que adiciona tipos estáticos.
- [Axios](https://github.com/axios/axios) - Cliente HTTP baseado em promessas para o navegador e Node.js.
- [Firebase](https://firebase.google.com/) - Banco de Dados NoSQL.
- [Jest](https://jestjs.io/) - Framework de teste de JavaScript.

 
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

- Faça uma cópia do arquivo `.env.example` e renomeie para `.env`.

- Preencha as variáveis de ambiente no arquivo `.env` com suas credenciais do Firebase e demais configurações necessárias.


4. **Execute o Projeto**
   ```bash
   npm run start
   ```

## Endpoints da API

### Converter Log

**POST** `/parser/convert`

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

**POST** `/parser/convertToStr`

Request Body:

```json
{
  "sourceUrl": "string"
}
```

Response:

```plaintext
  {
	"received": "312|200|HIT|\"GET /robots.txt HTTP/1.1\"|100.2\r\n101|200|MISS|\"POST /myImages HTTP/1.1\"|319.4\r\n199|404|MISS|\"GET /not-found HTTP/1.1\"|142.9\r\n312|200|INVALIDATE|\"GET /robots.txt HTTP/1.1\"|245.1\r\n",
	"converted": "\"MINHA CDN\" GET 200 /robots.txt 100 312 HIT\n\"MINHA CDN\" POST 200 /myImages 319 101 MISS\n\"MINHA CDN\" GET 404 /not-found 143 199 MISS\n\"MINHA CDN\" GET 200 /robots.txt 245 312 INVALIDATE"
  }
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
