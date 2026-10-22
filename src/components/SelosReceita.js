// Selos de uma receita: nível de tempo de preparo e, se for o caso, a marcação de favorita.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cores } from '../theme/cores.js';
import { descreverNivelTempo, nivelTempo } from '../utils/receitas.js';
import Selo from './Selo.js';

export default function SelosReceita({ receita }) {
  const nivel = nivelTempo(receita.tempoPreparoMin);
  const paleta = cores.tempo[nivel];
  return (
    <View style={estilos.linha}>
      {receita.favorita ? <Selo texto="Favorita" fundo="#fdf0cf" cor="#7a5200" /> : null}
      <Selo texto={descreverNivelTempo(nivel)} fundo={paleta.fundo} cor={paleta.texto} />
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
