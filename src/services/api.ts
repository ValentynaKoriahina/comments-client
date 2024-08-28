import axios from 'axios';
import { Comment } from '../types';

const serverUrl: string = import.meta.env.VITE_APP_SERVER_URL || 'http://localhost:3000';
const api: string = serverUrl + '/api/';

/**
 * Получение списка комментариев с сервера.
 * @returns {Promise<Comment[]>} - Массив комментариев.
 */
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

/**
 * Добавление нового комментария на сервер.
 * @param {string} username - Имя пользователя.
 * @param {string} email - Электронная почта пользователя.
 * @param {string} content - Текст комментария.
 * @param {number} [parentId] - ID родительского комментария (если есть).
 * @param {string} [homepage] - Домашняя страница пользователя (если есть).
 * @param {File | null} [file] - Вложенный файл (если есть).
 * @returns {Promise<Comment>} - Добавленный комментарий.
 */
export const addComment = async (
    username: string,
    email: string,
    content: string,
    parentId?: number,
    homepage?: string,
    file?: File | null,
): Promise<Comment> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('content', content);

    if (parentId !== undefined) {
        formData.append('parentId', parentId.toString());
    }

    if (homepage !== undefined) {
        formData.append('homepage', homepage.toString());
    }

    if (file) {
        formData.append('file', file);
    }

    // formData.forEach((value, key) => {
    //     console.log(`${key}: ${value}`);
    // });

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

/**
 * Получение вложения (изображения или текстового файла) с сервера по имени файла.
 * @param {string} filename - Имя файла.
 * @returns {Promise<string | null>} - URL для изображения или текстовый файл в виде строки.
 */
export const getAttachment = async (filename: string): Promise<string | null> => {
    try {
        const response = await fetch(`${api}commentFile/${filename}`);
        console.log(response);

        if (response.ok) {
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.startsWith('image/')) {
                const imageBlob = await response.blob();
                if (imageBlob) {
                    const imageUrl = URL.createObjectURL(imageBlob);
                    return imageUrl;
                }
            } else if (contentType && contentType.includes('text/')) {
                const textBlob = await response.blob();
                console.log('textBlob', textBlob);

                if (textBlob) {
                    const textData = await textBlob.text();
                    console.log('textData', textData);

                    if (textData) {
                        const blob = new Blob([textData], { type: 'text/plain' });
                        return URL.createObjectURL(blob);
                    }
                }
            } else {
                console.error('Неизвестный тип содержимого:', contentType);
            }
        } else {
            console.error('Ошибка при получении данных:', response.statusText);
        }
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }

    return null;
};

/**
 * Валидация комментария на сервере.
 * @param {string} username - Имя пользователя.
 * @param {string} email - Электронная почта пользователя.
 * @param {string} content - Текст комментария.
 * @param {number} [parentId] - ID родительского комментария (если есть).
 * @param {string} [homepage] - Домашняя страница пользователя (если есть).
 * @returns {Promise<boolean>} - Возвращает true, если комментарий прошел валидацию, иначе false.
 */
export const validateComment = async (
    username: string,
    email: string,
    content: string,
    parentId?: number,
    homepage?: string,
): Promise<boolean> => {
    try {
        await axios.post(`${api}validate/comment`, {
            username,
            email,
            content,
            parentId,
            homepage,
        });

        return true;
    } catch (error: unknown) {
        let errorMessage = 'Неизвестная ошибка';
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data.message;
            // Родительский компонент интерпретирует перехват исключения как нуспешную валидацию. 
            // Текст ошибки используется в уведомлениях на клиенте.
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error('Произошла ошибка:', error);
        return false;
    }
};

/**
 * Получение CAPTCHA с сервера.
 * @returns {Promise<string>} - Строка с SVG-изображением CAPTCHA.
 */
export const getCaptcha = async (): Promise<string> => {
    try {
        const response = await axios.get(`${api}/captcha`, {
            responseType: 'text',
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при загрузке CAPTCHA:', error);
        return('');
    }
};

/**
 * Проверка введенной CAPTCHA на сервере.
 * @param {string} captchaInput - Введенное пользователем значение CAPTCHA.
 * @returns {Promise<void | string>} - Возвращает ошибку, если CAPTCHA введена неверно.
 */
export const verifyCaptcha = async (captchaInput: string): Promise<void | string> => {
    try {
        await axios.post(`${api}/verifyCaptcha`, 
            { captcha: captchaInput }, 
            { withCredentials: true }
        );
    } catch (error: unknown) {
        // Родительский компонент интерпретирует перехват исключения как нуспешную валидацию. 
        // Текст ошибки используется в уведомлениях на клиенте.
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 400 && error.response.data.verified === false) {
                throw new Error(error.response.data.message);
            }
            console.error('Ошибка при проверке CAPTCHA:', error);
            throw new Error('Ошибка при проверке CAPTCHA. Попробуйте позже.');
        } else {
            console.error('Произошла ошибка:', error);
        }
    }
};
