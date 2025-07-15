// components/VideoCard.js
import React from 'react';
import { Video, Eye, Edit, Trash2, Star, User, Calendar, Tag, Youtube } from 'lucide-react';

const VideoCard = ({ video, onEdit, onDelete, onView }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      <div className="relative">
        <img 
          src={video.thumbnailPath || 'https://via.placeholder.com/400x225.png?text=Video'} 
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <a 
            href={video.youTubeUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white bg-red-600 p-3 rounded-full hover:bg-red-700 transition-colors"
          >
            <Youtube size={32} />
          </a>
        </div>
        
        <div className="absolute top-2 left-2">
          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Video className="w-3 h-3" />
            Video
          </span>
        </div>
        
        <div className="absolute top-2 right-2 flex gap-2">
          {video.isFeatured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Destacado
            </span>
          )}
          <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {formatDuration(video.duration)}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{video.preacher || 'Sin predicador'}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(video.uploadDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            {video.category}
          </span>
        </div>
        
        {video.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {video.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 mb-4">
          {video.viewCount && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{video.viewCount}</span>
            </div>
          )}
          
          {video.likes && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">{video.likes}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView(video)}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
          <button
            onClick={() => onEdit(video)}
            className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(video.videoID)}
            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;