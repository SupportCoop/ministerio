const BookDetail = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {book.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative group">
              <img 
                src={book.coverImageUrl || '/api/placeholder/400/600'} 
                alt={book.title}
                className="w-full max-w-sm h-auto object-cover rounded-2xl shadow-2xl mx-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="flex justify-center gap-4">
              {book.isAvailable && (
                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                  ✅ Disponible
                </span>
              )}
              {book.isFeatured && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Destacado
                </span>
              )}
              {book.isRecommended && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                  👍 Recomendado
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Información del Libro
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <User className="w-6 h-6 text-blue-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Autor</span>
                    <p className="text-lg font-bold text-gray-800">{book.author}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <Calendar className="w-6 h-6 text-green-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha de Publicación</span>
                    <p className="text-lg font-bold text-gray-800">
                      {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <Tag className="w-6 h-6 text-purple-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-500">Categoría</span>
                    <span className="inline-block mt-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                      {book.category}
                    </span>
                  </div>
                </div>
                
                {book.rating > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <div>
                      <span className="text-sm font-medium text-gray-500">Calificación</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-5 h-5 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-gray-800">{book.rating}/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {book.description && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Descripción</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{book.description}</p>
              </div>
            )}
            
            {book.ministryReview && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⛪ Reseña del Ministerio</h3>
                <p className="text-gray-700 leading-relaxed">{book.ministryReview}</p>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
            >
              🔒 Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;