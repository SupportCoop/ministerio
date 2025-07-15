// pages/BookSearch.js
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, BookOpen, User, Calendar, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import BookDetail from '../components/BookDetail';
import bookService from '../services/bookService';

const BookSearch = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchType, setSearchType] = useState('general'); // 'general', 'category', 'author'

  const categories = [
    'Ficción', 'No Ficción', 'Ciencia', 'Historia', 'Biografía',
    'Tecnología', 'Arte', 'Filosofía', 'Autoayuda', 'Novela'
  ];

  const handleGeneralSearch = async () => {
    if (!searchTerm.trim()) {
      toast.warning('Por favor ingresa un término de búsqueda');
      return;
    }
    
    try {
      setLoading(true);
      setSearchType('general');
      const results = await bookService.searchBooks(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('No se encontraron libros con ese término');
      } else {
        toast.success(`Se encontraron ${results.length} libros`);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
      toast.error('Error al buscar libros');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySearch = async (category) => {
    try {
      setLoading(true);
      setSearchType('category');
      setSelectedCategory(category);
      const results = await bookService.getBooksByCategory(category);
      setCategoryBooks(results);
      
      if (results.length === 0) {
        toast.info(`No se encontraron libros en la categoría "${category}"`);
      } else {
        toast.success(`Se encontraron ${results.length} libros en "${category}"`);
      }
    } catch (error) {
      console.error('Error searching books by category:', error);
      setCategoryBooks([]);
      toast.error('Error al buscar libros por categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorSearch = async () => {
    if (!selectedAuthor.trim()) {
      toast.warning('Por favor ingresa el nombre del autor');
      return;
    }
    
    try {
      setLoading(true);
      setSearchType('author');
      const results = await bookService.getBooksByAuthor(selectedAuthor);
      setAuthorBooks(results);
      
      if (results.length === 0) {
        toast.info(`No se encontraron libros del autor "${selectedAuthor}"`);
      } else {
        toast.success(`Se encontraron ${results.length} libros del autor "${selectedAuthor}"`);
      }
    } catch (error) {
      console.error('Error searching books by author:', error);
      setAuthorBooks([]);
      toast.error('Error al buscar libros por autor');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowDetail(true);
  };

  const handleEditBook = (book) => {
    // Navegar a la página de gestión de libros con el libro seleccionado
    navigate('/books', { state: { editBook: book } });
  };

  const handleDeleteBook = () => {
    // Redirigir a la página de gestión para operaciones de eliminación
    toast.info('Para eliminar libros, ve a la página de gestión');
    navigate('/books');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedAuthor('');
    setSelectedCategory('');
    setSearchResults([]);
    setCategoryBooks([]);
    setAuthorBooks([]);
    setSearchType('general');
  };

  const getCurrentResults = () => {
    switch (searchType) {
      case 'category':
        return categoryBooks;
      case 'author':
        return authorBooks;
      default:
        return searchResults;
    }
  };

  const getCurrentTitle = () => {
    switch (searchType) {
      case 'category':
        return `Libros de la categoría: ${selectedCategory}`;
      case 'author':
        return `Libros del autor: ${selectedAuthor}`;
      default:
        return searchTerm ? `Resultados para: "${searchTerm}"` : 'Búsqueda de Libros';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Search className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Búsqueda de Libros</h1>
            </div>
            <p className="text-gray-600">Encuentra libros por título, autor, categoría o contenido</p>
            
            {/* Navigation Button */}
            <div className="mt-4">
              <button
                onClick={() => navigate('/books')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir a Gestión de Libros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* General Search */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Búsqueda General
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGeneralSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleGeneralSearch}
                disabled={!searchTerm.trim() || loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && searchType === 'general' ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Category Search */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Buscar por Categoría
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySearch(category)}
                  disabled={loading}
                  className={`p-3 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedCategory === category ? 'bg-blue-100 border-blue-500 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Author Search */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Buscar por Autor
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del autor..."
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuthorSearch()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAuthorSearch}
                disabled={!selectedAuthor.trim() || loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && searchType === 'author' ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory || selectedAuthor || getCurrentResults().length > 0) && (
            <div className="flex justify-center">
              <button
                onClick={clearSearch}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar Búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Buscando libros...</p>
          </div>
        )}

        {/* Results */}
        {!loading && getCurrentResults().length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {getCurrentTitle()}
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {getCurrentResults().length} {getCurrentResults().length === 1 ? 'libro encontrado' : 'libros encontrados'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getCurrentResults().map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onView={handleViewBook}
                  onEdit={handleEditBook}
                  onDelete={handleDeleteBook}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && (searchTerm || selectedCategory || selectedAuthor) && getCurrentResults().length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron libros</h3>
            <p className="text-gray-500 mb-4">
              Intenta con otros términos de búsqueda o explora diferentes categorías
            </p>
            <button
              onClick={() => navigate('/books')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos los Libros
            </button>
          </div>
        )}

        {/* Initial State */}
        {!loading && !searchTerm && !selectedCategory && !selectedAuthor && getCurrentResults().length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Comienza tu búsqueda</h3>
            <p className="text-gray-500 mb-4">
              Usa las opciones de búsqueda de arriba para encontrar libros específicos
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/books')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Biblioteca Completa
              </button>
              <button
                onClick={() => setSearchTerm('ficción')}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Búsqueda de Ejemplo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      {showDetail && (
        <BookDetail
          book={selectedBook}
          onClose={() => {
            setShowDetail(false);
            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
};

export default BookSearch;