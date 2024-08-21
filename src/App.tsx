import React from 'react';
import CommentTable from './components/CommentTable';

const App: React.FC = () => {
    return (
        <div className="container mt-5">
            <h1 className="mb-4">Комментарии</h1>
            <CommentTable />
        </div>
    );
};

export default App;
