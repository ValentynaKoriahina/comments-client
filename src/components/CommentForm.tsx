import React, { useRef, useState } from 'react';
import { addComment } from '../services/api';
import { validateComment } from '../services/api';

import ImageProcessor from '../utils/ImageProcessor';
import DOMPurify from 'dompurify';
import ReCAPTCHA from 'react-google-recaptcha';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaBold, FaItalic, FaCode, FaLink, FaEye } from 'react-icons/fa';
import CommentPreview from './CommentPreview';

interface CommentFormProps {
    onCommentAdded: () => void;
    parentId?: number;
}

const CommentForm: React.FC<CommentFormProps> = ({ onCommentAdded, parentId }) => {
    const recaptcha = useRef<ReCAPTCHA | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('fjfjf@kdkd.com');
    const [homepage, setHomepage] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState('');


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
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // AJAX пример валидации данных на стороне сервера
        const validData: boolean = await validateComment(username, email, content, parentId, homepage);

        if (!validData) {
            return;
        }

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
                    console.error('Ошибка обработки изображения:', error);
                }
            } else if (file.type.startsWith('text/')) {
                if (file.size > 102400) {
                    alert('Размер файла превышает допустимые 100 кб.');
                }
            }
        }


        if (!validateHTML(content)) {
            alert('Комментарий содержит не закрытые HTML теги.');
            return;
        }

        const sanitizedContent = sanitizeContent();

        await addComment(username, email, sanitizedContent, parentId, homepage, file);
        setUsername('');
        setEmail('');
        setHomepage('');
        setContent('');
        setFile(null);
        setPreview('');
        recaptcha.current?.reset();
        onCommentAdded();
    };


    const showPreview = async () => {
        // AJAX пример валидации данных на стороне сервера
        const validData: boolean = await validateComment(username, email, content, parentId, homepage);
        alert(validData)

        if (!validData) {
            return;
        }

        setPreview(sanitizeContent());
    }

    const sanitizeContent = () => {
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['a', 'code', 'i', 'strong'],
            ALLOWED_ATTR: ['href', 'title']
        });
    }

    return (
        <form onSubmit={handleSubmit} className="mb-4">
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
                <div className="p-2 mb-2 border rounded" >
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
                                onClick={() => insertTag('a', ' href="yourlink" title="yourtitle"')}
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
                    accept=".jpg, .jpeg, .png, .gif, .txt"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                        }
                    }}
                />
            </div>

            <button type="submit" className="btn btn-primary">
                Добавить комментарий
            </button>
        </form>
    );
};

export default CommentForm;
