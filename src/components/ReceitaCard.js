// Cartão de uma receita na lista: recebe os dados e o callback pela tela, sem falar com a API.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores.js';
import { dividirLinhas, formatarPorcoes, formatarTempo } from '../utils/receitas.js';
import SelosReceita from './SelosReceita.js';

export default function ReceitaCard({ receita, onAbrir }) {
  const subtitulo = [receita.categoria, receita.autor && `por ${receita.autor}`].filter(Boolean).join(' · ');
  const totalIngredientes = dividirLinhas(receita.ingredientes).length;
  const textoIngredientes = totalIngredientes === 1 ? '1 ingrediente' : `${totalIngredientes} ingredientes`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir receita ${receita.nome}`}
      onPress={() => onAbrir(receita)}
      style={({ pressed }) => [estilos.card, pressed && estilos.pressionado]}
    >
      <Text style={estilos.nome}>{receita.nome}</Text>
      <Text style={estilos.subtitulo}>{subtitulo}</Text>
      <View style={estilos.selos}>
        <SelosReceita receita={receita} />
      </View>
      <Text style={estilos.meta}>
        {formatarTempo(receita.tempoPreparoMin)} · {formatarPorcoes(receita.porcoes)} · {textoIngredientes}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pressionado: {
    opacity: 0.85,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.texto,
  },
  subtitulo: {
    color: cores.textoSuave,
    marginTop: 2,
  },
  selos: {
    marginTop: 10,
  },
  meta: {
    color: cores.textoSuave,
    fontSize: 13,
    marginTop: 10,
  },
});
