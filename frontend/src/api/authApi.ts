import client from './client';

export const authApi = {
  login: async (credentials: any) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },
  
  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  }
};
