import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import adminAuthService from '../../services/adminAuth';
import { UserPlus, ArrowLeft, Shield, Mail, Phone, User, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const AddAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminAuthService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadAdmins();
  }, [navigate]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdmins();
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdmin({...newAdmin, password});
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('Nombre, email y contraseña son requeridos');
      return;
    }

    if (newAdmin.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setCreating(true);
      
      const adminData = {
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone || null,
        role: newAdmin.role,
        passwordHash: newAdmin.password, // En producción, esto debería hashearse en el backend
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await apiService.createAdmin(adminData);
      toast.success('Administrador creado exitosamente');
      
      // Limpiar formulario
      setNewAdmin({
        name: '',
        email: '',
        phone: '',
        role: 'admin',
        password: ''
      });
      
      // Recargar lista
      loadAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      
      if (error.response && error.response.status === 409) {
        toast.error('Ya existe un administrador con ese email');
      } else {
        toast.error('Error al crear administrador');
      }
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
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
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem'
    },
    formSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      height: 'fit-content'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      paddingLeft: '2.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    inputIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af'
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      paddingLeft: '2.5rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    },
    generateButton: {
      background: '#f59e0b',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      marginTop: '0.5rem'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    adminsList: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    adminCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'all 0.3s'
    },
    adminHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    adminName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1e293b'
    },
    adminRole: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    superAdminRole: {
      background: '#fef3c7',
      color: '#92400e'
    },
    adminRoleStyle: {
      background: '#dbeafe',
      color: '#1e40af'
    },
    adminInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      color: '#64748b',
      fontSize: '0.9rem'
    },
    adminDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      fontSize: '1.1rem',
      color: '#64748b'
    },
    mobileLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '2rem'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            onClick={() => navigate('/admin')} 
            style={styles.backButton}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 style={styles.title}>
            <UserPlus size={32} color="#667eea" />
            Gestión de Administradores
          </h1>
        </div>
      </header>

      <main style={window.innerWidth < 768 ? styles.mobileLayout : styles.main}>
        {/* Formulario para crear admin */}
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>
            <UserPlus size={20} />
            Crear Nuevo Administrador
          </h2>
          
          <form onSubmit={handleCreateAdmin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={16} />
                Nombre Completo *
              </label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  style={styles.input}
                  placeholder="Nombre completo del administrador"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Mail size={16} />
                Email *
              </label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  style={styles.input}
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Phone size={16} />
                Teléfono
              </label>
              <div style={styles.inputWrapper}>
                <Phone size={18} style={styles.inputIcon} />
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                  style={styles.input}
                  placeholder="809-123-4567"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Shield size={16} />
                Rol
              </label>
              <div style={styles.inputWrapper}>
                <Shield size={18} style={styles.inputIcon} />
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                  style={styles.select}
                >
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Administrador</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Contraseña *
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  style={styles.input}
                  placeholder="Contraseña segura"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generatePassword}
                style={styles.generateButton}
              >
                Generar Contraseña Segura
              </button>
            </div>

            <button
              type="submit"
              disabled={creating}
              style={styles.submitButton}
            >
              {creating ? 'Creando...' : (
                <>
                  <Check size={20} />
                  Crear Administrador
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de administradores existentes */}
        <div style={styles.adminsList}>
          <h2 style={styles.sectionTitle}>
            <Shield size={20} />
            Administradores Actuales
          </h2>
          
          {loading ? (
            <div style={styles.loading}>Cargando administradores...</div>
          ) : admins.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
              No hay administradores registrados
            </div>
          ) : (
            admins.map(admin => (
              <div key={admin.adminID} style={styles.adminCard}>
                <div style={styles.adminHeader}>
                  <div style={styles.adminName}>{admin.name}</div>
                  <span style={{
                    ...styles.adminRole,
                    ...(admin.role === 'super_admin' ? styles.superAdminRole : styles.adminRoleStyle)
                  }}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
                <div style={styles.adminInfo}>
                  <div style={styles.adminDetail}>
                    <Mail size={14} />
                    <span>{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div style={styles.adminDetail}>
                      <Phone size={14} />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                  <div style={styles.adminDetail}>
                    <span>Creado: {formatDate(admin.createdAt)}</span>
                  </div>
                  {admin.lastLogin && (
                    <div style={styles.adminDetail}>
                      <span>Último acceso: {formatDate(admin.lastLogin)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AddAdmin;