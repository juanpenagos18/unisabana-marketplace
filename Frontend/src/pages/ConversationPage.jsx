import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import API from '../hooks/useApi';

const ConversationPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const contactId    = searchParams.get('contactId');
  const productId    = searchParams.get('productId');
  const productTitle = searchParams.get('productTitle');
  const contactName  = searchParams.get('contactName') || 'Contacto';

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams({ contactId });
      if (productId) params.append('productId', productId);
      const res = await API.get(`/messages/conversation?${params}`);
      setMessages(res.data.messages);
    } catch {}
    finally { setLoading(false); }
  };

  // T44 — Polling: recarga mensajes cada 3 segundos
  useEffect(() => {
    if (!contactId) return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [contactId, productId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // T41 — Enviar mensaje
  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update — muestra el mensaje antes de la respuesta del servidor
    const optimistic = {
      _id: `temp-${Date.now()}`,
      sender: { _id: user.id, name: user.name },
      content,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await API.post('/messages', { receiverId: contactId, productId, content });
      await loadMessages(); // recarga para quitar el optimista y tener el real
    } catch {
      // Si falla, quita el mensaje optimista
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setInput(content);
    } finally { setSending(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-lg mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>

        {/* Header del chat */}
        <div className="flex items-center gap-3 pb-4 mb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => navigate('/chats')} className="text-gray-400 hover:text-gray-600 text-xl">‹</button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {contactName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{contactName}</p>
            {productTitle && (
              <p className="text-xs truncate" style={{ color: 'var(--color-accent)' }}>
                📦 {productTitle}
              </p>
            )}
          </div>
          {/* T44 — Indicador de polling activo */}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-gray-400">En vivo</span>
          </div>
        </div>

        {/* Área de mensajes — T43 Burbujas */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 py-2 pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p className="text-3xl mb-2">👋</p>
              <p>Sé el primero en escribir</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.sender._id === user.id || msg.sender._id?.toString() === user.id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.optimistic ? 'opacity-60' : 'opacity-100'}
                    ${isMe
                      ? 'rounded-tr-sm text-white'
                      : 'rounded-tl-sm text-gray-800'}`}
                    style={{
                      backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      border: isMe ? 'none' : '1px solid var(--color-border)',
                    }}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      {msg.optimistic && ' · enviando...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input de mensaje — T43 botón con borde negro */}
        <div className="flex gap-2 pt-3 border-t mt-2" style={{ borderColor: 'var(--color-border)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 input-base text-sm"
            disabled={sending}
          />
          <button onClick={handleSend} disabled={sending || !input.trim()}
            className="px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'white', border: '2px solid black', color: 'black',
              minWidth: '60px' }}>
            {sending ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationPage;
