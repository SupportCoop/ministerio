import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import adminAuthService from '../../services/adminAuth';
import { Users, Search, Plus, Edit, Trash2, Shield, ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminAuthService.isAuthenticated()) {
      navigate('/admin');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const updatedUser = { ...user, isActive: !user.isActive };
      await apiService.updateUser(user.userID, updatedUser);
      toast.success(`Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error al actualizar estado del usuario');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      padding: '2rem'
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    searchBox: {
      position: 'relative',
      minWidth: '300px'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem 0.75rem 3rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    statsCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    statLabel: {
      color: '#64748b',
      fontSize: '0.875rem'
    },
    table: {
      width: '100%',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    tableHeader: {
      background: '#f8fafc',
      borderBottom: '1px solid #e5e7eb'
    },
    th: {
      padding: '1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151'
    },
    tr: {
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '1rem'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    activeStatus: {
      background: '#dcfce7',
      color: '#166534'
    },
    inactiveStatus: {
      background: '#fee2e2',
      color: '#dc2626'
    },
    actionButton: {
      background: 'none',
      border: 'none',
      padding: '0.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '0.5rem'
    },
    deleteButton: {
      color: '#ef4444'
    },
    toggleButton: {
      color: '#8b5cf6'
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      fontSize: '1.1rem',
      color: '#64748b'
    },
    noUsers: {
      textAlign: 'center',
      padding: '3rem',
      color: '#64748b'
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

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
            <Users size={32} color="#667eea" />
            Gestión de Usuarios
          </h1>
        </div>
      </header>

      <main style={styles.main}>
        {/* Estadísticas */}
        <div style={styles.statsCards}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{totalUsers}</div>
            <div style={styles.statLabel}>Total Usuarios</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#16a34a'}}>{activeUsers}</div>
            <div style={styles.statLabel}>Usuarios Activos</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statNumber, color: '#dc2626'}}>{inactiveUsers}</div>
            <div style={styles.statLabel}>Usuarios Inactivos</div>
          </div>
        </div>

        {/* Controles */}
        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Tabla de usuarios */}
        {loading ? (
          <div style={styles.loading}>Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.noUsers}>
            {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </div>
        ) : (
          <div style={styles.table}>
            <table style={{ width: '100%' }}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Fecha Registro</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.userID} style={styles.tr}>
                    <td style={styles.td}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                          {user.name || 'Sin nombre'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          ID: {user.userID}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{user.email || 'Sin email'}</td>
                    <td style={styles.td}>{user.phone || 'Sin teléfono'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(user.isActive ? styles.activeStatus : styles.inactiveStatus)
                      }}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={styles.td}>{formatDate(user.createdAt)}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        style={{...styles.actionButton, ...styles.toggleButton}}
                        title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.userID)}
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;