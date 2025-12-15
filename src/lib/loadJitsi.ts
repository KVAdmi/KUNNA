let loading: Promise<void> | null = null;

export async function loadJitsi(domain: string) {
  if (window.JitsiMeetExternalAPI) return;
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar external_api.js'));
      document.head.appendChild(script);
    });
  }
  await loading;
}
