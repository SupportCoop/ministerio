// pages/VideoList.js
import React, { useState, useEffect } from 'react';
import { Video, User, Calendar, Tag, Youtube, Eye } from 'lucide-react';
import videoService from '../services/videoService';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const videosData = await videoService.getAllVideos();
      setVideos(videosData);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando videos...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Videos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map(video => (
          <div key={video.videoID} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  className="text-white bg-red-600 p-3 rounded-full"
                >
                  <Youtube size={24} />
                </a>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
              
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {video.preacher || 'Sin predicador'}
              </div>
              
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {formatDate(video.uploadDate)}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  {video.category}
                </span>
              </div>
              
              {video.description && (
                <p className="text-gray-600 text-sm mb-3">{video.description}</p>
              )}
              
              {video.viewCount && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  {video.viewCount} visualizaciones
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {videos.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay videos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default VideoList;