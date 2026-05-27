import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import Constants from 'expo-constants';

const SOCKET_URL = Constants.expoConfig?.extra?.API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;
    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [token]);

  return socket;
};