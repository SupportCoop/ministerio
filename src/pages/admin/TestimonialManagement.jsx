import React, { useState, useEffect } from 'react';
import testimonialService from '../../services/testimonialService';
import './TestimonialManagement.css';

const TestimonialManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await testimonialService.getAllTestimonials();
      setTestimonials(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Error al cargar los testimonios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      try {
        await testimonialService.deleteTestimonial(id);
        setTestimonials(testimonials.filter((t) => t.testimonyID !== id));
      } catch (err) {
        setError('Error al eliminar el testimonio.');
        console.error(err);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await testimonialService.approveTestimonial(id);
      // Refresh the list to show the updated status
      loadTestimonials();
    } catch (err) {
      setError('Error al aprobar el testimonio.');
      console.error(err);
    }
  };

  if (loading) return <div>Cargando testimonios...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="testimonial-management-container">
      <h1>Gestión de Testimonios</h1>
      <div className="testimonials-list">
        {testimonials.map((testimonial) => (
          <div key={testimonial.testimonyID} className={`testimonial-item ${testimonial.isApproved ? 'approved' : 'pending'}`}>
            <div className="testimonial-details">
              <p><strong>{testimonial.name}</strong> - <span>{testimonial.title}</span></p>
              <p>{testimonial.content}</p>
              <small>Enviado: {new Date(testimonial.createdAt).toLocaleString()}</small>
              {testimonial.isApproved && (
                <small>Aprobado: {new Date(testimonial.approvedAt).toLocaleString()} por Admin ID: {testimonial.approvedBy}</small>
              )}
            </div>
            <div className="testimonial-actions">
              {!testimonial.isApproved && (
                <button onClick={() => handleApprove(testimonial.testimonyID)} className="approve-btn">
                  Aprobar
                </button>
              )}
              <button onClick={() => handleDelete(testimonial.testimonyID)} className="delete-btn">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialManagement;