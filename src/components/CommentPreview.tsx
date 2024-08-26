import React from 'react';

interface CommentPreviewProps {
  content: string;
}

const CommentPreview: React.FC<CommentPreviewProps> = ({ content }) => {

  return (
    <div>
      <div className="mt-4">
        <h6>Предварительный просмотр (недопустимые теги будут удалены):</h6>
        <div
          className="border p-3"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default CommentPreview;
