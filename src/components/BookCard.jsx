// components/BookCard.js
import React from 'react';
import { BookOpen, Eye, Edit, Trash2, Star, User, Calendar, Tag } from 'lucide-react';

const BookCard = ({ book, onEdit, onDelete, onView }) => {
  // Validación para evitar errores si book es undefined
  if (!book) {
    return (
      <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-300"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      <div className="relative">
        <img 
          src={book.coverImageUrl || '/api/placeholder/300/400'} 
          alt={book.title || 'Libro sin título'}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Libro
          </span>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          {book.isAvailable && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Disponible
            </span>
          )}
          {book.isFeatured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Destacado
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {book.title || 'Título no disponible'}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{book.author || 'Autor desconocido'}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{book.publishedYear || 'Año no disponible'}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {book.category || 'Sin categoría'}
          </span>
        </div>
        
        {book.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {book.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 mb-4">
          {book.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">{book.rating}</span>
            </div>
          )}
          
          {book.isbn && (
            <div className="text-sm text-gray-500">
              ISBN: {book.isbn}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView && onView(book)}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
          <button
            onClick={() => onEdit && onEdit(book)}
            className="bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(book.id)}
            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;