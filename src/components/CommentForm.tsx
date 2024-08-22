import React, { useRef, useState } from 'react';
import { addComment } from '../services/api';
import ReCAPTCHA from 'react-google-recaptcha';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(username)) {
            alert('Имя пользователя может содержать только латинские буквы и цифры.');
            return;
        }

        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (homepage && !urlRegex.test(homepage)) {
            alert('Введите корректный URL для домашней страницы.');
            return;
        }

        const captchaValue = recaptcha.current?.getValue();
        if (!captchaValue) {
            alert('Пожалуйста, подтвердите, что Вы не робот.');
            return;
        }

        await addComment(username, email, content, parentId, homepage);
        setUsername('');
        setEmail('');
        setHomepage('');
        setContent('');
        recaptcha.current?.reset();
        onCommentAdded();
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
                <ReCAPTCHA
                    ref={recaptcha}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''}
                />
            </div>
            <button type="submit" className="btn btn-primary">
                Добавить комментарий
            </button>
        </form>
    );
};

export default CommentForm;
