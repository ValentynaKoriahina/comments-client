import React, { useState, useEffect } from 'react';
import Lightbox from 'react-18-image-lightbox';
import 'react-18-image-lightbox/style.css';
import { getAttachment } from '../services/api'

interface CommentAttachmentProps {
    filename: string;
}

const CommentAttachment: React.FC<CommentAttachmentProps> = ({ filename }) => {
    const [image, setImage] = useState<string | null>(null);
    const [textFile, setTextFile] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {

            if (!filename) {
                return;
            }
            
            const ext = filename.split('.').pop()?.toLowerCase();

            const file = await getAttachment(filename);

            if (ext === 'txt') {
                setTextFile(file);
            } else {
                setImage(file);
            }
        };

        fetchData();
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
