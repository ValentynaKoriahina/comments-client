import axios from 'axios';
import { Comment } from '../types';

const api: string = 'http://localhost:3000/api/'

export const getComments = async (): Promise<Comment[]> => {
    try {
        const response = await axios.get(`${api}comments`);
        
        const comments = response.data.comments as Comment[];

        console.log(comments);
        return comments;
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        throw error;
    }
};

export const addComment = async (
    username: string,
    email: string,
    content: string,
    parentId?: number,
    file?: File,
): Promise<Comment> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('content', content);
    console.log(username)

    if (parentId !== undefined) {
        formData.append('parentId', parentId.toString());
    }
    
    if (file) {
        formData.append('file', file);
    }

    formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });


    try {
        const response = await axios.post<Comment>(`${api}comment`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        throw error;
    }
};

