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
        <div className="flex-1 bg-muted/10 min-h-screen">
            <div className="bg-background border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <img src="/icons/icon-192.png" alt="Logo" className="w-7 h-7 rounded-md" />
                        Portal de Partners
                    </h1>
                    <button onClick={handleLogout} className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium">
                        <FiLogOut /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

                {/* Welcome + Code Card */}
                <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">¡Hola, {profile?.fullName || 'Emprendedor'}!</h2>
                        <p className="text-muted-foreground">Comparte tu enlace único. Por cada solicitud enviada, lo registramos aquí.</p>
                        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 min-w-[250px] text-center">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Tu Código Único</p>
                        <div className="text-xl font-mono font-bold text-foreground bg-background py-2 px-4 rounded border shadow-inner mb-3">
                            {profile?.partnerCode || 'SIN CÓDIGO'}
                        </div>
                        <button
                            onClick={copyReferralLink}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <FiCopy /> Copiar Enlace
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-blue-500/10 text-blue-500 p-3 rounded-full">
                            <FiUsers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leads Totales</p>
                            <p className="text-4xl font-black text-foreground">{leads.length}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-green-500/30 rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-green-500/10 text-green-500 p-3 rounded-full">
                            <FiTrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Atendidos</p>
                            <p className="text-4xl font-black text-green-600">{atendidas.length}</p>
                        </div>
                    </div>
                    <div className="bg-card border border-yellow-500/30 rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-full">
                            <FiDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Comisión est. (5%)</p>
                            <p className="text-2xl font-black text-yellow-600">${comisionEstimada.toLocaleString()} MXN</p>
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
