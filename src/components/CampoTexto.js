// Campo de texto com rótulo. Repassa as demais propriedades para o TextInput.
// Com "linhas" o campo vira uma caixa de várias linhas.
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores } from '../theme/cores.js';

export default function CampoTexto({ rotulo, obrigatorio = false, linhas = 0, estilo, ...resto }) {
  const multilinha = linhas > 0;
  return (
    <View style={[estilos.grupo, estilo]}>
      <Text style={estilos.rotulo}>
        {rotulo}
        {obrigatorio ? ' *' : ''}
      </Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.placeholder}
        multiline={multilinha}
        style={[estilos.entrada, multilinha && estilos.multilinha, multilinha && { height: linhas * 22 + 28 }]}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  rotulo: {
    color: cores.texto,
    fontWeight: '600',
    marginBottom: 6,
  },
  entrada: {
    backgroundColor: cores.superficie,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 8,
    padding: 13,
    fontSize: 15,
    color: cores.texto,
  },
  multilinha: {
    textAlignVertical: 'top',
  },
});
