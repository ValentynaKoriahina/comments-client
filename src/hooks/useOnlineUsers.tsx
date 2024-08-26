import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const serverUrl: string = import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:3000';

        const socket = io(serverUrl);

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
