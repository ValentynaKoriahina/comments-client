import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import CommentItem from './CommentItem';
import { Pagination } from 'react-bootstrap';
import useOnlineUsers from '../hooks/useOnlineUsers';
import { FaArrowAltCircleUp, FaArrowAltCircleDown } from 'react-icons/fa';


/**
 * @property {Comment[]} comments - Массив комментариев для отображения.
 * @property {() => void} onCommentAdded - Функция, вызываемая при добавлении нового комментария.
 */
interface CommentTableProps {
    comments: Comment[];
    onCommentAdded: () => void;
}

/**
 * Компонент для отображения таблицы комментариев с возможностью сортировки и пагинации.
 */
const CommentTable: React.FC<CommentTableProps> = ({ comments, onCommentAdded }) => {
    const [sortField, setSortField] = useState<'username' | 'email' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortedComments, setSortedComments] = useState<Comment[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 25;

    // Хук для получения данных о количестве пользователей онлайн
    const onlineUsers = useOnlineUsers();

    // Сортировка комментариев при изменении данных или параметров сортировки
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

    // Вычисление индексов для текущих комментариев на странице
    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = sortedComments.slice(indexOfFirstComment, indexOfLastComment);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div>
            <h5>Users online: {onlineUsers}</h5>

            <table className="table commentTable">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('username')}>
                            User
                            {sortField === 'username' && sortOrder === 'asc' && <FaArrowAltCircleUp className="ms-2"/>}
                            {sortField === 'username' && sortOrder === 'desc' && <FaArrowAltCircleDown className="ms-2"/>}
                        </th>
                        <th onClick={() => handleSort('email')}>
                            E-mail
                            {sortField === 'email' && sortOrder === 'asc' && <FaArrowAltCircleUp className="ms-2"/>}
                            {sortField === 'email' && sortOrder === 'desc' && <FaArrowAltCircleDown className="ms-2"/>}
                        </th>
                        <th onClick={() => handleSort('createdAt')}>
                            Date
                            {sortField === 'createdAt' && sortOrder === 'asc' && <FaArrowAltCircleUp className="ms-2"/>}
                            {sortField === 'createdAt' && sortOrder === 'desc' && <FaArrowAltCircleDown className="ms-2"/>}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {currentComments.map((comment) => (
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
            <Pagination>
                {Array.from({ length: Math.ceil(sortedComments.length / commentsPerPage) }, (_, i) => (
                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                        {i + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        </div>
    );
};

export default CommentTable;
