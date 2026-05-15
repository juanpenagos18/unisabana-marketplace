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
  const bottomRef  = useRef(null);
  const pollRef    = useRef(null);
  const inputRef   = useRef(null);

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams({ contactId });
      if (productId) params.append('productId', productId);
      const res = await API.get(`/messages/conversation?${params}`);
      setMessages(res.data.messages);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!contactId) return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [contactId, productId]);

  // Fix scroll móvil — usa scrollIntoView con behavior instant en móvil
  useEffect(() => {
    if (!bottomRef.current) return;
    const isMobile = window.innerWidth < 768;
    bottomRef.current.scrollIntoView({
      behavior: isMobile ? 'instant' : 'smooth',
      block: 'end',
    });
  }, [messages]);

  // Fix teclado móvil — cuando aparece el teclado virtual, hace scroll al fondo
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

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
      await loadMessages();
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const myId = user?.id || user?._id;

  return (
    <Layout user={user} onLogout={handleLogout}>
      {/* Altura fija que respeta el header y el teclado virtual */}
      <div className="max-w-lg mx-auto flex flex-col"
        style={{ height: 'calc(100dvh - 130px)', minHeight: '400px' }}>

        {/* Header del chat */}
        <div className="flex items-center gap-3 pb-3 mb-2 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => navigate('/chats')}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none">‹</button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {contactName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{contactName}</p>
            {/* Contexto del producto — fix: muestra el producto sobre el que se pregunta */}
            {productTitle && (
              <p className="text-xs truncate" style={{ color: 'var(--color-accent)' }}>
                📦 Preguntando sobre: {productTitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-gray-400 hidden sm:block">En vivo</span>
          </div>
        </div>

        {/* Área de mensajes — scroll interno */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 py-2 pr-1 overscroll-contain">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 rounded-full animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
              <span className="text-3xl">👋</span>
              <p>Sé el primero en escribir</p>
              {productTitle && (
                <p className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl">
                  📦 {productTitle}
                </p>
              )}
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.sender._id === myId ||
                           msg.sender._id?.toString() === myId?.toString();
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.optimistic ? 'opacity-60' : 'opacity-100'}
                    ${isMe ? 'rounded-tr-sm text-white' : 'rounded-tl-sm text-gray-800'}`}
                    style={{
                      backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                      border: isMe ? 'none' : '1px solid var(--color-border)',
                    }}>
                    <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-CO', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                      {msg.optimistic && ' · enviando...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} className="h-1" />
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-3 border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 input-base text-sm"
            disabled={sending}
            autoComplete="off"
          />
          <button onClick={handleSend} disabled={sending || !input.trim()}
            className="px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'white', border: '2px solid black', color: 'black', minWidth: '64px' }}>
            {sending ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationPage;
