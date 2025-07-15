// pages/BookList.js
import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Tag, Star } from 'lucide-react';
import bookService from '../services/bookService';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const booksData = await bookService.getAllBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando libros...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Libros</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map(book => (
          <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={book.coverImageUrl || '/api/placeholder/300/400'} 
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
              
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {book.author}
              </div>
              
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {book.publishedYear}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {book.category}
                </span>
              </div>
              
              {book.description && (
                <p className="text-gray-600 text-sm mb-3">{book.description}</p>
              )}
              
              {book.rating && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{book.rating}</span>
                </div>
              )}
              
              {book.amazonUrl && (
                <a 
                  href={book.amazonUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-orange-500 text-white text-center py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                >
                  Ver en Amazon
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay libros disponibles</p>
        </div>
      )}
    </div>
  );
};

export default BookList;