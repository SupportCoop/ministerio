import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true);
      const imageFiles = [
        '1.png',
        '2.jpg',

       
        '6.jpg',
        '5.gif'
      ];
      
      const availableImages = [];
      
      for (const file of imageFiles) {
        try {
          const response = await fetch(`/img/${file}`);
          if (response.ok) {
            availableImages.push({
              src: `/img/${file}`,
              alt: `Banner ${availableImages.length + 1}`
            });
          }
        } catch (error) {
          console.log(`Image ${file} not found or could not be loaded.`);
        }
      }
      
      if (availableImages.length === 0) {
        // Fallback a un placeholder más acorde al estilo cristiano
        availableImages.push({
          src: 'https://via.placeholder.com/1400x600/6A0DAD/FFFFFF?text=Fe+%7C+Esperanza+%7C+Amor', // Púrpura profundo con texto blanco
          alt: 'Banner por defecto - Fe, Esperanza, Amor'
        });
      }
      
      setImages(availableImages);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Cambiar cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] mt-[-6rem] md:mt-[-5rem] overflow-hidden rounded-b-3xl shadow-2xl flex items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-600 text-white">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white-500"></div>
          <p className="mt-4 text-xl font-medium text-white opacity-90">Cargando inspiración...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[600px] mt-[-6rem] md:mt-[-5rem] overflow-hidden 
                 rounded-b-3xl shadow-2xl transition-all duration-500 ease-in-out"
      style={{
        // Aumenta el z-index para que el banner se superponga ligeramente al header en los bordes
        // Si el header tiene z-50, esto podría ser z-40 o simplemente dejarlo por defecto si no hay conflicto
        // Generalmente el header debe tener el z-index más alto para estar siempre encima
        // Aquí no necesitas un z-index específico para el banner a menos que se solape con otro contenido
        zIndex: 10 // Inferior al header, pero por encima del contenido principal
      }}
    >
      <div className="relative w-full h-full">
        <img 
          src={images[currentImageIndex].src} 
          alt={images[currentImageIndex].alt}
          className="w-full h-full object-cover transition-transform duration-1000 ease-in-out transform scale-105 hover:scale-100"
        />
        
        {/* Overlay con degradado suave y texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent flex items-center justify-center p-6">
          <div className="text-center text-white max-w-4xl px-4 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
              {currentImageIndex === 0 && "Bienvenido a Nuestro Ministerio"}
              {currentImageIndex === 1 && "Encuentra Paz y Propósito"}
              {currentImageIndex === 2 && "Crece en Fe, Amor y Servicio"}
              {currentImageIndex === 3 && "Eventos que Inspiran y Unen"}
              {currentImageIndex === 4 && "Una Familia en Cristo"}
              {images.length === 1 && "Tu Hogar Espiritual te Espera"} {/* Texto para placeholder */}
            </h2>
            <p className="text-xl md:text-2xl opacity-90 drop-shadow-md leading-relaxed">
              {currentImageIndex === 0 && "Un lugar de fe, amor y comunidad para todos."}
              {currentImageIndex === 1 && "Descubre un camino de esperanza y fortaleza espiritual."}
              {currentImageIndex === 2 && "Juntos, caminando hacia una vida plena en Su gracia."}
              {currentImageIndex === 3 && "Participa en experiencias que nutren el alma."}
              {currentImageIndex === 4 && "Conectando corazones, edificando vidas."}
              {images.length === 1 && "Te invitamos a ser parte de nuestra comunidad, donde la fe se vive y comparte."} {/* Texto para placeholder */}
            </p>
          </div>
        </div>
      </div>

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <button 
            className="absolute top-1/2 left-6 transform -translate-y-1/2 
                       bg-white/80 text-gray-800 p-4 rounded-full shadow-lg 
                       hover:bg-white hover:scale-110 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
            onClick={prevImage}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={30} strokeWidth={2.5} />
          </button>
          
          <button 
            className="absolute top-1/2 right-6 transform -translate-y-1/2 
                       bg-white/80 text-gray-800 p-4 rounded-full shadow-lg 
                       hover:bg-white hover:scale-110 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
            onClick={nextImage}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={30} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Indicadores */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full border-2 border-white transition-all duration-300 ease-in-out
                         ${index === currentImageIndex ? 'bg-white scale-125 shadow-md' : 'bg-white/40 hover:bg-white/70'}`}
              onClick={() => goToImage(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Banner;