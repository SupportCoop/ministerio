import React from 'react';
import { Instagram, Youtube, Facebook } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-media-links">
        <a href="https://www.instagram.com/pastorayprofetaawildamota/" target="_blank" rel="noopener noreferrer">
          <Instagram size={24} />
        </a>
        <a href="https://www.youtube.com/@AwildaMotaOficial" target="_blank" rel="noopener noreferrer">
          <Youtube size={24} />
        </a>
        <a href="https://www.facebook.com/pastoraawildamota" target="_blank" rel="noopener noreferrer">
          <Facebook size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;