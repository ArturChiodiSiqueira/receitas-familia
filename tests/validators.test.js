import test from 'node:test';
import assert from 'node:assert/strict';
import { validarReceita } from '../src/utils/validators.js';

const valida = {
  nome: 'Bolo de cenoura',
  categoria: 'Doce',
  autor: 'Vovó Maria',
  tempoPreparoMin: '60',
  porcoes: '12',
  ingredientes: '3 cenouras\n4 ovos',
  modoPreparo: 'Bata tudo no liquidificador e asse por 40 minutos.',
};

test('aceita uma receita completa', () => {
  assert.equal(validarReceita(valida), null);
  assert.equal(validarReceita({ ...valida, autor: '' }), null);
  assert.equal(validarReceita({ ...valida, tempoPreparoMin: 1440, porcoes: 100 }), null);
});

test('exige o nome e limita o tamanho', () => {
  assert.equal(validarReceita({ ...valida, nome: '   ' }), 'Informe o nome da receita.');
  assert.match(validarReceita({ ...valida, nome: 'a'.repeat(61) }), /no máximo 60/);
  assert.equal(validarReceita({ ...valida, nome: 'a'.repeat(60) }), null);
});

test('exige uma categoria da lista', () => {
  assert.equal(validarReceita({ ...valida, categoria: '' }), 'Escolha uma categoria.');
  assert.equal(validarReceita({ ...valida, categoria: 'Inexistente' }), 'Escolha uma categoria.');
});

test('limita o tamanho do autor', () => {
  assert.match(validarReceita({ ...valida, autor: 'a'.repeat(41) }), /autor deve ter no máximo/);
});

test('o tempo de preparo precisa ser inteiro de 1 a 1440', () => {
  for (const invalido of ['', 'abc', '0', '-5', '2.5', '1441']) {
    assert.match(validarReceita({ ...valida, tempoPreparoMin: invalido }), /tempo de preparo/, `valor: "${invalido}"`);
  }
});

test('o rendimento precisa ser inteiro de 1 a 100', () => {
  for (const invalido of ['', 'x', '0', '-1', '3.5', '101']) {
    assert.match(validarReceita({ ...valida, porcoes: invalido }), /rendimento/, `valor: "${invalido}"`);
  }
});

test('exige ingredientes, ignorando linhas em branco', () => {
  assert.match(validarReceita({ ...valida, ingredientes: '' }), /pelo menos um ingrediente/);
  assert.match(validarReceita({ ...valida, ingredientes: ' \n \n' }), /pelo menos um ingrediente/);
  const demais = Array.from({ length: 41 }, (_, i) => `item ${i}`).join('\n');
  assert.match(validarReceita({ ...valida, ingredientes: demais }), /no máximo 40/);
});

test('exige um modo de preparo com pelo menos 10 caracteres', () => {
  assert.match(validarReceita({ ...valida, modoPreparo: '' }), /modo de preparo/);
  assert.match(validarReceita({ ...valida, modoPreparo: 'Misture.' }), /mínimo de 10/);
  assert.equal(validarReceita({ ...valida, modoPreparo: 'Misture bem' }), null);
});
