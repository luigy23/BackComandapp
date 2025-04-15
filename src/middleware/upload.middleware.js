import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'src', 'uploads', 'products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configuración de multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Función para optimizar y guardar la imagen
export const optimizeImage = async (file) => {
    try {
        const originalPath = file.path;
        const optimizedPath = originalPath.replace(/\.[^/.]+$/, '_optimized.jpg');
        
        await sharp(originalPath)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(optimizedPath);

        // Eliminar la imagen original
        fs.unlinkSync(originalPath);

        // Retornar la ruta relativa desde src/uploads
        return path.relative(path.join(process.cwd(), 'src', 'uploads'), optimizedPath);
    } catch (error) {
        console.error('Error al optimizar la imagen:', error);
        throw error;
    }
};

// Función auxiliar para detectar transparencia en imágenes PNG
async function hasTransparency(filePath) {
    try {
        const metadata = await sharp(filePath).metadata();
        return metadata.hasAlpha || false;
    } catch (error) {
        console.error('Error al verificar transparencia:', error);
        return false;
    }
}

// Función para eliminar una imagen
export const deleteImage = (imagePath) => {
    try {
        const fullPath = path.join(process.cwd(), 'src', 'uploads', imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        throw error;
    }
}; 