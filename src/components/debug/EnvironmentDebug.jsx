import React, { useState } from 'react';
import { getEnvironmentInfo } from '@/utils/environment';

const EnvironmentDebug = () => {
  const [isVisible, setIsVisible] = useState(false);
  const envInfo = getEnvironmentInfo();

  // Solo mostrar en desarrollo
  if (!envInfo.isDevelopment) {
    return null;
  }

  return (
    <>
      {/* Botón flotante para mostrar/ocultar info */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold z-50 shadow-lg"
        title="Environment Debug Info"
      >
        ENV
      </button>

      {/* Panel de información */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-black/90 text-green-400 p-4 rounded-lg text-xs font-mono z-50 max-w-sm shadow-xl">
          <h3 className="text-yellow-400 font-bold mb-2">🔧 Environment Info</h3>
          <div className="space-y-1">
            <div><span className="text-blue-400">Mode:</span> {envInfo.isDevelopment ? 'Development' : 'Production'}</div>
            <div><span className="text-blue-400">Platform:</span> {envInfo.isNative ? 'Native App' : 'Web'}</div>
            <div><span className="text-blue-400">Base URL:</span> {envInfo.baseURL}</div>
            <div><span className="text-blue-400">Reset URL:</span> {envInfo.resetPasswordURL}</div>
            <div><span className="text-blue-400">OAuth URL:</span> {envInfo.oauthURL}</div>
            <div><span className="text-blue-400">User Agent:</span> {envInfo.userAgent.substring(0, 50)}...</div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default EnvironmentDebug;
