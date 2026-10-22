// Botão reutilizável. A variante define a aparência: primario, secundario ou perigo.
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../theme/cores.js';

export default function Botao({ titulo, onPress, variante = 'primario', pequeno = false, desabilitado = false, rotulo }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo || titulo}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        pequeno && estilos.pequeno,
        estilos[variante],
        pressed && estilos.pressionado,
        desabilitado && estilos.desabilitado,
      ]}
    >
      <Text style={[estilos.texto, pequeno && estilos.textoPequeno, estilos[`texto_${variante}`]]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pequeno: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  primario: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  secundario: {
    backgroundColor: cores.superficie,
    borderColor: cores.primaria,
  },
  perigo: {
    backgroundColor: cores.superficie,
    borderColor: cores.erro,
  },
  pressionado: {
    opacity: 0.8,
  },
  desabilitado: {
    opacity: 0.45,
  },
  texto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  textoPequeno: {
    fontSize: 13,
  },
  texto_primario: {
    color: '#ffffff',
  },
  texto_secundario: {
    color: cores.primaria,
  },
  texto_perigo: {
    color: cores.erro,
  },
});
