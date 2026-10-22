// API local que imita a MockAPI usada pelo projeto (GET, POST, PUT e DELETE em /dados).
// Serve para ensaiar a apresentação sem internet e para os testes automatizados.
// Os dados ficam só na memória: ao parar o servidor tudo é descartado.
//
// Uso: npm run api:local   (porta 3001, ou a definida em PORT)
import http from 'node:http';
import { pathToFileURL } from 'node:url';

const PREFIXO = '/api/v1/dados';

// Registros de outros exercícios, como acontece no recurso compartilhado da aula.
function registrosIniciais() {
  return [
    { id: '1', createdAt: '2026-10-01T12:00:00.000Z', titulo: 'Estudar React Native', data: '2026-10-20', hora: '14:30', tipoRegistro: 'agendamento' },
    { id: '2', createdAt: '2026-10-01T12:05:00.000Z', name: 'Cliente de outra atividade', email: 'cliente@exemplo.com' },
  ];
}

export function criarApiLocal(registros = registrosIniciais()) {
  let proximoId = registros.reduce((maior, r) => Math.max(maior, Number(r.id) || 0), 0) + 1;

  function responder(res, status, corpo) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(corpo === undefined ? undefined : JSON.stringify(corpo));
  }

  function lerCorpo(req) {
    return new Promise((resolve, reject) => {
      let texto = '';
      req.setEncoding('utf8');
      req.on('data', (parte) => {
        texto += parte;
      });
      req.on('end', () => {
        try {
          resolve(texto ? JSON.parse(texto) : {});
        } catch (erro) {
          reject(erro);
        }
      });
    });
  }

  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');

    if (req.method === 'OPTIONS') return responder(res, 204);
    if (pathname !== PREFIXO && !pathname.startsWith(`${PREFIXO}/`)) return responder(res, 404, 'Not found');

    const id = pathname.slice(PREFIXO.length + 1);
    const posicao = registros.findIndex((r) => String(r.id) === id);

    try {
      if (!id) {
        if (req.method === 'GET') return responder(res, 200, registros);
        if (req.method === 'POST') {
          const novo = { ...(await lerCorpo(req)), id: String(proximoId), createdAt: new Date().toISOString() };
          proximoId += 1;
          registros.push(novo);
          return responder(res, 201, novo);
        }
      } else {
        if (posicao === -1) return responder(res, 404, 'Not found');
        if (req.method === 'GET') return responder(res, 200, registros[posicao]);
        if (req.method === 'PUT') {
          registros[posicao] = { ...registros[posicao], ...(await lerCorpo(req)), id: registros[posicao].id };
          return responder(res, 200, registros[posicao]);
        }
        if (req.method === 'DELETE') {
          const [removido] = registros.splice(posicao, 1);
          return responder(res, 200, removido);
        }
      }
      return responder(res, 405, 'Method not allowed');
    } catch (erro) {
      return responder(res, 400, 'JSON inválido');
    }
  });
}

const executadoDiretamente = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (executadoDiretamente) {
  const porta = Number(process.env.PORT) || 3001;
  criarApiLocal().listen(porta, () => {
    console.log(`API local em http://localhost:${porta}/api/v1`);
    console.log('Para usar no app, defina EXPO_PUBLIC_API_URL com esse endereço antes de iniciar o Expo.');
  });
}
