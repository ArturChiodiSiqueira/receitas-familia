// Camada de serviços: as telas pedem "criar", "favoritar", "excluir" e não conhecem HTTP.
import { api } from './api.js';
import { ErroNegocio } from '../utils/erros.js';
import { CATEGORIAS, dividirLinhas, normalizarTexto, ordenarReceitas } from '../utils/receitas.js';

const ENDPOINT = '/dados';
// O recurso /dados é compartilhado com outros exercícios, então marcamos e filtramos nossos registros.
const TIPO = 'receita';

function caminho(id) {
  return `${ENDPOINT}/${encodeURIComponent(id)}`;
}

// Só os campos conhecidos são enviados; o id e a data de criação ficam por conta da API.
function montarPayload(dados) {
  return {
    tipoRegistro: TIPO,
    nome: dados.nome.trim(),
    categoria: dados.categoria,
    autor: (dados.autor || '').trim(),
    tempoPreparoMin: Number(dados.tempoPreparoMin),
    porcoes: Number(dados.porcoes),
    ingredientes: dividirLinhas(dados.ingredientes).join('\n'),
    modoPreparo: dados.modoPreparo.trim(),
    favorita: Boolean(dados.favorita),
  };
}

function normalizar(registro) {
  return {
    ...registro,
    autor: registro.autor || '',
    tempoPreparoMin: Number(registro.tempoPreparoMin),
    porcoes: Number(registro.porcoes),
    favorita: registro.favorita === true || registro.favorita === 'true',
  };
}

function registroUtilizavel(registro) {
  return (
    registro.tipoRegistro === TIPO &&
    typeof registro.nome === 'string' &&
    CATEGORIAS.includes(registro.categoria) &&
    typeof registro.ingredientes === 'string' &&
    typeof registro.modoPreparo === 'string' &&
    Number(registro.tempoPreparoMin) > 0 &&
    Number(registro.porcoes) > 0
  );
}

// Duas receitas só são "a mesma" se tiverem o mesmo nome e o mesmo autor.
function mesmaReceita(a, b) {
  const chave = (receita) => `${normalizarTexto(receita.nome.trim())}|${normalizarTexto((receita.autor || '').trim())}`;
  return chave(a) === chave(b);
}

export async function listarReceitas() {
  const resposta = await api.get(ENDPOINT);
  return ordenarReceitas(resposta.data.filter(registroUtilizavel).map(normalizar));
}

// Busca um registro e garante que ele pertence às Receitas de Família antes de alterar ou excluir.
async function buscarPropria(id) {
  let resposta;
  try {
    resposta = await api.get(caminho(id));
  } catch (erro) {
    if (erro.response && erro.response.status === 404) {
      throw new ErroNegocio('Essa receita não existe mais.');
    }
    throw erro;
  }
  if (resposta.data.tipoRegistro !== TIPO) {
    throw new ErroNegocio('Registro não pertence às Receitas de Família.');
  }
  return normalizar(resposta.data);
}

async function impedirDuplicidade(dados, idAtual) {
  const existentes = await listarReceitas();
  const repetida = existentes.some((receita) => String(receita.id) !== String(idAtual) && mesmaReceita(receita, dados));
  if (repetida) throw new ErroNegocio('Já existe uma receita com esse nome e esse autor.');
}

export async function criarReceita(dados) {
  await impedirDuplicidade(dados);
  const resposta = await api.post(ENDPOINT, montarPayload({ ...dados, favorita: false }));
  return normalizar(resposta.data);
}

// A marcação de favorita não é alterada pelo formulário: continua como estava.
export async function atualizarReceita(id, dados) {
  const atual = await buscarPropria(id);
  await impedirDuplicidade(dados, id);
  const resposta = await api.put(caminho(id), montarPayload({ ...dados, favorita: atual.favorita }));
  return normalizar(resposta.data);
}

export async function alternarFavorita(id) {
  const atual = await buscarPropria(id);
  const resposta = await api.put(caminho(id), montarPayload({ ...atual, favorita: !atual.favorita }));
  return normalizar(resposta.data);
}

export async function excluirReceita(id) {
  await buscarPropria(id);
  await api.delete(caminho(id));
}
