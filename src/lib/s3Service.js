import AWS from 'aws-sdk';

// Configuración de AWS S3
const s3Config = {
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION
};

const bucketName = import.meta.env.VITE_AWS_S3_BUCKET_NAME;

// Inicializar S3
const s3 = new AWS.S3(s3Config);

/**
 * Valida si el archivo es una imagen permitida
 * @param {File} file - Archivo a validar
 * @returns {boolean} - True si es una imagen válida
 */
export const isValidImage = (file) => {
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  return allowedImageTypes.includes(file.type);
};

/**
 * Valida si el archivo es un PDF
 * @param {File} file - Archivo a validar
 * @returns {boolean} - True si es un PDF
 */
export const isPDF = (file) => {
  return file.type === 'application/pdf';
};

/**
 * Genera un nombre único para el archivo
 * @param {string} originalName - Nombre original del archivo
 * @returns {string} - Nombre único del archivo
 */
export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

/**
 * Sube un archivo a S3
 * @param {File} file - Archivo a subir
 * @param {string} folder - Carpeta donde guardar el archivo (ej: 'images', 'documents')
 * @param {Function} onProgress - Callback para el progreso de subida (opcional)
 * @returns {Promise<Object>} - Resultado de la subida con URL y metadata
 */
export const uploadFileToS3 = async (file, folder = 'uploads', onProgress = null) => {
  try {
    // Validar que las credenciales estén configuradas
    if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !bucketName) {
      throw new Error('Credenciales de AWS S3 no configuradas correctamente');
    }

    // Generar nombre único para el archivo
    const fileName = generateUniqueFileName(file.name);
    const key = `${folder}/${fileName}`;

    // Configurar parámetros para la subida
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: file.type,
      // Solo hacer público las imágenes
      ACL: isValidImage(file) ? 'public-read' : 'private'
    };

    // Configurar metadata
    const metadata = {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      fileSize: file.size.toString()
    };
    uploadParams.Metadata = metadata;

    // Crear promesa para la subida con progreso
    const upload = s3.upload(uploadParams);

    // Configurar callback de progreso si se proporciona
    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        onProgress(percentage);
      });
    }

    // Ejecutar la subida
    const result = await upload.promise();

    return {
      success: true,
      url: result.Location,
      key: result.Key,
      bucket: result.Bucket,
      etag: result.ETag,
      fileName: fileName,
      originalName: file.name,
      fileSize: file.size,
      contentType: file.type,
      isPublic: isValidImage(file),
      uploadedAt: metadata.uploadedAt
    };

  } catch (error) {
    console.error('Error subiendo archivo a S3:', error);
    throw new Error(`Error subiendo archivo: ${error.message}`);
  }
};

/**
 * Descarga un archivo de S3
 * @param {string} key - Clave del archivo en S3
 * @returns {Promise<string>} - URL firmada para descargar el archivo
 */
export const downloadFileFromS3 = async (key) => {
  try {
    // Para archivos públicos (imágenes), devolver URL directa
    if (key.includes('images/')) {
      return `https://${bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
    }

    // Para archivos privados (PDFs), generar URL firmada
    const signedUrlParams = {
      Bucket: bucketName,
      Key: key,
      Expires: 3600 // URL válida por 1 hora
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', signedUrlParams);
    return signedUrl;

  } catch (error) {
    console.error('Error generando URL de descarga:', error);
    throw new Error(`Error descargando archivo: ${error.message}`);
  }
};

/**
 * Elimina un archivo de S3
 * @param {string} key - Clave del archivo en S3
 * @returns {Promise<boolean>} - True si se eliminó exitosamente
 */
export const deleteFileFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();
    return true;

  } catch (error) {
    console.error('Error eliminando archivo de S3:', error);
    throw new Error(`Error eliminando archivo: ${error.message}`);
  }
};

/**
 * Lista archivos en una carpeta de S3
 * @param {string} folder - Carpeta a listar
 * @param {number} maxKeys - Máximo número de archivos a listar (default: 100)
 * @returns {Promise<Array>} - Array de objetos con información de los archivos
 */
export const listFilesInS3 = async (folder = '', maxKeys = 100) => {
  try {
    const listParams = {
      Bucket: bucketName,
      Prefix: folder,
      MaxKeys: maxKeys
    };

    const result = await s3.listObjectsV2(listParams).promise();
    
    return result.Contents.map(file => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      etag: file.ETag,
      storageClass: file.StorageClass
    }));

  } catch (error) {
    console.error('Error listando archivos de S3:', error);
    throw new Error(`Error listando archivos: ${error.message}`);
  }
};

/**
 * Verifica si un archivo existe en S3
 * @param {string} key - Clave del archivo en S3
 * @returns {Promise<boolean>} - True si el archivo existe
 */
export const fileExistsInS3 = async (key) => {
  try {
    const headParams = {
      Bucket: bucketName,
      Key: key
    };

    await s3.headObject(headParams).promise();
    return true;

  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    console.error('Error verificando existencia del archivo:', error);
    throw new Error(`Error verificando archivo: ${error.message}`);
  }
};

export default {
  uploadFileToS3,
  downloadFileFromS3,
  deleteFileFromS3,
  listFilesInS3,
  fileExistsInS3,
  isValidImage,
  isPDF,
  generateUniqueFileName
};
