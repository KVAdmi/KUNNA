import React, { useState } from 'react';
// 🛠️ TEMP FIX: AWS SDK removido temporalmente
import { uploadImage, uploadPDF } from '../services/s3Service';
import toast from 'react-hot-toast';

const FileUploadExample = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      
      if (!isImage && !isPDF) {
        toast.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP) y archivos PDF');
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error('El archivo no puede ser mayor a 10MB');
        return;
      }

      setSelectedFile(file);
      toast.success(`Archivo seleccionado: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 🛠️ TEMP: Usar funciones mock hasta mover S3 al backend
      const isImage = selectedFile.type.startsWith('image/');
      
      if (isImage) {
        await uploadImage(selectedFile);
      } else {
        await uploadPDF(selectedFile);
      }

      console.log('Archivo subido exitosamente:', result);
      
      // Agregar a la lista de archivos subidos
      setUploadedFiles(prev => [...prev, result]);
      
      // Limpiar formulario
      setSelectedFile(null);
      setUploadProgress(0);
      document.getElementById('file-input').value = '';
      
      toast.success(`¡Archivo subido exitosamente! ${result.isPublic ? '(Público)' : '(Privado)'}`);
      
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast.error(`Error subiendo archivo: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const downloadUrl = await downloadFileFromS3(file.key);
      
      // Abrir en nueva ventana/pestaña
      window.open(downloadUrl, '_blank');
      
      toast.success('Archivo descargado exitosamente');
      
    } catch (error) {
      console.error('Error descargando archivo:', error);
      toast.error(`Error descargando archivo: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Test de Subida de Archivos a AWS S3
      </h2>
      
      {/* Sección de subida */}
      <div className="mb-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={uploading}
          />
          
          {selectedFile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Archivo seleccionado:</strong> {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tamaño:</strong> {formatFileSize(selectedFile.size)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tipo:</strong> {selectedFile.type}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Acceso:</strong> {isValidImage(selectedFile) ? 'Público (imagen)' : 'Privado (PDF)'}
              </p>
            </div>
          )}
          
          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Subiendo... {uploadProgress}%
              </p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </div>
      
      {/* Lista de archivos subidos */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Archivos Subidos ({uploadedFiles.length})
          </h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{file.originalName}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.fileSize)} • {file.contentType}
                  </p>
                  <p className="text-sm text-gray-500">
                    Subido: {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      file.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {file.isPublic ? 'Público' : 'Privado'}
                    </span>
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Descargar
                  </button>
                  
                  {file.isPublic && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(file.url);
                        toast.success('URL copiada al portapapeles');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Copiar URL
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Información del bucket */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Configuración del Bucket</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Bucket: {import.meta.env.VITE_AWS_S3_BUCKET_NAME}</li>
          <li>• Región: {import.meta.env.VITE_AWS_REGION}</li>
          <li>• Las imágenes se suben como públicas (acceso directo)</li>
          <li>• Los PDFs se suben como privados (requieren URL firmada)</li>
          <li>• Tamaño máximo: 10MB por archivo</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadExample;
