import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import adminAuthService from '../../services/adminAuth';
import { Settings, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const Configuration = () => {
  const [config, setConfig] = useState({
    welcomeTitle: '',
    welcomeDescription: '',
    annualEvents: '',
    yearsServing: '',
    siteName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminAuthService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadConfiguration();
  }, [navigate]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas existentes
      const statsResponse = await apiService.getStatistics();
      const stats = statsResponse.data || [];
      
      // Convertir array a objeto
      const statsObject = {};
      stats.forEach(stat => {
        if (stat.statName && stat.statValue) {
          statsObject[stat.statName] = stat.statValue;
        }
      });

      setConfig({
        welcomeTitle: statsObject.welcome_title || 'Bienvenido a Nuestro Ministerio',
        welcomeDescription: statsObject.welcome_description || 'Somos una comunidad de fe comprometida con el crecimiento espiritual.',
        annualEvents: statsObject.annual_events || '50',
        yearsServing: statsObject.years_serving || '15',
        siteName: statsObject.site_name || 'Ministerio',
        contactEmail: statsObject.contact_email || '',
        contactPhone: statsObject.contact_phone || ''
      });
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Mapear configuración a estadísticas
      const statsToUpdate = [
        { statName: 'welcome_title', statValue: config.welcomeTitle },
        { statName: 'welcome_description', statValue: config.welcomeDescription },
        { statName: 'annual_events', statValue: config.annualEvents },
        { statName: 'years_serving', statValue: config.yearsServing },
        { statName: 'site_name', statValue: config.siteName },
        { statName: 'contact_email', statValue: config.contactEmail },
        { statName: 'contact_phone', statValue: config.contactPhone }
      ];

      // Actualizar cada estadística
      for (const stat of statsToUpdate) {
        try {
          // Intentar actualizar si existe
          await apiService.updateStatistic(stat.statName, stat.statValue);
        } catch (error) {
          // Si no existe, crear nueva
          await apiService.createStatistic({
            statName: stat.statName,
            statValue: stat.statValue,
            statDescription: `Configuración: ${stat.statName}`
          });
        }
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restablecer la configuración por defecto?')) {
      setConfig({
        welcomeTitle: 'Bienvenido a Nuestro Ministerio',
        welcomeDescription: 'Somos una comunidad de fe comprometida con el crecimiento espiritual y el servicio a nuestro prójimo.',
        annualEvents: '50',
        yearsServing: '15',
        siteName: 'Ministerio',
        contactEmail: '',
        contactPhone: ''
      });
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      paddingTop: '6rem'
    },
    header: {
      background: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '2rem 0'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    backButton: {
      background: '#f1f5f9',
      border: 'none',
      padding: '0.75rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#64748b'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    headerActions: {
      display: 'flex',
      gap: '1rem'
    },
    resetButton: {
      background: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    saveButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    main: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    },
    section: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1.5rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      transition: 'border-color 0.3s'
    },
    description: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginTop: '0.25rem'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      fontSize: '1.1rem',
      color: '#64748b'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button 
              onClick={() => navigate('/admin')} 
              style={styles.backButton}
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            <h1 style={styles.title}>
              <Settings size={32} color="#667eea" />
              Configuración del Sistema
            </h1>
          </div>
          <div style={styles.headerActions}>
            <button 
              onClick={handleReset}
              style={styles.resetButton}
            >
              <RefreshCw size={20} />
              Restablecer
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              <Save size={20} />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>Cargando configuración...</div>
        ) : (
          <>
            {/* Configuración de la página principal */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Página Principal</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Título de Bienvenida</label>
                <input
                  type="text"
                  value={config.welcomeTitle}
                  onChange={(e) => setConfig({...config, welcomeTitle: e.target.value})}
                  style={styles.input}
                  placeholder="Título principal del sitio"
                />
                <div style={styles.description}>
                  Este texto aparece como título principal en la página de inicio
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción de Bienvenida</label>
                <textarea
                  value={config.welcomeDescription}
                  onChange={(e) => setConfig({...config, welcomeDescription: e.target.value})}
                  style={styles.textarea}
                  placeholder="Descripción del ministerio"
                />
                <div style={styles.description}>
                  Descripción que aparece debajo del título en la página de inicio
                </div>
              </div>
            </div>

            {/* Estadísticas del sitio */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Estadísticas del Ministerio</h2>
              
              <div style={styles.grid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Eventos Anuales</label>
                  <input
                    type="number"
                    value={config.annualEvents}
                    onChange={(e) => setConfig({...config, annualEvents: e.target.value})}
                    style={styles.input}
                    placeholder="50"
                  />
                  <div style={styles.description}>
                    Número aproximado de eventos por año
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Años de Servicio</label>
                  <input
                    type="number"
                    value={config.yearsServing}
                    onChange={(e) => setConfig({...config, yearsServing: e.target.value})}
                    style={styles.input}
                    placeholder="15"
                  />
                  <div style={styles.description}>
                    Años que lleva el ministerio en funcionamiento
                  </div>
                </div>
              </div>
            </div>

            {/* Información general */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Información General</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Sitio</label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({...config, siteName: e.target.value})}
                  style={styles.input}
                  placeholder="Ministerio"
                />
                <div style={styles.description}>
                  Nombre que aparece en el header del sitio
                </div>
              </div>

              <div style={styles.grid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email de Contacto</label>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                    style={styles.input}
                    placeholder="contacto@ministerio.com"
                  />
                  <div style={styles.description}>
                    Email principal del ministerio
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono de Contacto</label>
                  <input
                    type="tel"
                    value={config.contactPhone}
                    onChange={(e) => setConfig({...config, contactPhone: e.target.value})}
                    style={styles.input}
                    placeholder="809-123-4567"
                  />
                  <div style={styles.description}>
                    Teléfono principal del ministerio
                  </div>
                </div>
              </div>
            </div>

            {/* Información de ayuda */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Información</h2>
              <div style={{ color: '#64748b', lineHeight: '1.6' }}>
                <p>
                  <strong>Configuración del Sistema:</strong> Aquí puedes modificar los textos principales
                  que aparecen en el sitio web, así como las estadísticas del ministerio.
                </p>
                <p>
                  <strong>Cambios:</strong> Los cambios se reflejan inmediatamente en el sitio web
                  después de guardar la configuración.
                </p>
                <p>
                  <strong>Respaldo:</strong> Antes de hacer cambios importantes, considera hacer
                  una copia de la configuración actual.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Configuration;