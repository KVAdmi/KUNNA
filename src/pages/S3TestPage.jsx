import React from 'react';
import FileUploadExample from '../components/FileUploadExample';

const S3TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Prueba de Integración AWS S3
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Esta página permite probar la funcionalidad de subida y descarga de archivos 
            al bucket de AWS S3. Las imágenes se configuran como públicas y los PDFs como privados.
          </p>
        </div>
        
        <FileUploadExample />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Instrucciones de Prueba
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  📸 Prueba con Imágenes
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sube una imagen (JPG, PNG, GIF, WebP)</li>
                  <li>• Verifica que se marca como "Público"</li>
                  <li>• Usa "Copiar URL" para obtener el enlace directo</li>
                  <li>• Abre la URL en una nueva pestaña para verificar acceso público</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">
                  📄 Prueba con PDFs
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sube un archivo PDF</li>
                  <li>• Verifica que se marca como "Privado"</li>
                  <li>• Usa "Descargar" para obtener una URL firmada</li>
                  <li>• La URL será temporal (válida por 1 hora)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Notas Importantes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Las credenciales están configuradas en el archivo .env</li>
                <li>• El bucket debe permitir acceso público para las imágenes</li>
                <li>• Los PDFs requieren autenticación para acceso</li>
                <li>• Revisa la consola del navegador para logs detallados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3TestPage;
