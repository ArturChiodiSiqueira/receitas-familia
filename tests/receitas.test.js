import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORIAS,
  NIVEL_TEMPO,
  contarReceitas,
  descreverNivelTempo,
  dividirLinhas,
  filtrarReceitas,
  formatarPorcoes,
  formatarTempo,
  nivelTempo,
  normalizarTexto,
  ordenarReceitas,
} from '../src/utils/receitas.js';

const bolo = {
  nome: 'Bolo de cenoura',
  categoria: 'Doce',
  autor: 'Vovó Maria',
  tempoPreparoMin: 60,
  porcoes: 12,
  ingredientes: '3 cenouras\n4 ovos\n2 xícaras de açúcar',
  favorita: true,
};
const lasanha = {
  nome: 'Lasanha',
  categoria: 'Massa',
  autor: 'Tia Rosa',
  tempoPreparoMin: 120,
  porcoes: 8,
  ingredientes: 'massa de lasanha\nmolho de tomate\nqueijo',
  favorita: false,
};
const brigadeiro = {
  nome: 'Brigadeiro',
  categoria: 'Doce',
  autor: '',
  tempoPreparoMin: 20,
  porcoes: 30,
  ingredientes: 'leite condensado\nchocolate em pó',
  favorita: false,
};

test('dividirLinhas separa por linha e ignora linhas vazias e espaços', () => {
  assert.deepEqual(dividirLinhas(' 2 ovos \n\n  1 xícara de leite\r\n'), ['2 ovos', '1 xícara de leite']);
  assert.deepEqual(dividirLinhas(''), []);
  assert.deepEqual(dividirLinhas(undefined), []);
});

test('formatarTempo mostra minutos, horas ou os dois', () => {
  assert.equal(formatarTempo(45), '45 min');
  assert.equal(formatarTempo(60), '1 h');
  assert.equal(formatarTempo(90), '1 h 30 min');
  assert.equal(formatarTempo('125'), '2 h 5 min');
});

test('formatarPorcoes usa singular e plural', () => {
  assert.equal(formatarPorcoes(1), '1 porção');
  assert.equal(formatarPorcoes(8), '8 porções');
});

test('nivelTempo classifica pelo tempo de preparo', () => {
  assert.equal(nivelTempo(30), NIVEL_TEMPO.RAPIDA);
  assert.equal(nivelTempo(31), NIVEL_TEMPO.MEDIA);
  assert.equal(nivelTempo(90), NIVEL_TEMPO.MEDIA);
  assert.equal(nivelTempo(91), NIVEL_TEMPO.DEMORADA);
  assert.equal(descreverNivelTempo(NIVEL_TEMPO.RAPIDA), 'Rápida');
  assert.equal(descreverNivelTempo(NIVEL_TEMPO.MEDIA), 'Tempo médio');
  assert.equal(descreverNivelTempo(NIVEL_TEMPO.DEMORADA), 'Demorada');
});

test('normalizarTexto remove acentos e usa minúsculas', () => {
  assert.equal(normalizarTexto('Vovó MARIA, Pão-de-Ló'), 'vovo maria, pao-de-lo');
  assert.equal(normalizarTexto(undefined), '');
});

test('ordenarReceitas coloca as favoritas primeiro, depois ordem alfabética, sem alterar o original', () => {
  const original = [lasanha, brigadeiro, bolo];
  const ordenadas = ordenarReceitas(original);
  assert.deepEqual(ordenadas.map((r) => r.nome), ['Bolo de cenoura', 'Brigadeiro', 'Lasanha']);
  assert.deepEqual(original.map((r) => r.nome), ['Lasanha', 'Brigadeiro', 'Bolo de cenoura']);
});

test('contarReceitas totaliza favoritas, rápidas e categorias', () => {
  const contagem = contarReceitas([bolo, lasanha, brigadeiro]);
  assert.equal(contagem.total, 3);
  assert.equal(contagem.favoritas, 1);
  assert.equal(contagem.rapidas, 1);
  assert.equal(contagem.porCategoria.Doce, 2);
  assert.equal(contagem.porCategoria.Massa, 1);
  assert.equal(contagem.porCategoria.Sopa, 0);
  assert.deepEqual(Object.keys(contagem.porCategoria), CATEGORIAS);
});

test('filtrarReceitas busca no nome, no autor e nos ingredientes ignorando acento', () => {
  const todas = [bolo, lasanha, brigadeiro];
  const nomes = (lista) => lista.map((r) => r.nome);
  assert.deepEqual(nomes(filtrarReceitas(todas, { texto: 'VOVO' })), ['Bolo de cenoura']);
  assert.deepEqual(nomes(filtrarReceitas(todas, { texto: 'acucar' })), ['Bolo de cenoura']);
  assert.deepEqual(nomes(filtrarReceitas(todas, { texto: 'queijo' })), ['Lasanha']);
  assert.deepEqual(nomes(filtrarReceitas(todas, { texto: 'lasanha' })), ['Lasanha']);
  assert.equal(filtrarReceitas(todas, { texto: 'abacate' }).length, 0);
});

test('filtrarReceitas combina texto, categoria e favoritas', () => {
  const todas = [bolo, lasanha, brigadeiro];
  const nomes = (lista) => lista.map((r) => r.nome);
  assert.deepEqual(nomes(filtrarReceitas(todas, { categoria: 'Doce' })), ['Bolo de cenoura', 'Brigadeiro']);
  assert.deepEqual(nomes(filtrarReceitas(todas, { somenteFavoritas: true })), ['Bolo de cenoura']);
  assert.deepEqual(nomes(filtrarReceitas(todas, { categoria: 'Doce', texto: 'chocolate' })), ['Brigadeiro']);
  assert.equal(filtrarReceitas(todas, { categoria: 'Massa', somenteFavoritas: true }).length, 0);
  assert.equal(filtrarReceitas(todas).length, 3);
});
