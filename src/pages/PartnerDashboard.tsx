import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { FiLogOut, FiUsers, FiCopy, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { toast } from 'sonner';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COMMISSION_RATE = 0.05; // 5% comisión estimada

export default function PartnerDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) { navigate('/login'); return; }

        const load = async () => {
            const snap = await getDoc(doc(db, 'users', user.uid));
            const data = snap.data();

            if (!data?.isPartner) {
                toast.error('No tienes acceso al panel de Partners.');
                navigate('/');
                return;
            }

            setProfile({ ...data, email: user.email });

            if (data.partnerCode) {
                const q = query(collection(db, 'cotizaciones'), where('referralCodeUsed', '==', data.partnerCode));
                const snap2 = await getDocs(q);
                setLeads(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
            }
            setLoading(false);
        };

        load();
    }, [user, authLoading, navigate]);

    const handleLogout = async () => { await logout(); navigate('/'); };

    const copyReferralLink = () => {
        if (!profile?.partnerCode) return;
        const link = `${window.location.origin}/cotizacion?ref=${profile.partnerCode}`;
        navigator.clipboard.writeText(link);
        toast.success('¡Enlace copiado al portapapeles!');
    };

    // Build monthly chart data
    const monthlyData = () => {
        const map: Record<string, number> = {};
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        leads.forEach(l => {
            const d = l.createdAt?.toDate ? l.createdAt.toDate() : new Date((l.createdAt?.seconds || 0) * 1000);
            const key = `${meses[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map).map(([mes, leads]) => ({ mes, leads }));
    };

    const atendidas = leads.filter(l => l.status === 'atendida');
    const comisionEstimada = atendidas.reduce((s, l) => s + (l.precioCotizado || 0) * COMMISSION_RATE, 0);

    if (loading) {
        return <div className="p-10 text-center flex items-center justify-center min-h-screen">Cargando panel de afiliado...</div>;
    }

    const chartData = monthlyData();

    return (
        <div className="flex-1 bg-background min-h-screen relative">
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-background to-background pointer-events-none" />
            
            <div className="bg-card/70 backdrop-blur-2xl border-b border-primary/10 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <img src="/icons/icon-192.png" alt="Logo" className="w-8 h-8 rounded-xl shadow-md border border-primary/20" />
                        Portal de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Partners</span>
                    </h1>
                    <button onClick={handleLogout} className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/80 font-bold transition-colors bg-destructive/10 px-4 py-2 rounded-full">
                        <FiLogOut /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 relative z-10">

                {/* Welcome + Code Card */}
                <div className="bg-card/70 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] shadow-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div>
                        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">¡Hola, {profile?.fullName || 'Emprendedor'}!</h2>
                        <p className="text-muted-foreground leading-relaxed">Comparte tu enlace único. Por cada solicitud que recibamos con tu código, te abonaremos la comisión automáticamente.</p>
                        <p className="text-xs text-muted-foreground mt-2 opacity-60 font-mono">{user?.email}</p>
                    </div>
                    <div className="bg-background/50 backdrop-blur-md border border-primary/20 rounded-[2rem] p-6 min-w-[280px] text-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2 relative z-10">Tu Código Único</p>
                        <div className="text-2xl font-mono font-bold text-foreground bg-primary/5 py-3 px-4 rounded-xl shadow-inner mb-4 relative z-10 border border-primary/10">
                            {profile?.partnerCode || 'SIN CÓDIGO'}
                        </div>
                        <button
                            onClick={copyReferralLink}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-bold py-3 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all relative z-10 hover:scale-105"
                        >
                            <FiCopy /> Copiar Enlace
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-card/70 backdrop-blur-xl border border-primary/10 rounded-[2rem] shadow-xl p-6 flex flex-col gap-4 relative overflow-hidden hover:border-primary/20 transition-colors">
                        <div className="bg-blue-500/10 text-blue-400 p-4 rounded-full w-fit border border-blue-500/20">
                            <FiUsers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Leads Totales</p>
                            <p className="text-4xl font-black text-foreground drop-shadow-md">{leads.length}</p>
                        </div>
                    </div>
                    <div className="bg-card/70 backdrop-blur-xl border border-primary/10 rounded-[2rem] shadow-xl p-6 flex flex-col gap-4 relative overflow-hidden hover:border-primary/20 transition-colors">
                        <div className="bg-green-500/10 text-green-400 p-4 rounded-full w-fit border border-green-500/20">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Atendidos</p>
                            <p className="text-4xl font-black text-green-400 drop-shadow-md">{atendidas.length}</p>
                        </div>
                    </div>
                    <div className="bg-card/70 backdrop-blur-xl border border-primary/10 rounded-[2rem] shadow-xl p-6 flex flex-col gap-4 relative overflow-hidden hover:border-primary/20 transition-colors">
                        <div className="bg-primary/10 text-primary p-4 rounded-full w-fit border border-primary/20">
                            <FiDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Comisión est. (5%)</p>
                            <p className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">${comisionEstimada.toLocaleString()} <span className="text-lg">MXN</span></p>
                        </div>
                    </div>
                </div>

                {/* Monthly Chart */}
                {chartData.length > 0 && (
                    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-1">Leads por Mes</h3>
                        <p className="text-xs text-muted-foreground mb-4">Solicitudes generadas con tu código referral</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="leads" name="Leads" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Leads list */}
                {leads.length > 0 && (
                    <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/30 border-b border-border">
                            <h3 className="font-semibold">Historial de Leads</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {leads.slice().reverse().map(l => (
                                <div key={l.id} className="flex items-center justify-between p-4 text-sm">
                                    <div>
                                        <p className="font-medium">{l.nombre}</p>
                                        <p className="text-xs text-muted-foreground">{l.proyecto}</p>
                                    </div>
                                    <div className="text-right">
                                        {l.precioCotizado && (
                                            <p className="text-xs text-green-600 font-mono font-bold">${l.precioCotizado.toLocaleString()}</p>
                                        )}
                                        <p className={`text-[10px] font-semibold ${l.status === 'atendida' ? 'text-green-500' : 'text-muted-foreground'}`}>
                                            {l.status === 'atendida' ? 'Atendida ✓' : l.status || 'Por atender'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {leads.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">Aún no tienes leads registrados.</p>
                        <p className="text-sm mt-1">Comparte tu enlace para empezar a generar solicitudes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
