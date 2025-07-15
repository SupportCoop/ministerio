import React, { useState } from 'react';
import testimonialService from '../services/testimonialService';
import { useAuth } from '../context/AuthContext';

const TestimonialForm = ({ onTestimonialAdded }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !title || !content) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    try {
      const now = new Date().toISOString();
      const newTestimonial = {
        testimonyID: 0,
        userID: user ? user.userID : 0, // Use logged-in user's ID or 0 for anonymous
        name,
        title,
        content,
        isApproved: true,
        isPublic: true,
        imagePath: "",
        createdAt: now,
        approvedAt: now,
        approvedBy: 1, // Approved by admin with ID 1
      };
      const addedTestimonial = await testimonialService.createTestimonial(newTestimonial);
      setSuccess(true);
      setName('');
      setTitle('');
      setContent('');
      if (onTestimonialAdded) {
        // Pass the full object returned by the API
        onTestimonialAdded(addedTestimonial);
      }
    } catch (err) {
      setError('Error al enviar el testimonio.');
      console.error(err);
    }
  };

  return (
    <div className="testimonial-form-container">
      <h2>Deja tu Testimonio</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Testimonio</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Enviar Testimonio</button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">¡Gracias por tu testimonio! Será revisado por un administrador.</p>}
      </form>
    </div>
  );
};

export default TestimonialForm;