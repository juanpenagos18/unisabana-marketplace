import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminReviewCard from '../components/AdminReviewCard';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import API from '../hooks/useApi';

const CATEGORIES = [
  'Académico','Tecnología','Hogar','Moda','Comida',
  'Transporte','Entretenimiento','Deporte','Cuidado Personal','Servicios','Otros',
];

const COLORS = ['#1B2D6B','#C9A84C','#10B981','#3B82F6','#8B5CF6',
                '#EF4444','#F59E0B','#06B6D4','#EC4899','#84CC16','#6366F1'];

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ backgroundColor: color+'20' }}>{icon}</div>
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  </div>
);

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState('stats');
  const [stats, setStats]       = useState(null);
  const [charts, setCharts]     = useState(null);
  const [users, setUsers]       = useState([]);
  const [reports, setReports]   = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Filtros usuarios
  const [userSearch, setUserSearch] = useState('');
  // Filtros productos
  const [prodSearch, setProdSearch]   = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStatus, setProdStatus]   = useState('');

  // Modales
  const [deleteModal, setDeleteModal]   = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  // Vista productos de un usuario
  const [userProducts, setUserProducts] = useState(null); // { user, products }

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes, prodsRes, reviewsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/reports?status=pendiente'),
        API.get('/admin/products'),
        API.get('/admin/reviews'),
      ]);
      setStats(statsRes.data.stats);
      setCharts(statsRes.data.charts);
      setUsers(usersRes.data.users);
      setReports(reportsRes.data.reports);
      setProducts(prodsRes.data.products);
      setReviews(reviewsRes.data.reviews);
    } catch {}
    finally { setLoading(false); }
  };

  const loadProducts = async () => {
    const params = new URLSearchParams();
    if (prodSearch)   params.append('search',   prodSearch);
    if (prodCategory) params.append('category', prodCategory);
    if (prodStatus)   params.append('status',   prodStatus);
    const res = await API.get(`/admin/products?${params}`);
    setProducts(res.data.products);
  };

  // Ver productos de un vendedor
  const handleViewUserProducts = async (u) => {
    try {
      const res = await API.get(`/admin/users/${u._id}/products`);
      setUserProducts({ user: u, products: res.data.products });
    } catch { flash('Error cargando productos'); }
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

  const handleToggleProduct = async (productId) => {
    setActionLoading(true);
    try {
      const res = await API.patch(`/admin/products/${productId}/toggle`);
      const updated = res.data.product;
      setProducts(prev => prev.map(p =>
        p._id === productId ? { ...p, isActive: updated.isActive } : p
      ));
      flash(updated.isActive ? 'Producto activado' : 'Producto desactivado');
    } catch { flash('Error'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteReview = async (reviewId) => {
  if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;
  setActionLoading(true);
  try {
    await API.delete(`/admin/reviews/${reviewId}`);
    setReviews(prev => prev.filter(r => r._id !== reviewId));
    flash('Reseña eliminada');
  } catch { flash('Error al eliminar'); }
  finally { setActionLoading(false); }
};

  const handleDeleteProduct = async () => {
    if (!deleteReason.trim()) return;
    setActionLoading(true);
    try {
      await API.delete(`/admin/products/${deleteModal}`, { data: { adminReason: deleteReason } });
      setProducts(prev => prev.map(p => p._id === deleteModal ? { ...p, isActive: false } : p));
      setReports(prev => prev.filter(r => r.targetId !== deleteModal));
      setDeleteModal(null); setDeleteReason('');
      flash('Producto eliminado y vendedor notificado');
    } catch (err) { flash(err.response?.data?.message || 'Error'); }
    finally { setActionLoading(false); }
  };

  const handleDismissReport = async (reportId) => {
    setActionLoading(true);
    try {
      await API.patch(`/admin/reports/${reportId}`, { status: 'revisado', adminNote: 'Sin acción' });
      setReports(prev => prev.filter(r => r._id !== reportId));
      flash('Reporte descartado');
    } catch { flash('Error'); }
    finally { setActionLoading(false); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const TABS = [
    { key: 'stats',    label: '📊 Métricas' },
    { key: 'users',    label: `👥 Usuarios (${users.length})` },
    { key: 'products', label: `📦 Productos (${products.length})` },
    { key: 'reports',  label: `🚨 Reportes (${reports.length})` },
    { key: 'reviews',  label: `⭐ Reseñas (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="w-full shadow-md mb-6" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)' }}>
              <span className="text-white font-bold">⚙</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Panel de Administración</p>
              <p className="text-white/60 text-xs">UniSabana Marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/home')} className="text-white/70 hover:text-white text-xs">
              ← Marketplace
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="text-red-300 hover:text-red-100 text-xs">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}>{msg}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl overflow-x-auto"
          style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
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
            {/* ── MÉTRICAS + GRÁFICOS ──────────────────────────────────── */}
            {tab === 'stats' && stats && (
              <div className="flex flex-col gap-6">
                {/* Tarjetas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatCard icon="👥" label="Usuarios"        value={stats.totalUsers}       color="#1B2D6B" />
                  <StatCard icon="📦" label="Productos"       value={stats.totalProducts}    color="#C9A84C" />
                  <StatCard icon="🛒" label="Órdenes"         value={stats.totalOrders}      color="#10B981" />
                  <StatCard icon="✨" label="Activos"         value={stats.activeProducts}   color="#3B82F6" />
                  <StatCard icon="🆕" label="Nuevos/semana"   value={stats.newUsersThisWeek} color="#8B5CF6" />
                  <StatCard icon="🚨" label="Reportes"        value={stats.pendingReports}   color="#EF4444" />
                </div>

                {/* Gráfico de barras — productos por categoría */}
                {charts?.categoryAgg?.length > 0 && (
                  <div className="card">
                    <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--color-primary)' }}>
                      📊 Productos por categoría
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={charts.categoryAgg.map(d => ({ name: d._id, value: d.count }))}
                        margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Productos" radius={[6,6,0,0]}>
                          {charts.categoryAgg.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gráfico de línea — nuevos usuarios por día */}
                  {charts?.dailyAgg?.length > 0 && (
                    <div className="card">
                      <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--color-primary)' }}>
                        📈 Nuevos usuarios (7 días)
                      </h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={charts.dailyAgg.map(d => ({ date: d._id.slice(5), usuarios: d.count }))}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="usuarios" stroke="#1B2D6B"
                            strokeWidth={2} dot={{ fill: '#C9A84C', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Gráfico de dona — distribución de roles */}
                  {charts?.roleAgg?.length > 0 && (
                    <div className="card flex flex-col">
                      <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--color-primary)' }}>
                        🍩 Distribución de roles
                      </h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={charts.roleAgg.map(d => ({ name: d._id, value: d.count }))}
                            cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                            paddingAngle={3} dataKey="value" label={({ name, percent }) =>
                              `${name} ${(percent*100).toFixed(0)}%`}
                            labelLine={false}>
                            {charts.roleAgg.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {stats.pendingReports > 0 && (
                  <div className="card flex items-center justify-between gap-4"
                    style={{ borderLeft: '4px solid #EF4444' }}>
                    <div>
                      <p className="font-semibold text-sm text-red-600">
                        ⚠️ {stats.pendingReports} reporte{stats.pendingReports>1?'s':''} pendiente{stats.pendingReports>1?'s':''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Requieren revisión</p>
                    </div>
                    <button onClick={() => setTab('reports')} className="btn-primary text-sm">Revisar</button>
                  </div>
                )}
              </div>
            )}

            {/* ── USUARIOS ─────────────────────────────────────────────── */}
            {tab === 'users' && (
              <>
                {userProducts ? (
                  /* Vista de productos del usuario */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setUserProducts(null)} className="btn-secondary text-sm">
                        ← Volver
                      </button>
                      <div>
                        <h3 className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          Productos de {userProducts.user.name}
                        </h3>
                        <p className="text-xs text-gray-400">{userProducts.user.email}</p>
                      </div>
                    </div>
                    {userProducts.products.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">Este usuario no tiene productos</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {userProducts.products.map(p => (
                          <div key={p._id} className="card flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                : <span className="text-xl">📦</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{p.title}</p>
                              <p className="text-xs text-gray-400">{p.category} · {p.condition} · Stock: {p.stock}</p>
                              <p className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                                ${p.price.toLocaleString('es-CO')}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center
                                ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {p.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                              <button onClick={() => handleToggleProduct(p._id)}
                                disabled={actionLoading}
                                className="text-xs px-2 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
                                {p.isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Lista de usuarios */
                  <div className="flex flex-col gap-4">
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      placeholder="Buscar por nombre o correo..." className="input-base" />
                    <div className="flex flex-col gap-2">
                      {filteredUsers.map(u => (
                        <div key={u._id} className="card flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: u.isSuspended ? '#9CA3AF' : 'var(--color-primary)' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm truncate">{u.name}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                ${u.role==='admin' ? 'bg-purple-100 text-purple-700' :
                                  u.role==='seller'? 'bg-green-100 text-green-700' :
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
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {(u.role === 'seller') && (
                              <button onClick={() => handleViewUserProducts(u)}
                                className="text-xs px-3 py-1.5 rounded-xl border border-blue-300 text-blue-500 hover:bg-blue-50">
                                Ver productos
                              </button>
                            )}
                            {u.role !== 'admin' && (
                              <button onClick={() => handleSuspend(u._id)} disabled={actionLoading}
                                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors
                                  ${u.isSuspended
                                    ? 'border-green-300 text-green-600 hover:bg-green-50'
                                    : 'border-red-300 text-red-500 hover:bg-red-50'}`}>
                                {u.isSuspended ? 'Activar' : 'Suspender'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No se encontraron usuarios</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── PRODUCTOS ────────────────────────────────────────────── */}
            {tab === 'products' && (
              <div className="flex flex-col gap-4">
                {/* Filtros */}
                <div className="flex gap-2 flex-wrap">
                  <input value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                    placeholder="Buscar por nombre..." className="input-base flex-1 min-w-40" />
                  <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                    className="input-base">
                    <option value="">Todas las categorías</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={prodStatus} onChange={e => setProdStatus(e.target.value)}
                    className="input-base">
                    <option value="">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                  <button onClick={loadProducts} className="btn-primary text-sm">Buscar</button>
                </div>

                <div className="flex flex-col gap-2">
                  {products.map(p => (
                    <div key={p._id} className="card flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          : <span className="text-xl">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">
                          {p.category} · {p.condition} · Stock: {p.stock}
                        </p>
                        <p className="text-xs text-gray-400">
                          Vendedor: <span className="font-medium">{p.seller?.name}</span>
                        </p>
                        <p className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                          ${p.price.toLocaleString('es-CO')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center
                          ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <button onClick={() => handleToggleProduct(p._id)} disabled={actionLoading}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                          {p.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => setDeleteModal(p._id)}
                          className="text-xs px-2 py-1 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-center text-gray-400 py-8">No se encontraron productos</p>
                  )}
                </div>
              </div>
            )}

            {/* ── REPORTES ─────────────────────────────────────────────── */}
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
                            {r.reportType.replace('_',' ')}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{r.targetType}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{r.reason}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Por <span className="font-medium">{r.reporter?.name}</span> ·{' '}
                          {new Date(r.createdAt).toLocaleDateString('es-CO')}
                        </p>
                        <p className="text-xs font-mono text-gray-300 mt-0.5">ID: {r.targetId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {r.targetType === 'product' && (
                        <button onClick={() => setDeleteModal(r.targetId)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-red-400 text-red-600 hover:bg-red-50 font-medium">
                          🗑 Eliminar producto
                        </button>
                      )}
                      <button onClick={() => handleDismissReport(r._id)} disabled={actionLoading}
                        className="text-xs px-3 py-1.5 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50">
                        Descartar
                      </button>
                      {r.targetType === 'product' && (
                        <a href={`/products/${r.targetId}`} target="_blank" rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-xl border border-blue-300 text-blue-500 hover:bg-blue-50">
                          Ver producto ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="flex flex-col gap-3">
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No hay reseñas registradas</p>
                ) : reviews.map(r => (
                  <AdminReviewCard
                    key={r._id}
                    review={r}
                    onDelete={handleDeleteReview}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal eliminar producto */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: 'white' }}>
            <h3 className="font-bold text-lg text-red-600">⚠️ Eliminar producto</h3>
            <p className="text-sm text-gray-500">Escribe la razón de la eliminación:</p>
            <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
              placeholder="Razón obligatoria..." rows={3} className="input-base resize-none text-sm" />
            <div className="flex gap-3">
              <button onClick={() => { setDeleteModal(null); setDeleteReason(''); }}
                className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleDeleteProduct}
                disabled={!deleteReason.trim() || actionLoading}
                className="flex-1 py-2 rounded-xl font-bold text-sm text-white bg-red-500
                  hover:bg-red-600 disabled:opacity-40">
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
