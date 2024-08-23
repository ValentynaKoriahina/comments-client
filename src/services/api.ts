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
    parentId?: number
): Promise<Comment> => {
    try {
        const response = await axios.post<Comment>('{api}comment', {
            username,
            email,
            content,
            parentId,
        });

        return response.data;
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        throw error;
    }
};