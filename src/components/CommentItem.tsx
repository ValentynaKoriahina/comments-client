import React, { useState } from 'react';
import { Comment } from '../types';
import DOMPurify from 'dompurify';

interface CommentItemProps {
    comment: Comment;
    onReplyAdded: (parentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReplyAdded }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const sanitizedContent = DOMPurify.sanitize(comment.content);

    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                    <img src="https://via.placeholder.com/40" alt="avatar" className="rounded-circle mr-2" />
                    <div>
                        <h5 className="card-title m-0">{comment.username}</h5>
                        <h6 className="card-subtitle text-muted">
                            {new Date(comment.createdAt).toLocaleString()}
                        </h6>
                    </div>
                </div>
                <p className="card-text" dangerouslySetInnerHTML={{ __html: sanitizedContent }}></p>
                <button className="btn btn-link p-3" onClick={handleReplyClick}>Ответить</button>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4">
                        {comment.replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} onReplyAdded={onReplyAdded} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem;
