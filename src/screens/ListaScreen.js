// Lista de receitas com busca e filtro. Toda a comunicação com a API passa pela camada de serviços.
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarReceitas } from '../services/receitasApi.js';
import { CATEGORIAS, contarReceitas, filtrarReceitas } from '../utils/receitas.js';
import { cores } from '../theme/cores.js';
import Botao from '../components/Botao.js';
import Chips from '../components/Chips.js';
import ReceitaCard from '../components/ReceitaCard.js';

const FILTRO_FAVORITAS = 'favoritas';

export default function ListaScreen({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setReceitas(await listarReceitas());
    } catch (e) {
      setErro('Não foi possível consultar a API.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca de novo toda vez que a tela recebe foco, inclusive depois de salvar ou excluir.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const contagem = useMemo(() => contarReceitas(receitas), [receitas]);

  // Só aparecem as categorias que têm receitas (mais a que estiver selecionada).
  const opcoes = useMemo(
    () => [
      { valor: '', titulo: `Todas (${contagem.total})` },
      { valor: FILTRO_FAVORITAS, titulo: `Favoritas (${contagem.favoritas})` },
      ...CATEGORIAS.filter((categoria) => contagem.porCategoria[categoria] > 0 || categoria === filtro).map((categoria) => ({
        valor: categoria,
        titulo: `${categoria} (${contagem.porCategoria[categoria]})`,
      })),
    ],
    [contagem, filtro]
  );

  const visiveis = useMemo(
    () =>
      filtrarReceitas(receitas, {
        texto: busca,
        categoria: CATEGORIAS.includes(filtro) ? filtro : '',
        somenteFavoritas: filtro === FILTRO_FAVORITAS,
      }),
    [receitas, busca, filtro]
  );

  const vazio = receitas.length === 0
    ? 'Nenhuma receita cadastrada. Use o botão acima para começar.'
    : 'Nenhuma receita encontrada com esse filtro.';

  return (
    <View style={estilos.pagina}>
      <Botao titulo="+ Nova receita" onPress={() => navigation.navigate('Formulario')} />

      <TextInput
        accessibilityLabel="Buscar receita"
        style={estilos.busca}
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar por nome, autor ou ingrediente"
        placeholderTextColor={cores.placeholder}
      />
      <View style={estilos.filtros}>
        <Chips opcoes={opcoes} valor={filtro} onChange={setFiltro} />
      </View>

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      {carregando && receitas.length === 0 ? <ActivityIndicator size="large" color={cores.primaria} /> : null}

      <FlatList
        data={visiveis}
        keyExtractor={(receita) => String(receita.id)}
        renderItem={({ item }) => (
          <ReceitaCard receita={item} onAbrir={(receita) => navigation.navigate('Detalhe', { receita })} />
        )}
        ListEmptyComponent={!carregando ? <Text style={estilos.vazio}>{vazio}</Text> : null}
        refreshing={carregando && receitas.length > 0}
        onRefresh={carregar}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pagina: {
    flex: 1,
    padding: 16,
    backgroundColor: cores.fundo,
  },
  busca: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    marginBottom: 12,
    color: cores.texto,
  },
  filtros: {
    marginBottom: 14,
  },
  erro: {
    color: cores.erro,
    marginBottom: 12,
  },
  vazio: {
    color: cores.textoSuave,
    textAlign: 'center',
    marginTop: 24,
  },
});
