import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import EmbeddedVideoCall from '@/components/EmbeddedVideoCall';

const VideoTestButton = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [testUrl, setTestUrl] = useState('');

  const testVideo = () => {
    // URL de prueba con Jitsi (gratuito para testear)
    const roomId = Math.random().toString(36).substring(7);
    const jitsiUrl = `https://meet.jit.si/ZinhaTest-${roomId}`;
    setTestUrl(jitsiUrl);
    setShowVideo(true);
  };

  return (
    <>
      <motion.button
        onClick={testVideo}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-[#c1d43a] to-[#a8c234] text-[#382a3c] p-3 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Video className="w-6 h-6" />
      </motion.button>

      <EmbeddedVideoCall
        roomUrl={testUrl}
        onClose={() => {
          setShowVideo(false);
          setTestUrl('');
        }}
        isVisible={showVideo}
        roomName="Prueba Zinha"
        participantName="Usuario Prueba"
      />
    </>
  );
};

export default VideoTestButton;
