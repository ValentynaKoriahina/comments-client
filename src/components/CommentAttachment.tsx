import React, { useState, useEffect } from 'react';
import Lightbox from 'react-18-image-lightbox';
import 'react-18-image-lightbox/style.css';

interface CommentAttachmentProps {
    filename: string;
}

const CommentAttachment: React.FC<CommentAttachmentProps> = ({ filename }) => {
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [attachmentType, setAttachmentType] = useState('image');

    useEffect(() => {

        const ext = filename.split('.').pop().toLowerCase();

        if (ext === 'txt') {
            setAttachmentType('text');
        }

        console.log(attachmentType);

        let isMounted = true;
        const fileUrl = `http://localhost:3000/api/commentFile/${filename}`;

        const fetchData = async () => {
            try {
                const response = await fetch(fileUrl);
                console.log(response);

                if (response.ok) {
                    const contentType = response.headers.get('content-type');

                    if (contentType && contentType.startsWith('image/')) {
                        const imageBlob = await response.blob();
                        const fileUrl = URL.createObjectURL(imageBlob);
                        if (isMounted) {
                            setImage(fileUrl);
                        }
                    } else if (contentType && contentType.includes('text/')) {
                        const textData = await response.text();

                        if (isMounted) {
                            const blob = new Blob([textData], { type: 'text/plain' });
                            const fileUrl = URL.createObjectURL(blob);
                            setFile(fileUrl);
                        }
                    } else {
                        console.error('Неизвестный тип содержимого:', contentType);
                    }
                } else {
                    console.error('Ошибка при получении данных:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [filename]);

    const handleOpen = () => {
        if (image && !isOpen) {
            setIsOpen(true);
        }
    };

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

                    {isOpen && (
                        <Lightbox
                            mainSrc={image}
                            onCloseRequest={handleClose}
                            key={image}
                        />
                    )}
                </>
            ) : file ? (
                <a href={file} download={filename}>
                    Скачать файл
                </a>
            ) : null
            }
        </div>
    );
};

export default CommentAttachment;
