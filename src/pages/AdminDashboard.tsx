import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import AIAnalisis from '../components/AIAnalisis';
import { FiLogOut, FiMail, FiPhone, FiDollarSign, FiClock, FiUsers, FiBarChart2, FiToggleLeft, FiToggleRight, FiCopy, FiUserPlus, FiTrash2, FiSave, FiLink, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { createMPPreference } from '../lib/mercadopago';

type CotizacionStatus = 'por_atender' | 'en_proceso' | 'atendida' | 'descartada';

interface Cotizacion {
    id: string;
    nombre: string;
    telefono?: string;
    correo: string;
    proyecto: string;
    presupuesto: string;
    descripcion: string;
    createdAt: any;
    referralCodeUsed?: string | null;
    status: CotizacionStatus;
    precioCotizado?: number | null;
    notasAdmin?: string | null;
    linkPago?: string | null;
}

interface Partner {
    id: string;
    email?: string;
    fullName?: string;
    phone?: string;
    isPartner: boolean;
    partnerCode?: string | null;
}

type ActiveTab = 'solicitudes' | 'partners' | 'referidos' | 'facturacion';

const FIREBASE_API_KEY = 'AIzaSyCgPww2i15SPqZncEdWbQaFmN8HpY2CUt0';

export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [selected, setSelected] = useState<Cotizacion | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('solicitudes');
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<CotizacionStatus | 'todas'>('todas');
    const [priceInput, setPriceInput] = useState('');
    const [notasInput, setNotasInput] = useState('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePassword, setInvitePassword] = useState('');
    const [invitePhone, setInvitePhone] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviting, setInviting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }
        fetchAll();
    }, [user, authLoading, navigate]);

    const fetchAll = async () => {
        setDataLoading(true);
        await Promise.all([fetchCotizaciones(), fetchPartners()]);
        setDataLoading(false);
    };

    const fetchCotizaciones = async () => {
        const q = query(collection(db, 'cotizaciones'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setCotizaciones(snap.docs.map(d => ({ id: d.id, ...d.data() } as Cotizacion)));
    };

    const fetchPartners = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setPartners(
            snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Partner))
                .filter(u => !('isAdmin' in u && (u as any).isAdmin))
        );
    };

    const statusConfig: Record<CotizacionStatus, { label: string; color: string; dot: string }> = {
        por_atender: { label: 'Por Atender', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' },
        en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-400' },
        atendida: { label: 'Atendida', color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-400' },
        descartada: { label: 'Descartada', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
    };

    const updateCotizacion = async (id: string, updates: Partial<Cotizacion>) => {
        await updateDoc(doc(db, 'cotizaciones', id), updates);
        setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...updates } : null);
        toast.success('Actualizado.');
    };

    const deleteCotizacion = async (id: string) => {
        if (!confirm('¿Eliminar esta solicitud?')) return;
        await deleteDoc(doc(db, 'cotizaciones', id));
        setCotizaciones(prev => prev.filter(c => c.id !== id));
        if (selected?.id === id) setSelected(null);
        toast.success('Solicitud eliminada.');
    };

    const generatePaymentLink = async () => {
        if (!selected || !selected.precioCotizado) return;
        setGeneratingLink(true);
        try {
            const link = await createMPPreference({
                title: `${selected.proyecto} — MisSolucionesIA`,
                amount: selected.precioCotizado,
                clientEmail: selected.correo,
                externalRef: selected.id,
            });
            await updateCotizacion(selected.id, { linkPago: link });
            navigator.clipboard.writeText(link);
            toast.success('¡Link de pago generado y copiado al portapapeles!');
        } catch (e: any) {
            toast.error(`Error al generar link: ${e.message}`);
        } finally {
            setGeneratingLink(false);
        }
    };

    // Generate a random partner code
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return 'MSI-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    // Create partner using Firebase REST API (doesn't affect current admin session)
    const createPartner = async () => {
        if (!inviteEmail || !invitePassword) { toast.error('Email y contraseña son requeridos.'); return; }
        setInviting(true);
        try {
            // 1. Create auth user via Firebase REST API
            const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, password: invitePassword, returnSecureToken: true })
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error.message);

            const newUid = result.localId;
            const partnerCode = generateCode();

            // 2. Create user profile in Firestore
            await setDoc(doc(db, 'users', newUid), {
                email: inviteEmail,
                fullName: inviteName || null,
                phone: invitePhone || null,
                isAdmin: false,
                isPartner: true,
                partnerCode,
            });

            toast.success(`Partner creado: ${inviteEmail} | Código: ${partnerCode}`);
            setInviteEmail(''); setInvitePassword(''); setInvitePhone(''); setInviteName('');
            setShowInviteForm(false);
            fetchPartners();
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        } finally {
            setInviting(false);
        }
    };

    const togglePartner = async (partner: Partner) => {
        setTogglingId(partner.id);
        const newIsPartner = !partner.isPartner;
        const newCode = newIsPartner ? (partner.partnerCode || generateCode()) : null;
        await updateDoc(doc(db, 'users', partner.id), { isPartner: newIsPartner, partnerCode: newCode });
        fetchPartners();
        setTogglingId(null);
        toast.success(newIsPartner ? `Activado. Código: ${newCode}` : 'Partner desactivado.');
    };

    const deletePartner = async (partner: Partner) => {
        if (!confirm(`¿Eliminar a ${partner.email}?`)) return;
        await deleteDoc(doc(db, 'users', partner.id));
        fetchPartners();
        toast.success('Partner eliminado.');
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Código copiado!');
    };

    const referidosAgrupados = () => {
        const grouped: Record<string, Cotizacion[]> = {};
        const withoutCode: Cotizacion[] = [];
        cotizaciones.forEach(c => {
            if (c.referralCodeUsed) {
                if (!grouped[c.referralCodeUsed]) grouped[c.referralCodeUsed] = [];
                grouped[c.referralCodeUsed].push(c);
            } else withoutCode.push(c);
        });
        return { grouped, withoutCode };
    };

    if (authLoading || dataLoading) return <div className="p-10 text-center">Cargando dashboard...</div>;

    const { grouped, withoutCode } = referidosAgrupados();

    const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
        { key: 'solicitudes', label: 'Solicitudes', icon: <FiMail className="w-4 h-4" /> },
        { key: 'partners', label: 'Partners', icon: <FiUsers className="w-4 h-4" /> },
        { key: 'referidos', label: 'Referidos', icon: <FiBarChart2 className="w-4 h-4" /> },
        { key: 'facturacion', label: 'Facturación', icon: <FiDollarSign className="w-4 h-4" /> },
    ];

    return (
        <div className="flex-1 bg-muted/10 min-h-screen">
            <div className="bg-background border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-2">v2.0 — Firebase ✓</span></h1>
                        <div className="flex gap-1 mt-2">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium">
                        <FiLogOut /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {/* ======= TAB: SOLICITUDES CRM ======= */}
                {activeTab === 'solicitudes' && (() => {
                    const filtered = statusFilter === 'todas' ? cotizaciones : cotizaciones.filter(c => (c.status || 'por_atender') === statusFilter);
                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[82vh]">
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="font-semibold text-lg">Solicitudes</h2>
                                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{filtered.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {(['todas', 'por_atender', 'en_proceso', 'atendida', 'descartada'] as const).map(s => (
                                            <button key={s} onClick={() => setStatusFilter(s)}
                                                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                                                {s === 'todas' ? 'Todas' : statusConfig[s]?.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                                    {filtered.length === 0 ? (
                                        <p className="text-center text-muted-foreground p-4 text-sm">No hay solicitudes en esta categoría.</p>
                                    ) : filtered.map(c => {
                                        const st = statusConfig[c.status || 'por_atender'];
                                        return (
                                            <div key={c.id} className={`flex items-center gap-2 rounded-lg border transition-colors ${selected?.id === c.id ? 'bg-primary/10 border-primary/30' : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'}`}>
                                                <button onClick={() => { setSelected(c); setPriceInput(String(c.precioCotizado ?? '')); setNotasInput(c.notasAdmin ?? ''); }}
                                                    className="flex-1 text-left p-3 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${st?.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${st?.dot}`}></span>{st?.label}
                                                        </span>
                                                        {c.precioCotizado && <span className="text-[10px] text-green-600 font-mono font-bold">${c.precioCotizado.toLocaleString()}</span>}
                                                    </div>
                                                    <p className="font-medium text-sm truncate">{c.nombre}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{c.proyecto}</p>
                                                </button>
                                                <button onClick={() => deleteCotizacion(c.id)} className="p-2 mr-1 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors flex-shrink-0">
                                                    <FiTrash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                {selected ? (
                                    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 lg:p-8 space-y-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div>
                                                <h2 className="text-2xl font-bold">{selected.nombre}</h2>
                                                <p className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">{selected.proyecto}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md flex items-center gap-2">
                                                <FiClock /> {selected.createdAt?.toDate ? selected.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>

                                        {selected.referralCodeUsed && (
                                            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-primary">REFERIDO POR PARTNER:</span>
                                                <span className="font-mono bg-background px-2 py-1 rounded text-sm shadow-sm">{selected.referralCodeUsed}</span>
                                            </div>
                                        )}

                                        {/* CRM Status */}
                                        <div className="bg-muted/40 border border-border rounded-xl p-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Estado</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(Object.keys(statusConfig) as CotizacionStatus[]).map(s => {
                                                    const cfg = statusConfig[s];
                                                    const isActive = (selected.status || 'por_atender') === s;
                                                    return (
                                                        <button key={s} onClick={() => updateCotizacion(selected.id, { status: s })}
                                                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${isActive ? `${cfg.color} shadow-sm scale-105` : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>{cfg.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Price + Notes */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-background border border-border rounded-xl p-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Precio Cotizado (MXN)</p>
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="0.00" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                                                        className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                                    <button onClick={() => updateCotizacion(selected.id, { precioCotizado: priceInput ? parseFloat(priceInput) : null })}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700">
                                                        <FiSave className="w-3.5 h-3.5" /> Guardar
                                                    </button>
                                                </div>
                                                {selected.precioCotizado && <p className="text-2xl font-black text-green-600 mt-2">${selected.precioCotizado.toLocaleString()}</p>}
                                            </div>
                                            <div className="bg-background border border-border rounded-xl p-4">
                                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Notas del Admin</p>
                                                <textarea rows={3} placeholder="Notas internas..." value={notasInput} onChange={e => setNotasInput(e.target.value)}
                                                    onBlur={() => updateCotizacion(selected.id, { notasAdmin: notasInput })}
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                                <div className="bg-primary/10 p-2 rounded-md text-primary"><FiMail /></div>
                                                <div className="truncate"><p className="text-xs text-muted-foreground">Correo</p><p className="text-sm font-medium truncate">{selected.correo}</p></div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                                <div className="bg-primary/10 p-2 rounded-md text-primary"><FiPhone /></div>
                                                <div><p className="text-xs text-muted-foreground">Teléfono</p><a href={`tel:${selected.telefono}`} className="text-sm font-medium hover:text-primary">{selected.telefono || 'N/A'}</a></div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                                <div className="bg-primary/10 p-2 rounded-md text-primary"><FiDollarSign /></div>
                                                <div><p className="text-xs text-muted-foreground">Presupuesto cliente</p><p className="text-sm font-medium">{selected.presupuesto}</p></div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Descripción del Proyecto</h3>
                                            <div className="bg-background p-5 rounded-lg border border-border/50 text-base leading-relaxed whitespace-pre-wrap">{selected.descripcion}</div>
                                        </div>

                                        {/* ===== MERCADOPAGO PAYMENT LINK ===== */}
                                        {selected.precioCotizado && (
                                            <div className={`rounded-xl border p-4 ${selected.status === 'atendida' ? 'bg-green-50 dark:bg-green-950/20 border-green-300/50' : 'bg-muted/30 border-border'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <FiLink className="text-[#00B1EA] w-4 h-4" />
                                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link de Pago — MercadoPago</p>
                                                    </div>
                                                    <button
                                                        onClick={generatePaymentLink}
                                                        disabled={generatingLink}
                                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#00B1EA] text-white hover:bg-[#0095c8] disabled:opacity-60 transition-colors"
                                                    >
                                                        {generatingLink
                                                            ? <><FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Generando...</>
                                                            : selected.linkPago
                                                                ? <><FiRefreshCw className="w-3.5 h-3.5" /> Regenerar</>
                                                                : <><FiLink className="w-3.5 h-3.5" /> Generar Link</>
                                                        }
                                                    </button>
                                                </div>

                                                {selected.linkPago ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-2">
                                                            <p className="text-xs font-mono text-muted-foreground truncate flex-1">{selected.linkPago}</p>
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(selected.linkPago!); toast.success('¡Copiado!'); }}
                                                                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                                title="Copiar link"
                                                            >
                                                                <FiCopy className="w-3.5 h-3.5" />
                                                            </button>
                                                            <a href={selected.linkPago} target="_blank" rel="noreferrer"
                                                                className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                                                title="Abrir en MercadoPago"
                                                            >
                                                                <FiExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">💡 Envía este link al cliente por WhatsApp o email. Puede pagar con tarjeta, OXXO, transferencia y más.</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">
                                                        {selected.status === 'atendida'
                                                            ? 'Haz click en "Generar Link" para crear el link de cobro de MercadoPago por $' + selected.precioCotizado?.toLocaleString() + ' MXN.'
                                                            : 'Cambia el estado a "Atendida" para habilitar la generación del link de pago.'}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <AIAnalisis data={{ nombre: selected.nombre, proyecto: selected.proyecto, presupuesto: selected.presupuesto, descripcion: selected.descripcion }} />
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-xl bg-card">
                                        <p className="text-muted-foreground text-center">Selecciona una solicitud<br />para ver detalles y gestionar el CRM.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* ======= TAB: PARTNERS ======= */}
                {activeTab === 'partners' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg">Gestión de Partners</h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">Crea, activa o elimina partners. El código se genera automáticamente.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{partners.filter(p => p.isPartner).length} activos</span>
                                    <button onClick={() => setShowInviteForm(v => !v)}
                                        className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                                        <FiUserPlus className="w-3.5 h-3.5" /> Nuevo Partner
                                    </button>
                                </div>
                            </div>

                            {showInviteForm && (
                                <div className="p-5 bg-primary/5 border-b border-primary/10 space-y-3">
                                    <p className="text-sm font-semibold text-primary">Crear nuevo usuario Partner</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="text" placeholder="Nombre (opcional)" value={inviteName} onChange={e => setInviteName(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        <input type="tel" placeholder="Teléfono WhatsApp" value={invitePhone} onChange={e => setInvitePhone(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        <input type="email" placeholder="Email *" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                        <input type="password" placeholder="Contraseña (mínimo 6 caracteres) *" value={invitePassword} onChange={e => setInvitePassword(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Comparte estas credenciales directamente con el partner para que pueda acceder a su panel.</p>
                                    <button onClick={createPartner} disabled={inviting}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-50">
                                        {inviting ? 'Creando...' : <><FiUserPlus /> Crear Partner</>}
                                    </button>
                                </div>
                            )}

                            <div className="divide-y divide-border">
                                {partners.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-8 text-sm">No hay partners aún. Crea el primero.</p>
                                ) : partners.map(partner => (
                                    <div key={partner.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">{partner.fullName || partner.email}</p>
                                            {partner.fullName && <p className="text-xs text-muted-foreground">{partner.email}</p>}
                                            {partner.phone && <a href={`https://wa.me/${partner.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">📱 {partner.phone}</a>}
                                            {partner.partnerCode && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">{partner.partnerCode}</span>
                                                    <button onClick={() => copyCode(partner.partnerCode!)} className="text-xs text-muted-foreground hover:text-foreground"><FiCopy /></button>
                                                </div>
                                            )}
                                            {!partner.partnerCode && <p className="text-xs text-muted-foreground">Sin código</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => togglePartner(partner)} disabled={togglingId === partner.id}
                                                className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md font-semibold transition-colors ${partner.isPartner ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'}`}>
                                                {partner.isPartner ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                                                {partner.isPartner ? 'Activo' : 'Inactivo'}
                                            </button>
                                            <button onClick={() => deletePartner(partner)} className="p-1.5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ======= TAB: REFERIDOS ======= */}
                {activeTab === 'referidos' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Leads</p>
                                <p className="text-3xl font-black text-foreground mt-1">{cotizaciones.length}</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Con Referido</p>
                                <p className="text-3xl font-black text-primary mt-1">{cotizaciones.filter(c => c.referralCodeUsed).length}</p>
                            </div>
                            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm col-span-2 sm:col-span-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Partners Activos</p>
                                <p className="text-3xl font-black text-green-500 mt-1">{Object.keys(grouped).length}</p>
                            </div>
                        </div>

                        {Object.entries(grouped).map(([code, leads]) => (
                            <div key={code} className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center gap-3">
                                    <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">{code}</span>
                                    <span className="text-sm text-muted-foreground">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {leads.map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-4 text-sm">
                                            <div><p className="font-medium">{lead.nombre}</p><p className="text-xs text-muted-foreground">{lead.proyecto}</p></div>
                                            <div className="text-right"><p className="text-xs text-muted-foreground">{lead.presupuesto}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 bg-muted/30 border-b border-border flex items-center gap-3">
                                <span className="font-semibold text-muted-foreground">Directos (sin código de referido)</span>
                                <span className="text-sm text-muted-foreground">{withoutCode.length} leads</span>
                            </div>
                            {withoutCode.length === 0 ? (
                                <p className="text-center text-muted-foreground p-6 text-sm">Todos los leads tienen código de referido.</p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {withoutCode.map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-4 text-sm">
                                            <div><p className="font-medium">{lead.nombre}</p><p className="text-xs text-muted-foreground">{lead.proyecto}</p></div>
                                            <p className="text-xs text-muted-foreground">{lead.presupuesto}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ======= TAB: FACTURACIÓN ======= */}
                {activeTab === 'facturacion' && (() => {
                    const atendidas = cotizaciones.filter(c => c.status === 'atendida' && c.precioCotizado);
                    const totalFacturado = atendidas.reduce((sum, c) => sum + (c.precioCotizado || 0), 0);
                    const totalPendiente = cotizaciones.filter(c => (c.status === 'por_atender' || c.status === 'en_proceso') && c.precioCotizado).reduce((sum, c) => sum + (c.precioCotizado || 0), 0);
                    const cotizadasConPrecio = cotizaciones.filter(c => c.precioCotizado);
                    return (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                                    <p className="text-3xl font-black mt-1">{cotizaciones.length}</p>
                                </div>
                                <div className="bg-card border border-green-500/30 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">Facturado</p>
                                    <p className="text-2xl font-black text-green-600 mt-1">${totalFacturado.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{atendidas.length} atendidas</p>
                                </div>
                                <div className="bg-card border border-blue-500/30 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">En Pipeline</p>
                                    <p className="text-2xl font-black text-blue-600 mt-1">${totalPendiente.toLocaleString()}</p>
                                </div>
                                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Con Precio</p>
                                    <p className="text-3xl font-black mt-1">{cotizadasConPrecio.length}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {(Object.keys(statusConfig) as CotizacionStatus[]).map(s => {
                                    const count = cotizaciones.filter(c => (c.status || 'por_atender') === s).length;
                                    const cfg = statusConfig[s];
                                    return (
                                        <div key={s} className={`rounded-xl border p-4 ${cfg.color}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                                <span className="text-xs font-semibold">{cfg.label}</span>
                                            </div>
                                            <p className="text-2xl font-black">{count}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-4 bg-muted/30 border-b border-border">
                                    <h3 className="font-semibold">Detalle de Precios Cotizados</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Agrega precios desde la pestaña Solicitudes.</p>
                                </div>
                                {cotizadasConPrecio.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-8 text-sm">Aún no has cotizado precios.</p>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {cotizadasConPrecio.sort((a, b) => (b.precioCotizado || 0) - (a.precioCotizado || 0)).map(c => {
                                            const cfg = statusConfig[c.status || 'por_atender'];
                                            return (
                                                <div key={c.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                                    <div className="min-w-0 flex-1">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.color}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>{cfg.label}
                                                        </span>
                                                        <p className="font-medium text-sm truncate mt-0.5">{c.nombre}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{c.proyecto}</p>
                                                    </div>
                                                    <div className="text-right ml-4 flex-shrink-0">
                                                        <p className="text-xl font-black text-green-600">${c.precioCotizado!.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="p-4 bg-green-50 dark:bg-green-950/30 border-t-2 border-green-500/30 flex justify-between items-center">
                                            <span className="font-bold text-sm text-green-700 dark:text-green-400">TOTAL COTIZADO</span>
                                            <span className="text-2xl font-black text-green-600">${cotizadasConPrecio.reduce((s, c) => s + (c.precioCotizado || 0), 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
