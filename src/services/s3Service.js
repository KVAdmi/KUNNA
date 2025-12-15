// 🛠️ TEMP FIX: AWS SDK rompe en frontend
// TODO: Mover lógica de S3 al backend (Supabase Functions/Vercel Functions)

// import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// ✅ SOLUCIÓN TEMPORAL: Funciones mock hasta implementar en backend
const showMaintenanceMessage = () => {
  return Promise.reject(new Error('Función de carga de archivos en mantenimiento. Pronto estará disponible.'));
};

/**
 * Sube un archivo a S3 (TEMPORALMENTE DESHABILITADO)
 * @param {File} file - Archivo a subir
 * @param {string} folder - Carpeta en S3 (opcional)
 * @returns {Promise<string>} URL del archivo subido
 */
export const uploadFile = async (file, folder = '') => {
  return showMaintenanceMessage();
};

/**
 * Sube una imagen a S3 (TEMPORALMENTE DESHABILITADO)
 * @param {File} imageFile - Archivo de imagen
 * @returns {Promise<string>} URL de la imagen
 */
export const uploadImage = async (imageFile) => {
  return showMaintenanceMessage();
};

/**
 * Sube un PDF a S3 (TEMPORALMENTE DESHABILITADO)
 * @param {File} pdfFile - Archivo PDF
 * @returns {Promise<string>} URL del PDF
 */
export const uploadPDF = async (pdfFile) => {
  return showMaintenanceMessage();
};
