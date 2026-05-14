import React, { useState } from 'react';
import API from '../hooks/useApi';

const REPORT_TYPES = [
  { value: 'spam',                 label: 'Spam o publicidad falsa' },
  { value: 'fraude',               label: 'Fraude o estafa' },
  { value: 'contenido_inapropiado',label: 'Contenido inapropiado' },
  { value: 'precio_abusivo',       label: 'Precio abusivo' },
  { value: 'otro',                 label: 'Otro' },
];

// T48 — Modal para reportar contenido sospechoso
const ReportModal = ({ targetId, targetType, onClose }) => {
  const [reportType, setReportType] = useState('');
  const [reason, setReason]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!reportType || !reason.trim())
      return setError('Selecciona un tipo y describe el problema.');
    try {
      setLoading(true);
      await API.post('/reports', { targetId, targetType, reportType, reason });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el reporte.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}>

        {success ? (
          <div className="text-center py-4 flex flex-col items-center gap-3">
            <span className="text-5xl">✅</span>
            <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              Reporte enviado
            </p>
            <p className="text-sm text-gray-400">El equipo lo revisará pronto.</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-primary)',
                fontFamily: 'Playfair Display, serif' }}>
                Reportar contenido
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Ayúdanos a mantener la comunidad segura
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map(rt => (
                <button key={rt.value} onClick={() => setReportType(rt.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors
                    ${reportType === rt.value ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-700'}`}
                  style={reportType === rt.value ? { backgroundColor: 'var(--color-primary)' } : {}}>
                  {rt.label}
                </button>
              ))}
            </div>

            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Describe el problema con más detalle..." rows={3}
              className="input-base resize-none text-sm" />

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1" disabled={loading}>Cancelar</button>
              <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
