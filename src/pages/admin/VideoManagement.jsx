import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Filter, Grid, List, Video, Eye, Edit, Trash2,
  Star, User, Calendar, Tag, MoreVertical, TrendingUp, Award,
  Settings, RefreshCw, X, Loader, Youtube
} from 'lucide-react';
import { toast } from 'react-toastify';
import videoService from '../../services/videoService';
import VideoForm from '../../components/VideoForm'; // Import the VideoForm component
import { useAuth } from '../../context/AuthContext';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const { admin } = useAuth();

  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedVideos = await videoService.getAllVideos();
      setVideos(fetchedVideos);
      setError(null);
    } catch (err) {
      setError('Error al cargar los videos. Intente de nuevo más tarde.');
      toast.error('Error al cargar los videos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleAddNew = () => {
    setSelectedVideo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setIsFormOpen(true);
  };

  const handleDelete = async (videoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este video?')) {
      try {
        await videoService.deleteVideo(videoId);
        toast.success('Video eliminado con éxito');
        fetchVideos(); // Refresh the list
      } catch (err) {
        toast.error('Error al eliminar el video.');
        console.error(err);
      }
    }
  };

  const handleSave = async (videoData) => {
    try {
      if (selectedVideo) {
        // Update video
        await videoService.updateVideo(selectedVideo.videoID, videoData);
        toast.success('Video actualizado con éxito');
      } else {
        // Create new video
        await videoService.createVideo(videoData);
        toast.success('Video creado con éxito');
      }
      fetchVideos(); // Refresh the list
      setIsFormOpen(false);
      setSelectedVideo(null);
    } catch (err) {
      toast.error('Error al guardar el video.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedVideo(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestión de Videos</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Añadir Nuevo Video
          </button>
          <button
            onClick={fetchVideos}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw size={20} />}
          </button>
        </div>
      </header>

      {isLoading && <p className="text-center text-lg">Cargando videos...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {videos.map(video => (
            <div key={video.videoID} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
              <div className="relative">
                <img src={video.thumbnailPath || 'https://via.placeholder.com/400x225.png?text=Video'} alt={video.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <a href={video.youTubeUrl} target="_blank" rel="noopener noreferrer" className="text-white bg-red-600 p-3 rounded-full">
                    <Youtube size={32} />
                  </a>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 truncate">{video.title}</h2>
                <p className="text-gray-600 mt-1">{video.category}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => handleEdit(video)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => handleDelete(video.videoID)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <VideoForm 
          video={selectedVideo}
          onSave={handleSave}
          onCancel={handleCancel}
          currentAdmin={admin}
        />
      )}
    </div>
  );
};

export default VideoManagement;