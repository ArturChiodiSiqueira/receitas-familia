// Número em destaque com uma legenda, usado no resumo da tela inicial.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores.js';

export default function Indicador({ valor, legenda }) {
  return (
    <View style={estilos.caixa}>
      <Text style={estilos.valor}>{valor}</Text>
      <Text style={estilos.legenda}>{legenda}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  valor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.primariaEscura,
  },
  legenda: {
    color: cores.textoSuave,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});
