// Etiqueta colorida com um texto curto.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Selo({ texto, fundo, cor }) {
  return (
    <View style={[estilos.selo, { backgroundColor: fundo }]}>
      <Text style={[estilos.texto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  texto: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
