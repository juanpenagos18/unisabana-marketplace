import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const ChatsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get('/messages/chats');
        setChats(res.data.chats);
      } catch { setChats([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const openChat = (chat) => {
    const params = new URLSearchParams({ contactId: chat.contact._id });
    if (chat.product?._id) params.append('productId', chat.product._id);
    if (chat.product?.title) params.append('productTitle', chat.product.title);
    params.append('contactName', chat.contact.name);
    navigate(`/chats/conversation?${params}`);
  };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-lg mx-auto py-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)',
          fontFamily: 'Playfair Display, serif' }}>
          Mis chats
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <span className="text-6xl">💬</span>
            <p className="text-gray-500">No tienes conversaciones aún.</p>
            <p className="text-sm text-gray-400">
              Entra a un producto y contacta al vendedor para iniciar un chat.
            </p>
            <button onClick={() => navigate('/home')} className="btn-primary mt-2">
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {chats.map(chat => (
              <button key={chat.key} onClick={() => openChat(chat)}
                className="card text-left flex gap-3 items-center hover:shadow-md transition-shadow">
                {/* Avatar contacto */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  {chat.contact.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{chat.contact.name}</p>
                    <p className="text-[10px] text-gray-400 flex-shrink-0">
                      {new Date(chat.lastAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  {chat.product && (
                    <p className="text-[11px] font-medium truncate" style={{ color: 'var(--color-accent)' }}>
                      📦 {chat.product.title}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 truncate mt-0.5">{chat.lastMessage}</p>
                </div>

                {/* Badge mensajes no leídos */}
                {chat.unread > 0 && (
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatsPage;
