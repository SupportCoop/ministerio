// services/bookService.js
import api from './api';

const bookService = {
  // GET /api/Book - Obtener todos los libros
  getAllBooks: async () => {
    try {
      const response = await api.get('/Book');
      console.log('📚 Libros obtenidos de la API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      throw error;
    }
  },

  // POST /api/Book - Crear nuevo libro
  createBook: async (bookData) => {
    try {
      console.log('📚 Creando libro con datos:', bookData);
      
      const formattedBook = {
        bookID: 0, // La API asignará el ID
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn,
        description: bookData.description || "",
        coverImageUrl: bookData.coverImageUrl || "",
        thumbnailUrl: bookData.thumbnailUrl || bookData.coverImageUrl || "",
        publicationDate: bookData.publicationDate || new Date().toISOString(),
        publisher: bookData.publisher || "",
        language: bookData.language || "Español",
        pages: parseInt(bookData.pages) || 0,
        category: bookData.category,
        subCategory: bookData.subCategory || "",
        tags: bookData.tags || "",
        amazonUrl: bookData.amazonUrl || "",
        kindleUrl: bookData.kindleUrl || "",
        appleBooksUrl: bookData.appleBooksUrl || "",
        googleBooksUrl: bookData.googleBooksUrl || "",
        otherStoreUrl: bookData.otherStoreUrl || "",
        otherStoreName: bookData.otherStoreName || "",
        price: parseFloat(bookData.price) || 0,
        discountPrice: parseFloat(bookData.discountPrice) || 0,
        currency: bookData.currency || "USD",
        isAvailable: bookData.isAvailable !== undefined ? bookData.isAvailable : true,
        isFeatured: bookData.isFeatured !== undefined ? bookData.isFeatured : false,
        isRecommended: bookData.isRecommended !== undefined ? bookData.isRecommended : false,
        isActive: true,
        rating: parseInt(bookData.rating) || 0,
        reviewsCount: 0,
        viewsCount: 0,
        clicksCount: 0,
        ministryReview: bookData.ministryReview || "",
        recommendationReason: bookData.recommendationReason || "",
        createdDate: new Date().toISOString(),
        createdBy: bookData.createdByAdmin?.adminID,
        createdByAdmin: bookData.createdByAdmin,
        lastModified: new Date().toISOString(),
        modifiedBy: bookData.modifiedByAdmin?.adminID,
        modifiedByAdmin: bookData.modifiedByAdmin,
        format: bookData.format || "Físico",
        targetAudience: bookData.targetAudience || "Cristianos adultos",
        difficultyLevel: bookData.difficultyLevel || "Básico"
      };

      const response = await api.post('/Book', formattedBook);
      console.log('✅ Libro creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createBook:', error);
      throw error;
    }
  },

  // GET /api/Book/{id} - Obtener libro por ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/Book/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBookById:', error);
      throw error;
    }
  },

  // PUT /api/Book/{id} - Actualizar libro
  updateBook: async (id, bookData) => {
    try {
      console.log('📝 Actualizando libro:', id, bookData);
      
      const response = await api.put(`/Book/${id}`, {
        ...bookData,
        lastModified: new Date().toISOString(),
        modifiedBy: bookData.modifiedByAdmin?.adminID
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in updateBook:', error);
      throw error;
    }
  },

  // DELETE /api/Book/{id} - Eliminar libro
  deleteBook: async (id) => {
    try {
      console.log('🗑️ Eliminando libro:', id);
      await api.delete(`/Book/${id}`);
      return true;
    } catch (error) {
      console.error('Error in deleteBook:', error);
      throw error;
    }
  },

  // GET /api/Book/search - Buscar libros
  searchBooks: async (query) => {
    try {
      const response = await api.get(`/Book/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error in searchBooks:', error);
      throw error;
    }
  },

  // GET /api/Book/category/{category} - Obtener libros por categoría
  getBooksByCategory: async (category) => {
    try {
      const response = await api.get(`/Book/category/${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBooksByCategory:', error);
      throw error;
    }
  },

  // GET /api/Book/author/{author} - Obtener libros por autor
  getBooksByAuthor: async (author) => {
    try {
      const response = await api.get(`/Book/author/${encodeURIComponent(author)}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBooksByAuthor:', error);
      throw error;
    }
  },

  // Métodos adicionales que podrías necesitar

  // GET /api/Book/featured - Obtener libros destacados
  getFeaturedBooks: async () => {
    try {
      const response = await api.get('/Book/featured');
      return response.data;
    } catch (error) {
      console.error('Error in getFeaturedBooks:', error);
      throw error;
    }
  },

  // GET /api/Book/recommended - Obtener libros recomendados
  getRecommendedBooks: async () => {
    try {
      const response = await api.get('/Book/recommended');
      return response.data;
    } catch (error) {
      console.error('Error in getRecommendedBooks:', error);
      throw error;
    }
  },

  // PATCH /api/Book/{id}/toggle-featured - Cambiar estado destacado
  toggleFeatured: async (id) => {
    try {
      const response = await api.patch(`/Book/${id}/toggle-featured`);
      return response.data;
    } catch (error) {
      console.error('Error in toggleFeatured:', error);
      throw error;
    }
  },

  // POST /api/Book/{id}/view - Registrar vista
  addView: async (id) => {
    try {
      const response = await api.post(`/Book/${id}/view`);
      return response.data;
    } catch (error) {
      console.error('Error in addView:', error);
      throw error;
    }
  },
};

export default bookService;
