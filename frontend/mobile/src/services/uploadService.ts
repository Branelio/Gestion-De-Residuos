import httpClient from './httpClient';

// Respuesta del servidor al subir imagen
interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
        url: string;
    };
}

/**
 * Servicio para subir imágenes al servidor
 */
class UploadService {
    /**
     * Sube una imagen al servidor
     * @param imageUri URI local de la imagen (file://)
     * @param onProgress Callback opcional para progreso (0-100)
     * @returns URL de la imagen en el servidor
     */
    async uploadImage(
        imageUri: string,
        onProgress?: (progress: number) => void
    ): Promise<string> {
        try {
            console.log('📤 Iniciando upload de imagen:', imageUri);

            // Crear FormData
            const formData = new FormData();

            // Obtener el nombre del archivo y tipo
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            // Agregar la imagen al FormData
            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any);

            // Simular progreso inicial
            onProgress?.(10);

            // Hacer la petición usando fetch directamente (para FormData multipart)
            const baseUrl = httpClient.getBaseUrl() || 'http://10.52.139.50:3000';

            console.log('📡 Subiendo a:', `${baseUrl}/api/upload/image`);

            onProgress?.(30);

            const response = await fetch(`${baseUrl}/api/upload/image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            onProgress?.(80);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al subir la imagen');
            }

            const result: UploadResponse = await response.json();

            onProgress?.(100);

            console.log('✅ Imagen subida exitosamente:', result.data.url);

            return result.data.url;
        } catch (error: any) {
            console.error('❌ Error uploading image:', error);
            throw new Error(
                error.message || 'Error al subir la imagen. Verifica tu conexión.'
            );
        }
    }

    /**
     * Elimina una imagen del servidor
     * @param filename Nombre del archivo a eliminar
     */
    async deleteImage(filename: string): Promise<void> {
        try {
            console.log('🗑️ Eliminando imagen:', filename);

            await httpClient.delete(`/api/upload/image/${filename}`);

            console.log('✅ Imagen eliminada');
        } catch (error: any) {
            console.error('❌ Error deleting image:', error);
            throw new Error(
                error.message || 'Error al eliminar la imagen'
            );
        }
    }
}

export const uploadService = new UploadService();
export default uploadService;
