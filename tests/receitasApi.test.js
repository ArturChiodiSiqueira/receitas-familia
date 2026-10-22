// Teste de integração da camada de serviços contra a API local (nada é enviado à MockAPI real).
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { criarApiLocal } from '../tools/api-local.mjs';

let servidor;
let servico;
let ErroNegocio;

const bolo = {
  nome: 'Bolo de cenoura',
  categoria: 'Doce',
  autor: 'Vovó Maria',
  tempoPreparoMin: '60',
  porcoes: '12',
  ingredientes: '3 cenouras\n\n4 ovos\n2 xícaras de açúcar\n',
  modoPreparo: 'Bata tudo no liquidificador e asse por 40 minutos.',
};

before(async () => {
  servidor = criarApiLocal();
  await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  process.env.EXPO_PUBLIC_API_URL = `http://127.0.0.1:${servidor.address().port}/api/v1`;
  // A importação vem depois de definir a URL, porque api.js lê a variável ao carregar.
  servico = await import('../src/services/receitasApi.js');
  ({ ErroNegocio } = await import('../src/utils/erros.js'));
});

after(() => new Promise((resolve) => servidor.close(resolve)));

test('a lista começa vazia: registros de outros exercícios são ignorados', async () => {
  assert.deepEqual(await servico.listarReceitas(), []);
});

test('criarReceita grava com tipoRegistro, números e ingredientes limpos', async () => {
  const criada = await servico.criarReceita(bolo);
  assert.ok(criada.id);
  assert.equal(criada.tipoRegistro, 'receita');
  assert.equal(criada.tempoPreparoMin, 60);
  assert.equal(criada.porcoes, 12);
  assert.equal(criada.favorita, false);
  assert.equal(criada.ingredientes, '3 cenouras\n4 ovos\n2 xícaras de açúcar');

  const lista = await servico.listarReceitas();
  assert.equal(lista.length, 1);
  assert.equal(lista[0].nome, 'Bolo de cenoura');
});

test('não permite o mesmo nome e autor, mas aceita outro autor', async () => {
  await assert.rejects(
    servico.criarReceita({ ...bolo, nome: '  bolo DE cenoura ', autor: 'VOVÓ maria' }),
    (erro) => erro instanceof ErroNegocio && /Já existe/.test(erro.message)
  );
  const outroAutor = await servico.criarReceita({ ...bolo, autor: 'Tia Rosa' });
  assert.ok(outroAutor.id);
});

test('atualizarReceita altera os dados e aceita manter o próprio nome', async () => {
  const [primeira] = await servico.listarReceitas();
  const atualizada = await servico.atualizarReceita(primeira.id, { ...primeira, porcoes: '16', tempoPreparoMin: '75' });
  assert.equal(atualizada.porcoes, 16);
  assert.equal(atualizada.tempoPreparoMin, 75);
  assert.equal(atualizada.nome, primeira.nome);
});

test('alternarFavorita liga e desliga a marcação', async () => {
  const [primeira] = await servico.listarReceitas();
  const marcada = await servico.alternarFavorita(primeira.id);
  assert.equal(marcada.favorita, true);

  const [primeiraDaLista] = await servico.listarReceitas();
  assert.equal(primeiraDaLista.id, primeira.id, 'favoritas vêm primeiro na lista');

  const desmarcada = await servico.alternarFavorita(primeira.id);
  assert.equal(desmarcada.favorita, false);
});

test('editar pelo formulário não perde a marcação de favorita', async () => {
  const [primeira] = await servico.listarReceitas();
  await servico.alternarFavorita(primeira.id);
  const editada = await servico.atualizarReceita(primeira.id, { ...primeira, porcoes: '10' });
  assert.equal(editada.favorita, true);
  assert.equal(editada.porcoes, 10);
});

test('excluirReceita remove apenas o registro pedido', async () => {
  const antes = await servico.listarReceitas();
  await servico.excluirReceita(antes[0].id);
  const depois = await servico.listarReceitas();
  assert.equal(depois.length, antes.length - 1);
  assert.ok(!depois.some((r) => r.id === antes[0].id));
});

test('não altera nem exclui registros de outros exercícios', async () => {
  await assert.rejects(servico.excluirReceita('1'), (erro) => erro instanceof ErroNegocio && /não pertence/.test(erro.message));
  await assert.rejects(servico.atualizarReceita('2', bolo), ErroNegocio);
  await assert.rejects(servico.alternarFavorita('1'), ErroNegocio);

  const resposta = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/dados`);
  const todos = await resposta.json();
  assert.ok(todos.some((r) => r.id === '1'));
  assert.ok(todos.some((r) => r.id === '2'));
});

test('registro inexistente gera mensagem de negócio', async () => {
  await assert.rejects(servico.excluirReceita('999'), (erro) => erro instanceof ErroNegocio && /não existe mais/.test(erro.message));
});

test('ignora registros receita com dados corrompidos', async () => {
  await fetch(`${process.env.EXPO_PUBLIC_API_URL}/dados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipoRegistro: 'receita', nome: 'Sem categoria' }),
  });
  const lista = await servico.listarReceitas();
  assert.ok(!lista.some((r) => r.nome === 'Sem categoria'));
});
