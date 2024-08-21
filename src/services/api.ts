import axios from 'axios';
import { Comment } from '../types';

const api: string = 'http://localhost:3000/api/'

const fakeComments: Comment[] = [
    {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        content: 'Это первый тестовый комментарий',
        createdAt: new Date().toISOString(),
        replies: [
            {
                id: 2,
                username: 'user2',
                email: 'user2@example.com',
                content: 'Это ответ на первый комментарий',
                createdAt: new Date().toISOString(),
                replies: [
                    {
                        id: 3,
                        username: 'user3',
                        email: 'user3@example.com',
                        content: 'Это ответ на второй комментарий',
                        createdAt: new Date().toISOString(),
                        replies: [],
                    }
                ],
            },
            {
                id: 4,
                username: 'user4',
                email: 'user4@example.com',
                content: 'Это еще один ответ на первый комментарий',
                createdAt: new Date().toISOString(),
                replies: [],
            }
        ],
    },
    {
        id: 5,
        username: 'user5',
        email: 'user5@example.com',
        content: 'Это второй заглавный комментарий',
        createdAt: new Date().toISOString(),
        replies: [],
    },
    {
        id: 6,
        username: 'user6',
        email: 'user6@example.com',
        content: 'Это третий заглавный комментарий',
        createdAt: new Date().toISOString(),
        replies: [
            {
                id: 7,
                username: 'user7',
                email: 'user7@example.com',
                content: 'Это ответ на третий комментарий',
                createdAt: new Date().toISOString(),
                replies: [],
            }
        ],
    }
];


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