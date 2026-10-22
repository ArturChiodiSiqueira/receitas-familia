// Tela inicial: resume o caderno de receitas e leva para a lista ou para o cadastro.
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarReceitas } from '../services/receitasApi.js';
import { contarReceitas } from '../utils/receitas.js';
import { cores } from '../theme/cores.js';
import Botao from '../components/Botao.js';
import Indicador from '../components/Indicador.js';

export default function InicioScreen({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setReceitas(await listarReceitas());
    } catch (e) {
      setErro('Não foi possível consultar a API. Verifique a conexão.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // O resumo é atualizado sempre que a tela volta a ficar visível.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const resumo = contarReceitas(receitas);

  return (
    <View style={estilos.pagina}>
      <Text style={estilos.titulo}>Receitas de Família</Text>
      <Text style={estilos.subtitulo}>
        Guarde as receitas da família num só lugar: ingredientes, modo de preparo e quem ensinou.
      </Text>

      <View style={estilos.resumo}>
        {carregando ? (
          <ActivityIndicator size="large" color={cores.primaria} />
        ) : erro ? (
          <View>
            <Text style={estilos.erro}>{erro}</Text>
            <View style={estilos.tentar}>
              <Botao pequeno variante="secundario" titulo="Tentar novamente" onPress={carregar} />
            </View>
          </View>
        ) : (
          <View style={estilos.indicadores}>
            <Indicador valor={resumo.total} legenda="receitas" />
            <Indicador valor={resumo.favoritas} legenda="favoritas" />
            <Indicador valor={resumo.rapidas} legenda="rápidas (até 30 min)" />
          </View>
        )}
      </View>

      <View style={estilos.botoes}>
        <Botao titulo="Ver receitas" onPress={() => navigation.navigate('Lista')} />
        <Botao variante="secundario" titulo="Cadastrar receita" onPress={() => navigation.navigate('Formulario')} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pagina: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: cores.primariaEscura,
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: cores.textoSuave,
    marginBottom: 24,
  },
  resumo: {
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: 28,
  },
  indicadores: {
    flexDirection: 'row',
    gap: 10,
  },
  erro: {
    color: cores.erro,
    marginBottom: 12,
  },
  tentar: {
    alignSelf: 'flex-start',
  },
  botoes: {
    gap: 12,
  },
});
