import React, { useState } from 'react';

import { Comment } from '../types';
import CommentForm from './CommentForm';
import CommentAttachment from './CommentAttachment';

/**
 * @property {Comment} comment - Объект комментария, содержащий все его данные.
 * @property {() => void} onReplyAdded - Функция, вызываемая после добавления ответа на комментарий.
 */
interface CommentItemProps {
    comment: Comment;
    onReplyAdded: () => void;
}

/**
 * Компонент для отображения отдельного комментария, его вложений и формы ответа.
 */
const CommentItem: React.FC<CommentItemProps> = ({ comment, onReplyAdded }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const content = comment.content;
    const attachment = comment.filename;

    // Переключение видимости формы ответа
    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
    };

    // Обработка добавления ответа
    const handleReplyAdded = () => {
        setShowReplyForm(false);
        onReplyAdded();
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                    {/* Аватар пользователя */}
                    <img src="https://via.placeholder.com/40" alt="avatar" className="rounded-circle me-2" />
                    <div>
                        <h5 className="card-title m-0">{comment.username}</h5>
                        <h6 className="card-subtitle text-muted">
                            {/* Отображение даты создания комментария */}
                            {new Date(comment.createdAt).toLocaleString()}
                        </h6>
                    </div>
                </div>
                {/* Контент комментария, с применением небезопасного HTML (в обработке уже был использован DOMPurify) */}
                <p className="card-text w-100 break-word-text" dangerouslySetInnerHTML={{ __html: content }}></p>
                {attachment && (<CommentAttachment filename={attachment} />)}
                <button className="btn btn-link p-3" onClick={handleReplyClick}>Ответить</button>
                {showReplyForm && <CommentForm onCommentAdded={handleReplyAdded} parentId={comment.id} />}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4">
                        {comment.replies
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((reply) => (
                                <CommentItem key={reply.id} comment={reply} onReplyAdded={onReplyAdded} />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
