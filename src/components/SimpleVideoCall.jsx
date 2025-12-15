import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SimpleVideoCall = ({ roomUrl, onClose, isVisible, roomName = "Sala Zinha" }) => {
  if (!isVisible || !roomUrl) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-4 bg-gradient-to-br from-[#f5e6ff] via-[#e8d5ff] to-[#dcc4ff] rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header hermoso */}
          <div className="bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#382a3c] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#c1d43a] rounded-full animate-pulse"></div>
              <h2 className="text-white font-semibold text-lg">{roomName}</h2>
            </div>
            
            <motion.button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4243a] to-[#c1243a] text-white flex items-center justify-center hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Iframe simple pero funcional */}
          <div className="h-full bg-black">
            <iframe
              src={roomUrl}
              className="w-full h-full"
              allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
              allowFullScreen
              title="Videollamada Zinha"
              style={{ border: 'none', minHeight: '500px' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimpleVideoCall;
