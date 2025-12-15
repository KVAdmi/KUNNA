// src/utils/jitsi.ts
let jitsiLoaderPromise: Promise<void> | null = null;

export function loadJitsiApiOnce(domain: string) {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (jitsiLoaderPromise) return jitsiLoaderPromise;

  jitsiLoaderPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar external_api.js'));
    document.head.appendChild(script);
  });

  return jitsiLoaderPromise;
}
