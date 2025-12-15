import React from 'react';
import { motion } from 'framer-motion';
import { X, BookmarkPlus, Share2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ArticleViewer = ({ article, category, onClose, onBookmark }) => {
  if (!article || !category) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-white/20 backdrop-blur-xl bg-white/90">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: category.color }}
              >
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brand-primary font-serif">
                  {article.title}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-brand-secondary/80">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>5 min lectura</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{article.type}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => onBookmark(article.id)}
                variant="outline"
                size="sm"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-brand-primary hover:bg-white/30"
              >
                <BookmarkPlus className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-brand-primary hover:bg-white/30"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-brand-primary hover:bg-white/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
            <p className="text-lg text-brand-primary leading-relaxed italic">
              {article.summary}
            </p>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-brand-primary prose-p:text-brand-secondary/90 prose-strong:text-brand-primary prose-ul:text-brand-secondary/90 prose-li:text-brand-secondary/90"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-gradient-to-r from-brand-background/30 to-white/30">
          <div className="text-center">
            <p className="text-brand-secondary/80 font-medium italic">
              "Tu bienestar es nuestra prioridad. Siempre consulta con profesionales de la salud para decisiones importantes."
            </p>
            <Button 
              onClick={onClose}
              className="mt-4 bg-gradient-to-r from-brand-accent to-brand-secondary hover:from-brand-secondary hover:to-brand-accent text-white shadow-lg"
            >
              Continuar Explorando
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArticleViewer;
