// pages/MediaLibrary.js
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, BookOpen, Video, Film, Star, Tag, Eye, TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import bookService from '../services/bookService';
import videoService from '../services/videoService';
import BookCard from '../components/BookCard';
import VideoCard from '../components/VideoCard';

const MediaLibrary = () => {
  const [books, setBooks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'books', 'videos'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  // Cargar datos
  useEffect(() => {
    loadMediaData();
  }, []);

  const loadMediaData = async () => {
    try {
      setLoading(true);
      const [booksData, videosData] = await Promise.all([
        bookService.getAllBooks().catch(() => []),
        videoService.getAllVideos().catch(() => [])
      ]);
      
      setBooks(booksData);
      setVideos(videosData);
      setError(null);
    } catch (err) {
      setError('Error al cargar el contenido multimedia');
      toast.error('Error al cargar el contenido');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Combinar y filtrar contenido
  const allMedia = [
    ...books.map(book => ({ ...book, type: 'book' })),
    ...videos.map(video => ({ ...video, type: 'video' }))
  ];

  const filteredMedia = allMedia
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (item.preacher && item.preacher.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadDate || a.publishedYear || 0);
          bValue = new Date(b.uploadDate || b.publishedYear || 0);
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Obtener categorías únicas
  const categories = [...new Set(allMedia.map(item => item.category))].filter(Boolean);

  // Estadísticas
  const stats = {
    totalBooks: books.length,
    totalVideos: videos.length,
    totalMedia: allMedia.length,
    featuredBooks: books.filter(book => book.isFeatured).length,
    featuredVideos: videos.filter(video => video.isFeatured).length,
    totalCategories: categories.length
  };

  const handleView = (item) => {
    console.log('Ver:', item);
    // Implementar lógica de visualización
  };

  const handleEdit = (item) => {
    console.log('Editar:', item);
    // Implementar lógica de edición
  };

  const handleDelete = async (itemId, type) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      try {
        if (type === 'book') {
          await bookService.deleteBook(itemId);
          toast.success('Libro eliminado exitosamente');
        } else {
          await videoService.deleteVideo(itemId);
          toast.success('Video eliminado exitosamente');
        }
        loadMediaData(); // Recargar datos
      } catch (err) {
        toast.error('Error al eliminar el elemento');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadMediaData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Biblioteca Multimedia</h1>
        <p className="text-gray-600">Explora nuestra colección de libros y videos espirituales</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalBooks}</div>
          <div className="text-sm text-gray-600">Libros</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalVideos}</div>
          <div className="text-sm text-gray-600">Videos</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Film className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalMedia}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.featuredBooks + stats.featuredVideos}</div>
          <div className="text-sm text-gray-600">Destacados</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Tag className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalCategories}</div>
          <div className="text-sm text-gray-600">Categorías</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{filteredMedia.length}</div>
          <div className="text-sm text-gray-600">Mostrando</div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar libros y videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todo el contenido</option>
              <option value="book">Solo libros</option>
              <option value="video">Solo videos</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="title">Título</option>
              <option value="date">Fecha</option>
              <option value="category">Categoría</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* Modo de vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enlaces rápidos */}
      <div className="flex gap-4 mb-6">
        <Link 
          to="/books"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Ver Libros
        </Link>
        <Link 
          to="/videos"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Ver Videos
        </Link>
      </div>

      {/* Lista de contenido */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontró contenido</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredMedia.map(item => (
            item.type === 'book' ? (
              <BookCard
                key={`book-${item.id}`}
                book={item}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={(id) => handleDelete(id, 'book')}
              />
            ) : (
              <VideoCard
                key={`video-${item.videoID}`}
                video={item}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={(id) => handleDelete(id, 'video')}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;