import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Grid, List, BookOpen, Eye, Edit, Trash2, 
  Star, User, Calendar, Tag, MoreVertical, TrendingUp, Award, 
  Settings, RefreshCw, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import bookService from '../services/bookService';

// Componente BookForm
const BookForm = ({ book, onSave, onCancel, currentAdmin }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    coverImageUrl: '',
    thumbnailUrl: '',
    publicationDate: new Date().toISOString().split('T')[0],
    publisher: '',
    language: 'Español',
    pages: '',
    category: '',
    subCategory: '',
    tags: '',
    amazonUrl: '',
    kindleUrl: '',
    appleBooksUrl: '',
    googleBooksUrl: '',
    otherStoreUrl: '',
    otherStoreName: '',
    price: '',
    discountPrice: '',
    currency: 'USD',
    isAvailable: true,
    isFeatured: false,
    isRecommended: false,
    rating: 1, // Changed from 0 to 1 to meet validation requirements
    ministryReview: '',
    recommendationReason: '',
    format: 'Físico',
    targetAudience: 'Cristianos adultos',
    difficultyLevel: 'Básico',
    // Add required admin fields
    // Add required admin fields
    createdByAdmin: currentAdmin || null,
    modifiedByAdmin: currentAdmin || null,
    ...book
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.author.trim()) newErrors.author = 'El autor es requerido';
    if (!formData.isbn.trim()) newErrors.isbn = 'El ISBN es requerido';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    
    // Validate rating
    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'La calificación debe estar entre 1 y 5';
    }
    
    // Validate required admin fields
    // Validate required admin fields
    if (!formData.createdByAdmin) {
      newErrors.createdByAdmin = 'El administrador creador es requerido';
    }
    if (!formData.modifiedByAdmin) {
      newErrors.modifiedByAdmin = 'El administrador modificador es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure admin fields are set before saving
      const bookData = {
        ...formData,
        createdByAdmin: formData.createdByAdmin || currentAdmin,
        modifiedByAdmin: currentAdmin, // Always use current admin for modifications
        rating: Number(formData.rating), // Ensure rating is a number
        pages: formData.pages ? Number(formData.pages) : null,
        price: formData.price ? Number(formData.price) : null,
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      };
      if (typeof onSave === 'function') {
        onSave(bookData);
      } else {
        console.error("onSave is not a function");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Update admin fields when currentAdmin changes
  useEffect(() => {
    if (currentAdmin) {
      setFormData(prev => ({
        ...prev,
        createdByAdmin: prev.createdByAdmin || currentAdmin,
        modifiedByAdmin: currentAdmin
      }));
    }
  }, [currentAdmin]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {book ? 'Editar Libro' : 'Crear Nuevo Libro'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Información Básica</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                placeholder="Ingresa el título del libro"
                required
              />
              {errors.title && <p className="text-red-500 text-sm mt-2">⚠️ {errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Autor *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.author ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                placeholder="Nombre del autor"
                required
              />
              {errors.author && <p className="text-red-500 text-sm mt-2">⚠️ {errors.author}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">ISBN *</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.isbn ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                placeholder="ISBN del libro"
                required
              />
              {errors.isbn && <p className="text-red-500 text-sm mt-2">⚠️ {errors.isbn}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Categoría *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Espiritualidad">🙏 Espiritualidad</option>
                <option value="Teología">📖 Teología</option>
                <option value="Vida Cristiana">✝️ Vida Cristiana</option>
                <option value="Biografía">👤 Biografía</option>
                <option value="Autoayuda">💪 Autoayuda</option>
                <option value="Familia">👨‍👩‍👧‍👦 Familia</option>
                <option value="Liderazgo">👑 Liderazgo</option>
                <option value="Juventud">🌟 Juventud</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-2">⚠️ {errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Subcategoría</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="Ej: Cristianismo, Oración, etc."
              />
            </div>

            {/* Rating Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Calificación *</label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.rating ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-300'
                }`}
                required
              >
                <option value={1}>⭐ 1 estrella</option>
                <option value={2}>⭐⭐ 2 estrellas</option>
                <option value={3}>⭐⭐⭐ 3 estrellas</option>
                <option value={4}>⭐⭐⭐⭐ 4 estrellas</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 estrellas</option>
              </select>
              {errors.rating && <p className="text-red-500 text-sm mt-2">⚠️ {errors.rating}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Etiquetas</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="Ej: fe, esperanza, familia (separadas por comas)"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all h-32 resize-none"
                placeholder="Descripción del libro..."
              />
            </div>

            {/* Detalles de Publicación */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">📅 Detalles de Publicación</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Editorial</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="Nombre de la editorial"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Fecha de Publicación</label>
              <input
                type="date"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Idioma</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              >
                <option value="Español">🇪🇸 Español</option>
                <option value="Inglés">🇺🇸 Inglés</option>
                <option value="Francés">🇫🇷 Francés</option>
                <option value="Portugués">🇧🇷 Portugués</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Páginas</label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="Número de páginas"
              />
            </div>

            {/* Formato y Audiencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Formato</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              >
                <option value="Físico">📚 Físico</option>
                <option value="Digital">💻 Digital</option>
                <option value="Ambos">📚💻 Ambos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Audiencia Objetivo</label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              >
                <option value="Cristianos adultos">👥 Cristianos adultos</option>
                <option value="Jóvenes cristianos">🌟 Jóvenes cristianos</option>
                <option value="Niños">👶 Niños</option>
                <option value="Familias">👨‍👩‍👧‍👦 Familias</option>
                <option value="Líderes">👑 Líderes</option>
                <option value="Todos">🌍 Todos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Nivel de Dificultad</label>
              <select
                name="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              >
                <option value="Básico">🟢 Básico</option>
                <option value="Intermedio">🟡 Intermedio</option>
                <option value="Avanzado">🔴 Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Moneda</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              >
                <option value="USD">💵 USD</option>
                <option value="EUR">💶 EUR</option>
                <option value="MXN">💸 MXN</option>
                <option value="COP">💰 COP</option>
              </select>
            </div>

            {/* URLs de Tiendas */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">🛒 Enlaces de Compra</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Amazon</label>
              <input
                type="url"
                name="amazonUrl"
                value={formData.amazonUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://amazon.com/..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Kindle</label>
              <input
                type="url"
                name="kindleUrl"
                value={formData.kindleUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://amazon.com/kindle/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Apple Books</label>
              <input
                type="url"
                name="appleBooksUrl"
                value={formData.appleBooksUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://books.apple.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Google Books</label>
              <input
                type="url"
                name="googleBooksUrl"
                value={formData.googleBooksUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://books.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre Otra Tienda</label>
              <input
                type="text"
                name="otherStoreName"
                value={formData.otherStoreName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="Nombre de otra tienda"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Otra Tienda</label>
              <input
                type="url"
                name="otherStoreUrl"
                value={formData.otherStoreUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://otratienda.com/..."
              />
            </div>

            {/* Precios */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">💰 Información de Precios</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Precio</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Precio con Descuento</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="0.00"
              />
            </div>

            {/* Imágenes */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">🖼️ Imágenes</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Imagen de Portada</label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">URL Miniatura</label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                placeholder="https://ejemplo.com/miniatura.jpg"
              />
            </div>

            {/* Información del Ministerio */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">⛪ Reseña del Ministerio</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Reseña del Ministerio</label>
              <textarea
                name="ministryReview"
                value={formData.ministryReview}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all h-24 resize-none"
                placeholder="¿Qué piensa el ministerio sobre este libro?"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Razón de Recomendación</label>
              <textarea
                name="recommendationReason"
                value={formData.recommendationReason}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all h-24 resize-none"
                placeholder="¿Por qué recomiendan este libro?"
              />
            </div>
          </div>
          
          {/* Estados y opciones */}
          <div className="flex gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">📚 Disponible</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="font-medium text-gray-700">⭐ Destacado</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isRecommended"
                checked={formData.isRecommended}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="font-medium text-gray-700">👍 Recomendado</span>
            </label>
          </div>
          
          {/* Admin Information Display */}
          {currentAdmin && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-2">👤 Información del Administrador</h4>
              <p className="text-sm text-gray-600">
                {book ? 'Modificado por:' : 'Creado por:'} {currentAdmin.name || currentAdmin.email}
              </p>
            </div>
          )}
          
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              {book ? '✅ Actualizar Libro' : '📚 Crear Libro'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white px-6 py-4 rounded-xl hover:bg-gray-600 transition-all font-semibold"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;