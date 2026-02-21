import { Request, Response } from 'express';
import path from 'path';

/**
 * Controller para manejo de uploads de archivos
 */
export class UploadController {
  /**
   * POST /api/upload
   * Subir una imagen
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      // Verificar que se subió un archivo
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No se proporcionó ninguna imagen',
        });
        return;
      }

      // Construir URL pública de la imagen
      const protocol = req.protocol;
      const host = req.get('host');
      const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: imageUrl,
        },
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al subir la imagen',
      });
    }
  }

  /**
   * POST /api/upload/base64
   * Subir una imagen desde base64
   */
  async uploadBase64(req: Request, res: Response): Promise<void> {
    try {
      const { image, filename } = req.body;

      // Verificar que se proporcionó la imagen
      if (!image) {
        res.status(400).json({
          success: false,
          error: 'No se proporcionó ninguna imagen en formato base64',
        });
        return;
      }

      // Extraer el tipo de imagen y los datos base64
      const matches = image.match(/^data:image\/([a-z]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({
          success: false,
          error: 'Formato de imagen base64 inválido',
        });
        return;
      }

      const imageType = matches[1];
      const base64Data = matches[2];

      // Validar tipo de imagen
      const allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
      if (!allowedTypes.includes(imageType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de imagen no permitido. Solo se aceptan: JPEG, PNG, GIF, WEBP',
        });
        return;
      }

      // Generar nombre de archivo único
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const uploadFilename = filename
        ? `${path.parse(filename).name}-${uniqueSuffix}.${imageType}`
        : `image-${uniqueSuffix}.${imageType}`;

      // Guardar la imagen
      const fs = require('fs');
      const uploadDir = path.join(__dirname, '../../../../uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uploadFilename);
      fs.writeFileSync(filePath, base64Data, 'base64');

      // Obtener tamaño del archivo
      const stats = fs.statSync(filePath);

      // Construir URL pública de la imagen
      const protocol = req.protocol;
      const host = req.get('host');
      const imageUrl = `${protocol}://${host}/uploads/${uploadFilename}`;

      res.status(200).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          filename: uploadFilename,
          originalName: filename || uploadFilename,
          size: stats.size,
          mimetype: `image/${imageType}`,
          url: imageUrl,
        },
      });
    } catch (error: any) {
      console.error('Error uploading base64 image:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al subir la imagen',
      });
    }
  }
}
