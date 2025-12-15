import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import { 
  Upload, 
  FileText, 
  Mic, 
  Users, 
  Shield, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye 
} from 'lucide-react';
import supabase from '@/lib/customSupabaseClient.js';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pdfs');
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [refuges, setRefuges] = useState([]);

  // Verificar si el usuario es administrador
  const isAdmin = user?.email === 'admin@zinha.com'; // Cambia por tu email de admin

  useEffect(() => {
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Acceso denegado',
        description: 'No tienes permisos para acceder a esta página.',
      });
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar PDFs
      const { data: pdfsData } = await supabase
        .from('biblioteca_pdfs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Cargar podcasts
      const { data: podcastsData } = await supabase
        .from('podcast')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Cargar terapeutas
      const { data: therapistsData } = await supabase
        .from('directorio_terapeutas')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Cargar refugios
      const { data: refugesData } = await supabase
        .from('refugios_apoyo')
        .select('*')
        .order('created_at', { ascending: false });

      setPdfs(pdfsData || []);
      setPodcasts(podcastsData || []);
      setTherapists(therapistsData || []);
      setRefuges(refugesData || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      setLoading(true);
      
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Guardar en la tabla correspondiente
      if (type === 'pdf') {
        await supabase.from('biblioteca_pdfs').insert({
          titulo: file.name.replace('.pdf', ''),
          url: urlData.publicUrl,
          descripcion: 'Subido desde panel admin',
          categoria: 'general'
        });
      } else if (type === 'podcast') {
        await supabase.from('podcast').insert({
          titulo: file.name,
          url_audio: urlData.publicUrl,
          descripcion: 'Subido desde panel admin',
          duracion: '00:00'
        });
      }

      toast({
        title: 'Archivo subido',
        description: `${file.name} se ha subido correctamente.`,
      });

      loadData();
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo subir el archivo.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta área.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'pdfs', label: 'PDFs Biblioteca', icon: FileText },
    { id: 'podcasts', label: 'Podcasts', icon: Mic },
    { id: 'therapists', label: 'Terapeutas', icon: Users },
    { id: 'refuges', label: 'Refugios', icon: Shield },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'codes', label: 'Códigos Donativo', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 p-6">
      <BackButton fallbackRoute="/" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona el contenido y usuarios de Zinha
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-brand-accent text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Contenido de cada tab */}
            {activeTab === 'pdfs' && (
              <PDFsManagement 
                pdfs={pdfs} 
                onUpload={(file) => handleFileUpload(file, 'pdf')}
                loading={loading}
                onReload={loadData}
              />
            )}
            
            {activeTab === 'podcasts' && (
              <PodcastsManagement 
                podcasts={podcasts}
                onUpload={(file) => handleFileUpload(file, 'podcast')}
                loading={loading}
                onReload={loadData}
              />
            )}
            
            {activeTab === 'therapists' && (
              <TherapistsManagement 
                therapists={therapists}
                loading={loading}
                onReload={loadData}
              />
            )}
            
            {activeTab === 'refuges' && (
              <RefugesManagement 
                refuges={refuges}
                loading={loading}
                onReload={loadData}
              />
            )}
            
            {activeTab === 'users' && (
              <UsersManagement />
            )}
            
            {activeTab === 'codes' && (
              <DonationCodesManagement />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para gestión de PDFs
const PDFsManagement = ({ pdfs, onUpload, loading, onReload }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    pdfFiles.forEach(file => onUpload(file));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de PDFs</h2>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              Array.from(e.target.files).forEach(file => onUpload(file));
            }}
          />
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Subir PDF
          </Button>
        </label>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragOver ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Arrastra y suelta archivos PDF aquí
        </p>
        <p className="text-gray-600">
          O haz clic en "Subir PDF" para seleccionar archivos
        </p>
      </div>

      {/* Lista de PDFs */}
      <div className="space-y-4">
        {pdfs.map((pdf) => (
          <div key={pdf.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium">{pdf.titulo}</h3>
                <p className="text-sm text-gray-600">{pdf.categoria}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Placeholder para otros componentes de gestión
const PodcastsManagement = ({ podcasts, onUpload, loading, onReload }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Gestión de Podcasts</h2>
    <p className="text-gray-600">Funcionalidad de podcasts en desarrollo...</p>
  </div>
);

const TherapistsManagement = ({ therapists, loading, onReload }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Directorio de Terapeutas</h2>
    <p className="text-gray-600">Gestión de terapeutas en desarrollo...</p>
  </div>
);

const RefugesManagement = ({ refuges, loading, onReload }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Refugios y Apoyo</h2>
    <p className="text-gray-600">Gestión de refugios en desarrollo...</p>
  </div>
);

const UsersManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
    <p className="text-gray-600">Gestión de usuarios en desarrollo...</p>
  </div>
);

const DonationCodesManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Códigos de Donativo</h2>
    <p className="text-gray-600">Gestión de códigos en desarrollo...</p>
  </div>
);

export default AdminDashboard;
