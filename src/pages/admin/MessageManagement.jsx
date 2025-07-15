import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Loader, Mail, Trash2, Eye, Send
} from 'lucide-react';
import { toast } from 'react-toastify';
import messageService from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  const { admin } = useAuth();

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedMessages = await messageService.getAllMessages();
      setMessages(fetchedMessages);
      setError(null);
    } catch (err) {
      setError('Error al cargar los mensajes. Intente de nuevo más tarde.');
      toast.error('Error al cargar los mensajes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async (messageId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      try {
        await messageService.deleteMessage(messageId);
        toast.success('Mensaje eliminado con éxito');
        fetchMessages(); // Refresh the list
      } catch (err) {
        toast.error('Error al eliminar el mensaje.');
        console.error(err);
      }
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await messageService.markAsRead(messageId);
      toast.success('Mensaje marcado como leído');
      fetchMessages(); // Refresh the list
    } catch (err) {
      toast.error('Error al marcar como leído.');
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestión de Mensajes</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchMessages}
            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw size={20} />}
          </button>
        </div>
      </header>

      {isLoading && <p className="text-center text-lg">Cargando mensajes...</p>}
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      
      {!isLoading && !error && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="p-4">Nombre</th>
                <th className="p-4">Email</th>
                <th className="p-4">Asunto</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(message => (
                <tr key={message.messageID} className={`border-b border-gray-100 hover:bg-gray-50 ${!message.isRead ? 'font-bold' : ''}`}>
                  <td className="p-4">{message.name}</td>
                  <td className="p-4">{message.email}</td>
                  <td className="p-4">{message.subject}</td>
                  <td className="p-4">{new Date(message.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${message.isRead ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {message.isRead ? 'Leído' : 'No leído'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {!message.isRead && (
                      <button onClick={() => handleMarkAsRead(message.messageID)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors" title="Marcar como leído">
                        <Eye size={20} />
                      </button>
                    )}
                    <button onClick={() => setSelectedMessage(message)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Ver mensaje">
                      <Mail size={20} />
                    </button>
                    <a href={`mailto:${message.email}?subject=RE: ${message.subject}`} className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition-colors" title="Responder">
                      <Send size={20} />
                    </a>
                    <button onClick={() => handleDelete(message.messageID)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" title="Eliminar">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedMessage.subject}</h2>
            <p className="text-sm text-gray-500">De: {selectedMessage.name} ({selectedMessage.email})</p>
            <p className="text-sm text-gray-500">Teléfono: {selectedMessage.phone}</p>
            <p className="text-sm text-gray-500 mb-6">Recibido: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
            <div className="prose max-w-none">
              <p>{selectedMessage.messageContent}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageManagement;