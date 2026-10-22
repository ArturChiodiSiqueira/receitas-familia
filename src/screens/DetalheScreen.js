// Detalhe de uma receita: ingredientes, modo de preparo e ações (favoritar, editar, excluir).
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { alternarFavorita, excluirReceita } from '../services/receitasApi.js';
import { confirmar } from '../utils/dialogo.js';
import { mensagemDeErro } from '../utils/erros.js';
import { dividirLinhas, formatarPorcoes, formatarTempo } from '../utils/receitas.js';
import { cores } from '../theme/cores.js';
import Botao from '../components/Botao.js';
import SelosReceita from '../components/SelosReceita.js';

export default function DetalheScreen({ route, navigation }) {
  const [receita, setReceita] = useState(route.params.receita);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const ingredientes = dividirLinhas(receita.ingredientes);
  const passos = dividirLinhas(receita.modoPreparo);

  async function favoritar() {
    setOcupado(true);
    setErro('');
    try {
      setReceita(await alternarFavorita(receita.id));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível atualizar a receita.'));
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    const confirmado = await confirmar('Excluir receita', `Deseja excluir ${receita.nome}?`, 'Excluir');
    if (!confirmado) return;
    setOcupado(true);
    setErro('');
    try {
      await excluirReceita(receita.id);
      // Reinicia a pilha em Início > Lista para não voltar a uma receita que não existe mais.
      navigation.reset({ index: 1, routes: [{ name: 'Inicio' }, { name: 'Lista' }] });
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível excluir a receita.'));
      setOcupado(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pagina}>
      <Text style={estilos.nome}>{receita.nome}</Text>
      <Text style={estilos.autor}>
        {receita.categoria}
        {receita.autor ? ` · receita de ${receita.autor}` : ''}
      </Text>

      <View style={estilos.selos}>
        <SelosReceita receita={receita} />
      </View>
      <Text style={estilos.meta}>
        Preparo: {formatarTempo(receita.tempoPreparoMin)} · Rende {formatarPorcoes(receita.porcoes)}
      </Text>

      <Text style={estilos.secao}>Ingredientes</Text>
      {ingredientes.map((ingrediente, indice) => (
        <Text key={`${indice}-${ingrediente}`} style={estilos.item}>
          {'•'} {ingrediente}
        </Text>
      ))}

      <Text style={estilos.secao}>Modo de preparo</Text>
      {passos.map((passo, indice) => (
        <Text key={`${indice}-${passo}`} style={estilos.item}>
          {indice + 1}. {passo}
        </Text>
      ))}

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

      <View style={estilos.acoes}>
        <Botao
          variante="secundario"
          titulo={receita.favorita ? 'Remover dos favoritos' : 'Marcar como favorita'}
          desabilitado={ocupado}
          onPress={favoritar}
        />
        <Botao titulo="Editar receita" desabilitado={ocupado} onPress={() => navigation.navigate('Formulario', { receita })} />
        <Botao variante="perigo" titulo="Excluir receita" desabilitado={ocupado} onPress={excluir} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: {
    padding: 22,
    backgroundColor: cores.fundo,
    flexGrow: 1,
  },
  nome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: cores.primariaEscura,
  },
  autor: {
    color: cores.textoSuave,
    marginTop: 4,
  },
  selos: {
    marginTop: 12,
  },
  meta: {
    color: cores.texto,
    marginTop: 12,
  },
  secao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.texto,
    marginTop: 24,
    marginBottom: 8,
  },
  item: {
    color: cores.texto,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  erro: {
    color: cores.erro,
    marginTop: 16,
  },
  acoes: {
    gap: 10,
    marginTop: 28,
  },
});
