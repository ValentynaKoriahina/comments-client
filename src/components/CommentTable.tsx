import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import CommentItem from './CommentItem';
import { getComments } from '../services/api'

const CommentTable: React.FC = () => {
    const [sortField, setSortField] = useState<'username' | 'email' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [sortedComments, setSortedComments] = useState<Comment[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        fetchComments();
    }, []);

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

    const handleReplyAdded = () => {
        fetchComments();
    };

    const fetchComments = async () => {
        const data = await getComments();

        setComments(data);
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
                                <CommentItem key={comment.id} comment={comment} onReplyAdded={handleReplyAdded} />
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default CommentTable;
