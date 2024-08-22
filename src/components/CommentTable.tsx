import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import CommentItem from './CommentItem';

interface CommentTableProps {
    comments: Comment[];
    onCommentAdded: () => void;
}

const CommentTable: React.FC<CommentTableProps> = ({ comments, onCommentAdded }) => {
    const [sortField, setSortField] = useState<'username' | 'email' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortedComments, setSortedComments] = useState<Comment[]>([]);


    useEffect(() => {
        const sorted = [...comments].sort((a, b) => {
            let comparison = 0;
            if (a[sortField] > b[sortField]) comparison = 1;
            if (a[sortField] < b[sortField]) comparison = -1;
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        setSortedComments(sorted);
    }, [comments, sortField, sortOrder]);

    const handleSort = (field: 'username' | 'email' | 'createdAt') => {
        const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newSortOrder);
    };

    return (
        <table className="table">
            <thead>
                <tr>
                    <th onClick={() => handleSort('username')}>User Name</th>
                    <th onClick={() => handleSort('email')}>E-mail</th>
                    <th onClick={() => handleSort('createdAt')}>Дата добавления</th>
                </tr>
            </thead>
            <tbody>
                {sortedComments.map((comment) => (
                    <React.Fragment key={comment.id}>
                        <tr className="response-row">
                            <td colSpan={3}>
                                <CommentItem key={comment.id} comment={comment} onReplyAdded={onCommentAdded} />
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default CommentTable;
