import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBold, FaItalic, FaCode, FaLink, FaEye } from 'react-icons/fa';
import CommentPreview from './CommentPreview';
import { addComment } from '../services/api';
import { getCaptcha } from '../services/api';
import { verifyCaptcha } from '../services/api';
import { validateComment } from '../services/api';
import ImageProcessor from '../utils/ImageProcessor';


/**
 * @property {() => void} onCommentAdded - Функция, вызываемая после добавления нового комментария.
 * @property {number} [parentId] - ID родительского комментария, если комментарий является ответом.
 */
interface CommentFormProps {
    onCommentAdded: () => void;
    parentId?: number;
}

/**
 * Компонент для отображения формы добавления комментария с поддержкой форматирования, предварительного просмотра и проверки капчи.
 */
const CommentForm: React.FC<CommentFormProps> = ({ onCommentAdded, parentId }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [homepage, setHomepage] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaSvg, setCaptchaSvg] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const alertRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Загружаем капчу при первом рендере компонента
    useEffect(() => {
        loadCaptcha();
    }, []);

    // Прокручиваем к сообщению об ошибке, если оно появилось
    useEffect(() => {
        if (alertMessage && alertRef.current) {
            alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [alertMessage]);

    // Функция для загрузки новой капчи
    const loadCaptcha = async () => {
        setCaptchaSvg(await getCaptcha());
    };

    // Вставка HTML-тегов для форматирования текста
    const insertTag = (tag: string, attribute: string = '') => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.slice(start, end);
        const openTag = `<${tag}${attribute}>`;
        const closeTag = `</${tag}>`;
        const newText = openTag + selectedText + closeTag;

        const newContent = content.slice(0, start) + newText + content.slice(end);
        setContent(newContent);
    };

    // Проверка на корректное закрытие HTML-тегов в комментарии
    const validateHTML = (input: string): boolean => {
        const tagStack: string[] = [];
        const tagPattern = /<\/?([a-z]+)[^>]*>/gi;
        let match: RegExpExecArray | null;

        while ((match = tagPattern.exec(input)) !== null) {
            const [fullMatch, tagName] = match;
            if (fullMatch.startsWith('</')) {
                const lastTag = tagStack.pop();
                if (lastTag !== tagName) {
                    return false;
                }
            } else if (!fullMatch.endsWith('/>')) {
                tagStack.push(tagName);
            }
        }

        return tagStack.length === 0;
    };

    // Обработка отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlertMessage('');

        // Валидация данных. Исключение означает провал валидации. 
        // Текст ошибки используется в уведомлениях и может поступать с сервера.
        try {
            await verifyCaptcha(captchaInput);
            await validateComment(username, email, content, parentId, homepage);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setAlertMessage(error.message);
            } else {
                setAlertMessage('Произошла неизвестная ошибка. Попробуйте еще раз позже');
            }
            setCaptchaInput('');
            await loadCaptcha();
            return;
        }

        // Обработка загрузки файла (сжатие изображения, проверка размера файла)
        if (file) {
            if (file.type.startsWith('image/')) {
                const imageProcessor = new ImageProcessor(320, 240);
                try {
                    const resizedBlob = await imageProcessor.resizeImage(file);
                    if (resizedBlob) {
                        const resizedFile = new File([resizedBlob], file.name, { type: file.type });
                        setFile(resizedFile);
                    }
                } catch (error) {
                    setAlertMessage('Произошла ошибка. Попробуйте еще раз позже.');
                    console.error('Ошибка обработки изображения:', error);
                }
            } else if (file.type.startsWith('text/')) {
                if (file.size > 102400) {
                    setAlertMessage('Размер файла превышает допустимые 100 кб.');
                    return;
                }
            }
        }

        // Проверка на корректность HTML в комментарии
        if (!validateHTML(content)) {
            setAlertMessage('Комментарий содержит не закрытые HTML теги.');
            return;
        }

        // Очистка контента от нежелательных HTML-тегов
        const sanitizedContent = sanitizeContent();

        // Добавление комментария через API
        await addComment(username, email, sanitizedContent, parentId, homepage, file);
        setUsername('');
        setEmail('');
        setHomepage('');
        setContent('');
        setFile(null);
        setPreview('');
        setCaptchaInput('');
        loadCaptcha();
        onCommentAdded();

        // Сброс значения input для файла
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Показ предварительного просмотра комментария
    const showPreview = async () => {
        try {
            
            // Валидация данных. Исключение означает провал валидации. 
            // Текст ошибки используется в уведомлениях и может поступать с сервера.
            await validateComment(username, email, content, parentId, homepage);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setAlertMessage(error.message);
            } else {
                setAlertMessage('Произошла неизвестная ошибка. Попробуйте еще раз позже');
            }
        }

        setPreview(sanitizeContent());
    };

    // Функция для очистки контента от небезопасных HTML-тегов
    const sanitizeContent = () => {
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['a', 'code', 'i', 'strong'],
            ALLOWED_ATTR: ['href', 'title']
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            {alertMessage && (
                <div ref={alertRef} className="alert alert-info mt-3">
                    {alertMessage}
                </div>
            )}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <input
                    type="email"
                    className="form-control"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <input
                    type="url"
                    className="form-control"
                    placeholder="Домашняя страница (необязательно)"
                    value={homepage}
                    onChange={(e) => setHomepage(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <div className="p-2 mb-2 border rounded">
                    <div className="btn-toolbar mt-2 mb-2" role="toolbar">
                        <div className="btn-group mr-2" role="group">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => insertTag('i')}
                                title="Italic"
                            >
                                <FaItalic />
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => insertTag('strong')}
                                title="Bold"
                            >
                                <FaBold />
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => insertTag('code')}
                                title="Code"
                            >
                                <FaCode />
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => insertTag('a', ' href="#" title="yourtitle"')}
                                title="Link"
                            >
                                <FaLink />
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => showPreview()}
                                title="Preview"
                            >
                                <FaEye />
                            </button>
                        </div>
                    </div>

                    <textarea
                        className="form-control"
                        placeholder="Комментарий"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    {preview && (
                        <CommentPreview content={preview} />
                    )}
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="formFile" className="form-label">Допустимые типы файлов: JPG, GIF, PNG, TXT</label>
                <input
                    className="form-control"
                    type="file"
                    id="formFile"
                    ref={fileInputRef}
                    accept=".jpg, .jpeg, .png, .gif, .txt"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                        }
                    }}
                />
            </div>
            <div className="d-flex align-items-center mb-5">
                <div
                    className="captcha-svg"
                    dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
                <input
                    type="text"
                    className="form-control ml-2"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Введите символы с картинки"
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary">
                Добавить комментарий
            </button>
        </form>
    );
};

export default CommentForm;
