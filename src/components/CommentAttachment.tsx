import React, { useState, useEffect } from 'react';
import Lightbox from 'react-18-image-lightbox';
import 'react-18-image-lightbox/style.css';
import { getAttachment } from '../services/api'

/**
 * @property {string} filename - Имя файла вложения, которое нужно загрузить и отобразить.
 */
interface CommentAttachmentProps {
    filename: string;
}

/**
 * Компонент для отображения вложения в комментарии.
 * Если вложение является изображением, оно отображается в уменьшенном виде, и его можно открыть в полноэкранном режиме.
 * Если вложение является текстовым файлом, предоставляется ссылка для его загрузки.
 */
const CommentAttachment: React.FC<CommentAttachmentProps> = ({ filename }) => {
    const [image, setImage] = useState<string | null>(null);
    const [textFile, setTextFile] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Загрузка и обработка вложения по имени файла
    useEffect(() => {
        const fetchData = async () => {

            if (!filename) {
                return;
            }
            
            const ext = filename.split('.').pop()?.toLowerCase();

            // Получаем содержимое файла с сервера
            const file = await getAttachment(filename);

            if (ext === 'txt') {
                setTextFile(file); // Содержимое текстового файла
            } else {
                setImage(file); // URL изображения
            }
        };

        fetchData();
    }, [filename]);

    // Открытие изображения в Lightbox
    const handleOpen = () => {
        if (image && !isOpen) {
            setIsOpen(true);
        }
    };

    // Закрытие Lightbox
    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div>
            {image ? (
                <>
                    <img
                        src={image}
                        alt="Comment Image"
                        onClick={handleOpen}
                        style={{ cursor: 'pointer', width: '100px', height: '100px' }}
                    />

                    {/* Полноэкранный режим для изображения */}
                    {isOpen && (
                        <Lightbox
                            mainSrc={image}
                            onCloseRequest={handleClose}
                            key={image}
                        />
                    )}
                </>
            ) : textFile ? (
                <a href={textFile} download={filename}>
                    Скачать файл
                </a>
            ) : null
            }
        </div>
    );
};

export default CommentAttachment;
