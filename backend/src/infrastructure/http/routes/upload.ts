import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurar que existe el directorio de uploads
const uploadsDir = path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        // Generar nombre único: timestamp-random.extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `report-${uniqueSuffix}${ext}`);
    },
});

// Filtro para solo aceptar imágenes
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
    }
};

// Configuración de Multer con límites
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Máximo 10MB
    },
});

const router = Router();

/**
 * POST /api/upload/image
 * Subir una imagen para un reporte
 */
router.post('/image', upload.single('image'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No se proporcionó ninguna imagen',
            });
            return;
        }

        // Construir URL de la imagen
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        console.log(`✅ Imagen subida: ${req.file.filename}`);
        console.log(`📁 Ruta: ${req.file.path}`);
        console.log(`🔗 URL: ${imageUrl}`);

        res.json({
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
});

/**
 * DELETE /api/upload/image/:filename
 * Eliminar una imagen
 */
router.delete('/image/:filename', (req: Request, res: Response) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({
                success: false,
                error: 'Imagen no encontrada',
            });
            return;
        }

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: 'Imagen eliminada exitosamente',
        });
    } catch (error: any) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al eliminar la imagen',
        });
    }
});

// Error handler para multer
router.use((error: any, _req: Request, res: Response, next: any) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                success: false,
                error: 'El archivo es demasiado grande. Máximo 10MB',
            });
            return;
        }
        res.status(400).json({
            success: false,
            error: error.message,
        });
        return;
    }
    next(error);
});

export default router;
