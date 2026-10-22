# Receitas de Família

Aplicativo para guardar as receitas da família num só lugar: ingredientes, modo de preparo, tempo, rendimento e quem ensinou a receita.

Feito com React Native e Expo, organizado em camadas, com os dados gravados na MockAPI usada em aula.

## Funcionalidades

- Cadastrar, listar, ver, editar e excluir receitas (CRUD completo).
- Tela de detalhe com ingredientes em lista e modo de preparo em passos numerados.
- Marcar e desmarcar receitas favoritas; as favoritas aparecem primeiro na lista.
- Classificação automática pelo tempo de preparo: rápida (até 30 min), tempo médio (até 1 h 30) ou demorada.
- Busca por nome, autor ou ingrediente (ignora acentos e maiúsculas).
- Filtro por favoritas e por categoria (Doce, Salgado, Massa, Carne, Sopa, Bebida e Outro), com contagem.
- Resumo na tela inicial: total de receitas, favoritas e rápidas.

Regras de validação:

- nome obrigatório, com até 60 caracteres;
- categoria obrigatória, escolhida da lista;
- autor opcional, com até 40 caracteres;
- tempo de preparo: número inteiro de 1 a 1440 minutos;
- rendimento: número inteiro de 1 a 100 porções;
- pelo menos um ingrediente e no máximo 40 (um por linha);
- modo de preparo com pelo menos 10 caracteres;
- não é permitido cadastrar duas receitas com o mesmo nome e o mesmo autor.

## Como executar

Requisitos: Node.js e npm. Na pasta do projeto:

```bash
npm install
npx expo start
```

Abra no Expo Go lendo o QR Code, ou use `npm run web` para rodar no navegador. O projeto usa o Expo SDK 58, que é o da versão atual do Expo Go nas lojas. Se o aplicativo avisar que o projeto é incompatível, a versão do Expo Go no celular é de outro SDK: atualize o Expo Go ou ajuste o projeto para o SDK correspondente.

Depois de atualizar dependências, reinicie o servidor com `npx expo start -c` para limpar o cache.

## Estrutura em camadas

```
App.js                    entrada do app e contêiner de navegação
src/
  navigation/             rotas e fluxo entre telas
  screens/                telas: estado, eventos e chamadas aos serviços
  components/             elementos visuais reutilizáveis
  services/
    api.js                configuração do Axios (endereço e tempo limite)
    receitasApi.js        operações sobre os dados (GET, POST, PUT, DELETE)
  utils/                  regras e funções puras (receitas, validações, erros)
  theme/                  cores usadas na interface
tools/api-local.mjs       API local que imita a MockAPI, para ensaios
tests/                    testes automatizados
```

Cada camada só conhece as de baixo: as telas usam componentes, serviços e utilitários; os componentes usam utilitários; os serviços usam `api.js` e as regras de `utils`. As telas nunca montam requisições HTTP. As regras de negócio (classificação por tempo, busca, validações, duplicidade) ficam fora das telas, o que permite testá-las sem abrir o app.

As importações usam a extensão `.js` para que serviços e utilitários também possam ser carregados pelo Node nos testes.

## Fluxo de execução

`InicioScreen -> ListaScreen -> DetalheScreen -> FormularioScreen -> receitasApi -> api -> MockAPI`

Ao salvar: o formulário valida os campos, chama o serviço, o Axios envia POST (nova receita) ou PUT (edição), a MockAPI responde, o app volta para a lista e a lista busca os dados atualizados com GET. A tela de detalhe recebe a receita como parâmetro de navegação (`navigation.navigate('Detalhe', { receita })`).

## Persistência

Endpoint: `https://6ab558bf24ee9d3caa1c6927.mockapi.io/api/v1/dados`.

O recurso `/dados` é compartilhado com outras atividades. Por isso o app grava o campo `tipoRegistro: 'receita'` e só exibe, altera ou exclui registros desse tipo. Antes de um PUT ou DELETE o serviço consulta o registro e confirma o tipo. Nenhum registro de outra atividade é tocado.

Exemplo do JSON enviado (ingredientes e modo de preparo são texto, uma linha por item):

```json
{
  "nome": "Bolo de cenoura",
  "categoria": "Doce",
  "autor": "Vovó Maria",
  "tempoPreparoMin": 60,
  "porcoes": 12,
  "ingredientes": "3 cenouras\n4 ovos\n2 xícaras de açúcar",
  "modoPreparo": "Bata tudo no liquidificador.\nAsse por 40 minutos.",
  "favorita": true,
  "tipoRegistro": "receita"
}
```

Operações: GET `/dados`, GET `/dados/:id`, POST `/dados`, PUT `/dados/:id` e DELETE `/dados/:id`.

A API é pública e compartilhada: não cadastre dados pessoais ou sensíveis. O filtro por `tipoRegistro` serve para organizar os dados e não funciona como autenticação ou controle de acesso.

## Ensaio sem internet (API local)

Para treinar a apresentação sem depender da MockAPI, suba a API local, que aceita as mesmas rotas. Os dados ficam só na memória e somem ao encerrar.

```bash
npm run api:local
```

Em outro terminal, aponte o app para ela antes de iniciar o Expo (PowerShell):

```powershell
$env:EXPO_PUBLIC_API_URL = "http://localhost:3001/api/v1"
npx expo start --web
```

Para usar a API local no celular com o Expo Go, troque `localhost` pelo IP do computador na rede.

## Testes

```bash
npm test
```

Cobrem as regras de receitas (busca, filtros, ordenação, tempo), as validações e a camada de serviços (CRUD, favoritas, duplicidade e proteção de registros de outros tipos). Os testes de serviço rodam contra a API local, sem enviar nada à MockAPI.

## Limitações

- Não há login, fotos das receitas nem sincronização em tempo real.
- Como a MockAPI é compartilhada, outras pessoas podem alterar ou apagar os registros.
- A verificação de duplicidade é feita no aplicativo; dois acessos simultâneos poderiam cadastrar a mesma receita.
