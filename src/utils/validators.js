// Regras de validação aplicadas antes de enviar os dados ao servidor.
import { CATEGORIAS, dividirLinhas } from './receitas.js';

export const LIMITE_NOME = 60;
export const LIMITE_AUTOR = 40;
export const TEMPO_MAXIMO = 1440;
export const PORCOES_MAXIMAS = 100;
export const MAXIMO_INGREDIENTES = 40;
export const MINIMO_PREPARO = 10;

function inteiroEntre(valor, minimo, maximo) {
  const texto = String(valor).trim();
  const numero = Number(texto);
  return texto !== '' && Number.isInteger(numero) && numero >= minimo && numero <= maximo;
}

// Devolve a mensagem do primeiro problema encontrado, ou null se está tudo certo.
export function validarReceita({ nome, categoria, autor, tempoPreparoMin, porcoes, ingredientes, modoPreparo }) {
  if (!nome.trim()) return 'Informe o nome da receita.';
  if (nome.trim().length > LIMITE_NOME) return `O nome deve ter no máximo ${LIMITE_NOME} caracteres.`;
  if (!CATEGORIAS.includes(categoria)) return 'Escolha uma categoria.';
  if (autor.trim().length > LIMITE_AUTOR) return `O autor deve ter no máximo ${LIMITE_AUTOR} caracteres.`;

  if (!inteiroEntre(tempoPreparoMin, 1, TEMPO_MAXIMO)) {
    return `O tempo de preparo deve ser um número inteiro de 1 a ${TEMPO_MAXIMO} minutos.`;
  }
  if (!inteiroEntre(porcoes, 1, PORCOES_MAXIMAS)) {
    return `O rendimento deve ser um número inteiro de 1 a ${PORCOES_MAXIMAS} porções.`;
  }

  const itens = dividirLinhas(ingredientes);
  if (itens.length === 0) return 'Informe pelo menos um ingrediente (um por linha).';
  if (itens.length > MAXIMO_INGREDIENTES) return `Use no máximo ${MAXIMO_INGREDIENTES} ingredientes.`;

  if (modoPreparo.trim().length < MINIMO_PREPARO) {
    return `Descreva o modo de preparo (mínimo de ${MINIMO_PREPARO} caracteres).`;
  }
  return null;
}
