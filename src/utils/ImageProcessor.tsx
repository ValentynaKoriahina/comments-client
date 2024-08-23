class ImageProcessor {
    private maxWidth: number;
    private maxHeight: number;

    constructor(maxWidth: number, maxHeight: number) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    public resizeImage(file: File): Promise<Blob | null> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject('Не удалось получить контекст 2D');
                return;
            }

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > this.maxWidth) {
                        height = Math.round((height *= this.maxWidth / width));
                        width = this.maxWidth;
                    }
                } else {
                    if (height > this.maxHeight) {
                        width = Math.round((width *= this.maxHeight / height));
                        height = this.maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject('Не удалось создать Blob из изображения');
                    }
                }, file.type);
            };

            img.onerror = () => {
                reject('Ошибка при загрузке изображения');
            };

            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = () => {
                reject('Ошибка при чтении файла');
            };
            reader.readAsDataURL(file);
        });
    }
}

export default ImageProcessor;
