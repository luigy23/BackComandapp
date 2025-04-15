import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración centralizada
export const CONFIG = {
  DIRECTORIO_IMAGENES: path.join(__dirname, '../../public/images/products'),
  EXTENSIONES_PERMITIDAS: {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  },
  URL_BASE: process.env.API_URL || 'http://localhost:3001'
};

// Función para optimizar y guardar imagen
export const procesarImagen = async (file, productId) => {
  try {
    // Asegurar que el directorio existe
    await fs.mkdir(CONFIG.DIRECTORIO_IMAGENES, { recursive: true });

    const extension = CONFIG.EXTENSIONES_PERMITIDAS[file.mimetype] || '.jpg';
    const nombreArchivo = `${productId}-${Date.now()}${extension}`;
    const rutaCompleta = path.join(CONFIG.DIRECTORIO_IMAGENES, nombreArchivo);
    
    // Procesar y guardar la imagen
    await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat(extension.replace('.', ''))
      .toFile(rutaCompleta);
    
    // Retornar la URL completa de la imagen
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    return `${baseUrl}/images/products/${nombreArchivo}`;
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    throw new Error('Error al procesar la imagen');
  }
};

// Función para eliminar imagen
export const eliminarImagen = async (productId) => {
  try {
    // Verificar si el directorio existe
    try {
      await fs.access(CONFIG.DIRECTORIO_IMAGENES);
    } catch (error) {
      // Si el directorio no existe, no hay imágenes que eliminar
      return;
    }

    const archivos = await fs.readdir(CONFIG.DIRECTORIO_IMAGENES);
    const imagenesAEliminar = archivos.filter(archivo => 
      archivo.startsWith(`${productId}-`)
    );

    if (imagenesAEliminar.length === 0) {
      return; // No hay imágenes para eliminar
    }

    const errores = [];
    for (const imagen of imagenesAEliminar) {
      try {
        const rutaImagen = path.join(CONFIG.DIRECTORIO_IMAGENES, imagen);
        await fs.unlink(rutaImagen);
      } catch (error) {
        errores.push(`Error al eliminar ${imagen}: ${error.message}`);
      }
    }

    if (errores.length > 0) {
      console.error('Errores al eliminar imágenes:', errores);
      throw new Error('Error al eliminar algunas imágenes');
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    throw new Error('Error al eliminar la imagen');
  }
}; 