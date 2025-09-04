import axios from 'axios';
import { User, CreateUser } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const createUser = async (userData: CreateUser): Promise<User> => {
  const response = await api.post<User>('/users', userData);
  return response.data;
};

export const fetchUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};
