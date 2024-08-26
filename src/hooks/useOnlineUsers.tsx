import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const socket = io('http://localhost:3000');

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
