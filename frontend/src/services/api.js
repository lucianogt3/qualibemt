import axios from 'axios';

const api = axios.create({
  // Deixe vazio ou apenas '/' para não duplicar o caminho
  baseURL: '/' 
});

export default api;