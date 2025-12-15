import React from 'react';

const AndroidTestInfo = () => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const userAgent = navigator.userAgent;
  const hasVisualViewport = !!window.visualViewport;
  const viewportHeight = window.innerHeight;
  const screenHeight = window.screen.height;

  return (
    <div className="fixed top-20 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h4 className="font-bold mb-2">Debug Android</h4>
      <p>Es Android: {isAndroid ? 'SÍ' : 'NO'}</p>
      <p>Visual Viewport: {hasVisualViewport ? 'SÍ' : 'NO'}</p>
      <p>Viewport Height: {viewportHeight}px</p>
      <p>Screen Height: {screenHeight}px</p>
      <p className="mt-2 text-gray-300 break-all">
        UA: {userAgent.substring(0, 50)}...
      </p>
    </div>
  );
};

export default AndroidTestInfo;
