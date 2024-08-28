import React from 'react';

/**
 * @property {string} content - Содержимое комментария для предварительного просмотра.
 */
interface CommentPreviewProps {
  content: string;
}

/**
 * Компонент для отображения предварительного просмотра комментария.
 * Отображает содержимое комментария с применением HTML, при этом недопустимые теги удалены заранее.
 */
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
