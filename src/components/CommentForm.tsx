import React, { useRef, useState } from 'react';
import { addComment } from '../services/api';
import ImageProcessor from '../utils/ImageProcessor'
import ReCAPTCHA from 'react-google-recaptcha';
import DOMPurify from 'dompurify';



interface CommentFormProps {
    onCommentAdded: () => void;
    parentId?: number;
}

const CommentForm: React.FC<CommentFormProps> = ({ onCommentAdded, parentId }) => {
    const recaptcha = useRef<ReCAPTCHA | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('info@kfkf.com');
    const [homepage, setHomepage] = useState('');
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const validateHTML = (input: string) => {
        // Регулярное выражение для проверки разрешенных HTML тегов
        const allowedTags = /<\/?(a|code|i|strong)(\s+href="[^"]*"\s+title="[^"]*")?\s*>/gi;

        // Проверка на наличие запрещенных тегов
        if (input.replace(allowedTags, '').match(/<[^>]+>/)) {
            return false;
        }

        // Проверка на правильное закрытие тегов
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
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (file && file.type.startsWith('image/')) {
            const imageProcessor = new ImageProcessor(320, 240);
            try {
                const resizedBlob = await imageProcessor.resizeImage(file);
                if (resizedBlob) {
                    const resizedFile = new File([resizedBlob], file.name, { type: file.type }); // CHANGES!!
                    setFile(resizedFile);
                }
            } catch (error) {
                console.error('Ошибка обработки изображения:', error);
            }
        }

        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (homepage && !urlRegex.test(homepage)) {
            alert('Введите корректный URL для домашней страницы.');
            return;
        }

        if (!validateHTML(content)) {
            alert('Комментарий содержит недопустимые HTML теги.');
            return;
        }

        const sanitizedContent = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['a', 'code', 'i', 'strong'],
            ALLOWED_ATTR: ['href', 'title']
        });

        await addComment(username, email, sanitizedContent, parentId, file);
        recaptcha.current?.reset();
        // onCommentAdded();
    };

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
                <textarea
                    className="form-control"
                    placeholder="Комментарий"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="formFile" className="form-label">Допустивые типы файлов: JPG, GIF, PNG, TXT</label>
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

            {/* <div className="mb-3">
                <ReCAPTCHA
                    ref={recaptcha}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
                />
            </div> */}
            <button type="submit" className="btn btn-primary">
                Добавить комментарий
            </button>
        </form>
    );
};

export default CommentForm;
