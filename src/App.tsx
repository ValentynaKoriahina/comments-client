import React, { useState, useEffect } from 'react';
import CommentTable from './components/CommentTable';
import CommentForm from './components/CommentForm';
import { getComments } from './services/api'; 
import { Comment } from './types';

const App: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        const data = await getComments();

        setComments(data);
    };


    return (
        <div className="container mt-5">
            <h1 className="mb-4">Комментарии</h1>
            <CommentForm onCommentAdded={fetchComments} />
            <CommentTable comments={comments} onCommentAdded={fetchComments} />
        </div>
    );
};

export default App;
