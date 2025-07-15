import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Filter, Grid, List, BookOpen, Eye, Edit, Trash2, 
  Star, User, Calendar, Tag, MoreVertical, TrendingUp, Award, 
  Settings, RefreshCw, X, Loader
} from 'lucide-react';
import { toast } from 'react-toastify';
import bookService from '../../services/bookService';
import BookForm from '../../components/BookForm'; // Import the BookForm component
import { useAuth } from '../../context/AuthContext';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const { admin } = useAuth();

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedBooks = await bookService.getAllBooks();
      setBooks(fetchedBooks);
      setError(null);
    } catch (err) {
      setError('Error al cargar los libros. Intente de nuevo más tarde.');
      toast.error('Error al cargar los libros.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAddNew = () => {
    setSelectedBook(null);
    setIsFormOpen(true);
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setIsFormOpen(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este libro?')) {
      try {
        await bookService.deleteBook(bookId);
        toast.success('Libro eliminado con éxito');
        fetchBooks(); // Refresh the list
      } catch (err) {
        toast.error('Error al eliminar el libro.');
        console.error(err);
      }
    }
  };

  const handleSave = async (bookData) => {
    try {
      if (selectedBook) {
        // Update book
        await bookService.updateBook(selectedBook.bookID, bookData);
        toast.success('Libro actualizado con éxito');
      } else {
        // Create new book
        await bookService.createBook(bookData);
        toast.success('Libro creado con éxito');
      }
      fetchBooks(); // Refresh the list
      setIsFormOpen(false);
      setSelectedBook(null);
    } catch (err) {
      toast.error('Error al guardar el libro.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedBook(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestión de Libros</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Añadir Nuevo Libro
          </button>
          <button 
            onClick={fetchBooks}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw size={20} />}
          </button>
        </div>
      </header>

      {isLoading && <p className="text-center text-lg">Cargando libros...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {books.map(book => (
            <div key={book.bookID} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <img src={book.coverImageUrl} alt={book.title} className="w-full h-48 object-cover rounded-md mb-4" />
                <h2 className="text-xl font-bold text-gray-900">{book.title}</h2>
                <p className="text-gray-600">{book.author}</p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleEdit(book)} className="text-blue-500 hover:text-blue-700 p-2">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(book.bookID)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <BookForm 
          book={selectedBook}
          onSave={handleSave}
          onCancel={handleCancel}
          currentAdmin={admin}
        />
      )}
    </div>
  );
};

export default BookManagement;