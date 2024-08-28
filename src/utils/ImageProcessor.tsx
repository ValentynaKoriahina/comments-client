class ImageProcessor {
    private maxWidth: number;
    private maxHeight: number;

    /**
     * Конструктор класса ImageProcessor.
     * @param {number} maxWidth - Максимальная ширина изображения после изменения размера.
     * @param {number} maxHeight - Максимальная высота изображения после изменения размера.
     */
    constructor(maxWidth: number, maxHeight: number) {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    /**
     * Изменяет размер изображения с учетом максимальных ширины и высоты, заданных при создании экземпляра класса.
     * @param {File} file - Файл изображения, который необходимо изменить.
     * @returns {Promise<Blob | null>} - Возвращает Promise с новым Blob, содержащим измененное изображение, или null в случае ошибки.
     */
    public resizeImage(file: File): Promise<Blob | null> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Проверка на наличие 2D контекста
            if (!ctx) {
                reject('Не удалось получить контекст 2D');
                return;
            }

            // Обработка события загрузки изображения
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Определение новых размеров с учетом пропорций
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

                // Установка размеров canvas и отрисовка изображения
                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                // Преобразование canvas в Blob
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

            // Чтение файла как Data URL
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
