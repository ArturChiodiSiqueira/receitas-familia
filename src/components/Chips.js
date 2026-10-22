// Fileira de opções selecionáveis, usada para escolher a categoria e para filtrar a lista.
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores.js';

export default function Chips({ opcoes, valor, onChange }) {
  return (
    <View style={estilos.linha}>
      {opcoes.map((opcao) => {
        const ativo = valor === opcao.valor;
        return (
          <Pressable
            key={opcao.titulo}
            accessibilityRole="button"
            accessibilityLabel={opcao.titulo}
            accessibilityState={{ selected: ativo }}
            onPress={() => onChange(opcao.valor)}
            style={[estilos.chip, ativo && estilos.chipAtivo]}
          >
            <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>{opcao.titulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipAtivo: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  texto: {
    color: cores.texto,
    fontSize: 13,
  },
  textoAtivo: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
