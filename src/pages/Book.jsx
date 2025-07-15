// pages/Books.js
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Grid, List, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import BookCard from '../components/BookCard';
import BookForm from '../components/BookForm';
import BookDetail from '../components/BookDetail';
import bookService from '../services/bookService';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedCategory, selectedAuthor]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
      
      // Extraer categorías y autores únicos
      const uniqueCategories = [...new Set(data.map(book => book.category))].filter(Boolean);
      const uniqueAuthors = [...new Set(data.map(book => book.author))].filter(Boolean);
      setCategories(uniqueCategories);
      setAuthors(uniqueAuthors);
      
      toast.success('Libros cargados correctamente');
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Error al cargar los libros');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    if (selectedAuthor) {
      filtered = filtered.filter(book => book.author === selectedAuthor);
    }

    setFilteredBooks(filtered);
  };

  const handleCreateBook = async (bookData) => {
    try {
      await bookService.createBook(bookData);
      setShowForm(false);
      loadBooks();
      toast.success('Libro creado exitosamente');
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Error al crear el libro');
    }
  };

  const handleUpdateBook = async (bookData) => {
    try {
      await bookService.updateBook(selectedBook.id, bookData);
      setShowForm(false);
      setSelectedBook(null);
      loadBooks();
      toast.success('Libro actualizado exitosamente');
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Error al actualizar el libro');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este libro?')) {
      try {
        await bookService.deleteBook(bookId);
        loadBooks();
        toast.success('Libro eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Error al eliminar el libro');
      }
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowDetail(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowForm(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedAuthor('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Cargando libros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Libros</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Libro
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar libros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los autores</option>
              {authors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Limpiar
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {filteredBooks.length} de {books.length} libros
            </span>
            <span>
              {searchTerm || selectedCategory || selectedAuthor ? (
                <span className="text-blue-600">Filtros aplicados</span>
              ) : (
                'Sin filtros'
              )}
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Libros</p>
                <p className="text-2xl font-semibold text-gray-900">{books.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Filter className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Categorías</p>
                <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Search className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Autores</p>
                <p className="text-2xl font-semibold text-gray-900">{authors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Grid className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Filtrados</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredBooks.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Book Grid/List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No se encontraron libros</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory || selectedAuthor
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Agrega tu primer libro para comenzar'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Primer Libro
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onView={handleViewBook}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <BookForm
          book={selectedBook}
          onSave={selectedBook ? handleUpdateBook : handleCreateBook}
          onCancel={() => {
            setShowForm(false);
            setSelectedBook(null);
          }}
        />
      )}

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

export default Books;