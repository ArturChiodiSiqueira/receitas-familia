// Formulário único para cadastrar (POST) e editar (PUT).
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { atualizarReceita, criarReceita } from '../services/receitasApi.js';
import { mensagemDeErro } from '../utils/erros.js';
import { CATEGORIAS } from '../utils/receitas.js';
import { LIMITE_AUTOR, LIMITE_NOME, validarReceita } from '../utils/validators.js';
import { cores } from '../theme/cores.js';
import Botao from '../components/Botao.js';
import CampoTexto from '../components/CampoTexto.js';
import Chips from '../components/Chips.js';

const OPCOES_CATEGORIA = CATEGORIAS.map((categoria) => ({ valor: categoria, titulo: categoria }));

export default function FormularioScreen({ route, navigation }) {
  const receita = route.params?.receita; // Quando existe, estamos editando.

  const [nome, setNome] = useState(receita?.nome || '');
  const [categoria, setCategoria] = useState(receita?.categoria || '');
  const [autor, setAutor] = useState(receita?.autor || '');
  const [tempoPreparoMin, setTempoPreparoMin] = useState(receita ? String(receita.tempoPreparoMin) : '30');
  const [porcoes, setPorcoes] = useState(receita ? String(receita.porcoes) : '4');
  const [ingredientes, setIngredientes] = useState(receita?.ingredientes || '');
  const [modoPreparo, setModoPreparo] = useState(receita?.modoPreparo || '');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // O aviso some assim que o usuário mexe em algum campo.
  useEffect(() => {
    setMensagem('');
  }, [nome, categoria, autor, tempoPreparoMin, porcoes, ingredientes, modoPreparo]);

  async function salvar() {
    const dados = {
      nome: nome.trim(),
      categoria,
      autor: autor.trim(),
      tempoPreparoMin: tempoPreparoMin.trim(),
      porcoes: porcoes.trim(),
      ingredientes,
      modoPreparo: modoPreparo.trim(),
    };

    const problema = validarReceita(dados);
    if (problema) {
      setMensagem(problema);
      return;
    }

    setSalvando(true);
    setMensagem('');
    try {
      if (receita) await atualizarReceita(receita.id, dados);
      else await criarReceita(dados);
      // Reinicia a pilha em Início > Lista, de onde quer que o formulário tenha sido aberto.
      navigation.reset({ index: 1, routes: [{ name: 'Inicio' }, { name: 'Lista' }] });
    } catch (e) {
      setMensagem(mensagemDeErro(e, 'Erro ao salvar. Confira a conexão e tente novamente.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pagina} keyboardShouldPersistTaps="handled">
      <Text style={estilos.titulo}>{receita ? 'Editar receita' : 'Cadastrar receita'}</Text>

      <CampoTexto
        rotulo="Nome da receita"
        obrigatorio
        value={nome}
        onChangeText={setNome}
        maxLength={LIMITE_NOME}
        placeholder="Ex.: Bolo de cenoura"
      />

      <View style={estilos.grupo}>
        <Text style={estilos.rotulo}>Categoria *</Text>
        <Chips opcoes={OPCOES_CATEGORIA} valor={categoria} onChange={setCategoria} />
      </View>

      <CampoTexto
        rotulo="Receita de quem"
        value={autor}
        onChangeText={setAutor}
        maxLength={LIMITE_AUTOR}
        placeholder="Ex.: Vovó Maria"
      />

      <View style={estilos.linha}>
        <CampoTexto
          estilo={estilos.metade}
          rotulo="Tempo (minutos)"
          obrigatorio
          value={tempoPreparoMin}
          onChangeText={setTempoPreparoMin}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Ex.: 45"
        />
        <CampoTexto
          estilo={estilos.metade}
          rotulo="Rende (porções)"
          obrigatorio
          value={porcoes}
          onChangeText={setPorcoes}
          keyboardType="numeric"
          maxLength={3}
          placeholder="Ex.: 8"
        />
      </View>

      <CampoTexto
        rotulo="Ingredientes (um por linha)"
        obrigatorio
        linhas={6}
        value={ingredientes}
        onChangeText={setIngredientes}
        placeholder={'3 cenouras\n4 ovos\n2 xícaras de açúcar'}
      />
      <CampoTexto
        rotulo="Modo de preparo (um passo por linha)"
        obrigatorio
        linhas={6}
        value={modoPreparo}
        onChangeText={setModoPreparo}
        placeholder={'Bata as cenouras com os ovos.\nAdicione o açúcar e misture.\nAsse por 40 minutos.'}
      />

      {mensagem ? <Text style={estilos.erro}>{mensagem}</Text> : null}

      <Botao titulo={salvando ? 'Salvando...' : 'Salvar receita'} desabilitado={salvando} onPress={salvar} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: {
    padding: 22,
    backgroundColor: cores.fundo,
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.primariaEscura,
    marginBottom: 22,
  },
  grupo: {
    marginBottom: 16,
  },
  rotulo: {
    color: cores.texto,
    fontWeight: '600',
    marginBottom: 8,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  metade: {
    flex: 1,
  },
  erro: {
    color: cores.erro,
    marginBottom: 14,
  },
});
