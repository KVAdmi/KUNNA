import { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const VerPDF = ({ path }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPDF = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .storage
        .from('zona_holistica')
        .download(path);

      if (error) {
        console.error('Error al descargar PDF:', error.message);
      } else {
        const url = URL.createObjectURL(data);
        setPdfUrl(url);
      }
    };

    fetchPDF();
  }, [user, path]);

  if (!user) return <p className="text-center text-gray-500">Inicia sesión para ver el contenido.</p>;
  if (!pdfUrl) return <p className="text-center text-gray-500">Cargando el PDF...</p>;

  return (
    <iframe
      src={pdfUrl}
      title="PDF"
      width="100%"
      height="600px"
      className="rounded-xl border border-gray-300"
    />
  );
};

export default VerPDF;
