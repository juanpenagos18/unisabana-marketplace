import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../hooks/useApi';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ backgroundColor: color + '20' }}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  </div>
);

// T49 — Panel de Administrador UI
const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]       = useState('stats');
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null); // { productId, reason }
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg]       = useState('');

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/reports?status=pendiente'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setReports(reportsRes.data.reports);
    } catch { }
    finally { setLoading(false); }
  };

  const handleSuspend = async (userId) => {
    setActionLoading(true);
    try {
      const res = await API.patch(`/admin/users/${userId}/suspend`);
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, isSuspended: res.data.user.isSuspended } : u
      ));
      flash(res.data.user.isSuspended ? 'Usuario suspendido' : 'Usuario reactivado');
    } catch (err) { flash(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  // T50 — Eliminar producto reportado
  const handleDeleteProduct = async () => {
    if (!deleteReason.trim()) return;
    setActionLoading(true);
    try {
      await API.delete(`/admin/products/${deleteModal}`, { data: { adminReason: deleteReason } });
      setReports(prev => prev.filter(r => r.targetId !== deleteModal));
      setDeleteModal(null);
      setDeleteReason('');
      flash('Producto eliminado y vendedor notificado');
    } catch (err) { flash(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  const handleDismissReport = async (reportId) => {
    setActionLoading(true);
    try {
      await API.patch(`/admin/reports/${reportId}`, { status: 'revisado', adminNote: 'Sin acción necesaria' });
      setReports(prev => prev.filter(r => r._id !== reportId));
      flash('Reporte descartado');
    } catch { flash('Error'); }
    finally { setActionLoading(false); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: 'stats',   label: '📊 Métricas' },
    { key: 'users',   label: `👥 Usuarios (${users.length})` },
    { key: 'reports', label: `🚨 Reportes (${reports.length})` },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header admin */}
      <header className="w-full shadow-md mb-6" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)' }}>
              <span className="text-white font-bold text-sm">⚙</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Panel de Administración</p>
              <p className="text-white/60 text-xs">UniSabana Marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')}
              className="text-white/70 hover:text-white text-xs transition-colors">
              ← Volver al marketplace
            </button>
            <button onClick={() => { logout(); navigate('/'); }}
              className="text-red-300 hover:text-red-100 text-xs transition-colors">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pb-12">

        {/* Flash message */}
        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all
                ${tab === t.key ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              style={tab === t.key ? { backgroundColor: 'var(--color-primary)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* ── MÉTRICAS ────────────────────────────────────────────────── */}
            {tab === 'stats' && stats && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard icon="👥" label="Usuarios totales"   value={stats.totalUsers}      color="#1B2D6B" />
                  <StatCard icon="📦" label="Productos totales"  value={stats.totalProducts}    color="#C9A84C" />
                  <StatCard icon="🛒" label="Órdenes totales"    value={stats.totalOrders}      color="#10B981" />
                  <StatCard icon="✨" label="Productos activos"  value={stats.activeProducts}   color="#3B82F6" />
                  <StatCard icon="🆕" label="Nuevos esta semana" value={stats.newUsersThisWeek} color="#8B5CF6" />
                  <StatCard icon="🚨" label="Reportes pendientes" value={stats.pendingReports}  color="#EF4444" />
                </div>

                {/* Acceso rápido a reportes si hay pendientes */}
                {stats.pendingReports > 0 && (
                  <div className="card flex items-center justify-between gap-4"
                    style={{ borderLeft: '4px solid #EF4444' }}>
                    <div>
                      <p className="font-semibold text-sm text-red-600">
                        ⚠️ Hay {stats.pendingReports} reporte{stats.pendingReports > 1 ? 's' : ''} pendiente{stats.pendingReports > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Requieren revisión</p>
                    </div>
                    <button onClick={() => setTab('reports')} className="btn-primary text-sm">
                      Revisar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── USUARIOS ────────────────────────────────────────────────── */}
            {tab === 'users' && (
              <div className="flex flex-col gap-4">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar usuario por nombre o correo..."
                  className="input-base" />

                <div className="flex flex-col gap-2">
                  {filteredUsers.map(u => (
                    <div key={u._id} className="card flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: u.isSuspended ? '#9CA3AF' : 'var(--color-primary)' }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{u.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                            ${u.role === 'admin'   ? 'bg-purple-100 text-purple-700' :
                              u.role === 'seller'  ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'}`}>
                            {u.role}
                          </span>
                          {u.isSuspended && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                              suspendido
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        <p className="text-xs text-gray-300">
                          {new Date(u.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleSuspend(u._id)}
                          disabled={actionLoading}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors flex-shrink-0
                            ${u.isSuspended
                              ? 'border-green-300 text-green-600 hover:bg-green-50'
                              : 'border-red-300 text-red-500 hover:bg-red-50'}`}>
                          {u.isSuspended ? 'Activar' : 'Suspender'}
                        </button>
                      )}
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No se encontraron usuarios</p>
                  )}
                </div>
              </div>
            )}

            {/* ── REPORTES ────────────────────────────────────────────────── */}
            {tab === 'reports' && (
              <div className="flex flex-col gap-3">
                {reports.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center gap-3">
                    <span className="text-6xl">✅</span>
                    <p className="text-gray-500">No hay reportes pendientes</p>
                  </div>
                ) : reports.map(r => (
                  <div key={r._id} className="card flex flex-col gap-3"
                    style={{ borderLeft: '4px solid #EF4444' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                            {r.reportType.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{r.targetType}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{r.reason}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Reportado por <span className="font-medium">{r.reporter?.name}</span> ·{' '}
                          {new Date(r.createdAt).toLocaleDateString('es-CO')}
                        </p>
                        <p className="text-xs font-mono text-gray-300 mt-0.5">
                          ID: {r.targetId}
                        </p>
                      </div>
                    </div>

                    {/* T50 — Acciones de moderación */}
                    <div className="flex gap-2">
                      {r.targetType === 'product' && (
                        <button
                          onClick={() => setDeleteModal(r.targetId)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-red-400 text-red-600
                            hover:bg-red-50 transition-colors font-medium">
                          🗑 Eliminar producto
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissReport(r._id)}
                        disabled={actionLoading}
                        className="text-xs px-3 py-1.5 rounded-xl border border-gray-300 text-gray-500
                          hover:bg-gray-50 transition-colors">
                        Descartar reporte
                      </button>
                      {r.targetType === 'product' && (
                        <a href={`/products/${r.targetId}`} target="_blank" rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-xl border border-blue-300 text-blue-500
                            hover:bg-blue-50 transition-colors">
                          Ver producto ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* T50 — Modal de confirmación de eliminación */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: 'white' }}>
            <h3 className="font-bold text-lg text-red-600">⚠️ Eliminar producto</h3>
            <p className="text-sm text-gray-500">
              Esta acción desactivará el producto y notificará al vendedor. Escribe la razón:
            </p>
            <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
              placeholder="Razón de la eliminación (obligatorio)..." rows={3}
              className="input-base resize-none text-sm" />
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(null); setDeleteReason(''); }}
                className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleDeleteProduct}
                disabled={!deleteReason.trim() || actionLoading}
                className="flex-1 py-2 rounded-xl font-bold text-sm text-white bg-red-500
                  hover:bg-red-600 transition-colors disabled:opacity-40">
                {actionLoading ? 'Eliminando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
