import React, { useEffect, useState } from 'react';
import testimonialService from '../services/testimonialService';
import TestimonialForm from '../components/TestimonialForm';
import './Testimonials.css';
import '../components/TestimonialForm.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialService.getAllTestimonials();
        setTestimonials(data);
      } catch (err) {
        setError('Error al cargar los testimonios.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleTestimonialAdded = (newTestimonial) => {
    // Do not show unapproved testimonials right away
    // setTestimonials([newTestimonial, ...testimonials]);
  };

  if (loading) {
    return <div>Cargando testimonios...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="testimonials-page">
      <TestimonialForm onTestimonialAdded={handleTestimonialAdded} />
      <div className="testimonials-container">
        <h1>Testimonios Aprobados</h1>
        <div className="testimonials-grid">
          {testimonials
            .filter((t) => t.isApproved && t.isPublic)
            .map((testimonial) => (
              <div key={testimonial.testimonyID} className="testimonial-card">
                <p>"{testimonial.content}"</p>
                <h4>- {testimonial.name}</h4>
                <span>{testimonial.title}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;