// Camada de navegação: associa o nome de cada rota à sua tela.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { cores } from '../theme/cores.js';
import InicioScreen from '../screens/InicioScreen.js';
import ListaScreen from '../screens/ListaScreen.js';
import DetalheScreen from '../screens/DetalheScreen.js';
import FormularioScreen from '../screens/FormularioScreen.js';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="Inicio" component={InicioScreen} options={{ title: 'Receitas de Família' }} />
      <Stack.Screen name="Lista" component={ListaScreen} options={{ title: 'Receitas' }} />
      <Stack.Screen name="Detalhe" component={DetalheScreen} options={{ title: 'Receita' }} />
      <Stack.Screen
        name="Formulario"
        component={FormularioScreen}
        options={({ route }) => ({ title: route.params?.receita ? 'Editar receita' : 'Nova receita' })}
      />
    </Stack.Navigator>
  );
}
