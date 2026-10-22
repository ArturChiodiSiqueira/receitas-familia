// Regras de negócio das receitas: categorias, tempo de preparo, busca e ordenação.

export const CATEGORIAS = ['Doce', 'Salgado', 'Massa', 'Carne', 'Sopa', 'Bebida', 'Outro'];

export const NIVEL_TEMPO = {
  RAPIDA: 'rapida',
  MEDIA: 'media',
  DEMORADA: 'demorada',
};

export const LIMITE_RAPIDA = 30;
export const LIMITE_MEDIA = 90;

// Ingredientes e modo de preparo são guardados como texto, uma linha por item.
export function dividirLinhas(texto) {
  return String(texto || '')
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean);
}

export function formatarTempo(minutos) {
  const total = Number(minutos);
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas} h`;
  return `${horas} h ${resto} min`;
}

export function formatarPorcoes(porcoes) {
  return Number(porcoes) === 1 ? '1 porção' : `${porcoes} porções`;
}

export function nivelTempo(minutos) {
  const total = Number(minutos);
  if (total <= LIMITE_RAPIDA) return NIVEL_TEMPO.RAPIDA;
  if (total <= LIMITE_MEDIA) return NIVEL_TEMPO.MEDIA;
  return NIVEL_TEMPO.DEMORADA;
}

export function descreverNivelTempo(nivel) {
  if (nivel === NIVEL_TEMPO.RAPIDA) return 'Rápida';
  if (nivel === NIVEL_TEMPO.MEDIA) return 'Tempo médio';
  return 'Demorada';
}

// Minúsculas e sem acentos, para comparar e buscar textos.
export function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Favoritas primeiro; dentro de cada grupo, ordem alfabética.
export function ordenarReceitas(receitas) {
  return [...receitas].sort((a, b) => {
    if (a.favorita !== b.favorita) return a.favorita ? -1 : 1;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

export function contarReceitas(receitas) {
  const porCategoria = {};
  CATEGORIAS.forEach((categoria) => {
    porCategoria[categoria] = 0;
  });
  let favoritas = 0;
  let rapidas = 0;
  receitas.forEach((receita) => {
    if (receita.favorita) favoritas += 1;
    if (nivelTempo(receita.tempoPreparoMin) === NIVEL_TEMPO.RAPIDA) rapidas += 1;
    if (receita.categoria in porCategoria) porCategoria[receita.categoria] += 1;
  });
  return { total: receitas.length, favoritas, rapidas, porCategoria };
}

// "categoria" vazio significa todas; "texto" procura no nome, no autor e nos ingredientes.
export function filtrarReceitas(receitas, { texto = '', categoria = '', somenteFavoritas = false } = {}) {
  const busca = normalizarTexto(texto.trim());
  return receitas.filter((receita) => {
    if (somenteFavoritas && !receita.favorita) return false;
    if (categoria && receita.categoria !== categoria) return false;
    if (!busca) return true;
    return [receita.nome, receita.autor, receita.ingredientes].some((campo) => normalizarTexto(campo).includes(busca));
  });
}
