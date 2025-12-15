import supabase from './customSupabaseClient';

export async function generarYDescargarCert() {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) throw new Error('Sin sesión');

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` }
  });
  const data = await res.json();
  if (!res.ok || !data?.url) throw new Error(data?.error || 'Error generando certificado');

  // Abrir en nueva pestaña para descarga
  window.open(data.url, '_blank');
  return data;
}
