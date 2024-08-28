import { useState, useEffect } from 'react';
import io from 'socket.io-client';

/**
 * Хук для получения списка пользователей, которые в данный момент онлайн.
 * Использует WebSocket-соединение через Socket.IO для получения информации с сервера.
 * @returns {string[]} Массив имен пользователей, которые онлайн.
 */
const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const serverUrl: string = import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:3000';

        const socket = io(serverUrl);

        // Обновить список онлайн пользователей
        socket.on('onlineUsers', (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return onlineUsers;
};

export default useOnlineUsers;
