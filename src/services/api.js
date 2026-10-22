// Camada de infraestrutura: endereço da API e configurações do Axios.
// EXPO_PUBLIC_API_URL permite trocar o servidor sem mexer no código (ex.: API local nos ensaios).
import axios from 'axios';

const URL_PADRAO = 'https://6ab558bf24ee9d3caa1c6927.mockapi.io/api/v1';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || URL_PADRAO,
  timeout: 15000,
});
