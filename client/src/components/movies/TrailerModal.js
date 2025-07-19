import React from 'react';

const TrailerModal = ({ isOpen, onClose, videoKey, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-xl overflow-hidden max-w-4xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">{title} - Trailer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
            title={`${title} Trailer`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
