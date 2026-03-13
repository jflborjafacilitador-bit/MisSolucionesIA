import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { FiLogOut, FiUsers, FiCopy, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'sonner';

export default function PartnerDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [referralsCount, setReferralsCount] = useState(0);
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
                setReferralsCount(snap2.size);
            }
            setLoading(false);
        };

        load();
    }, [user, authLoading, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const copyReferralLink = () => {
        if (!profile?.partnerCode) return;
        const link = `${window.location.origin}/cotizacion?ref=${profile.partnerCode}`;
        navigator.clipboard.writeText(link);
        toast.success('¡Enlace copiado al portapapeles!');
    };

    if (loading) {
        return <div className="p-10 text-center flex items-center justify-center min-h-screen">Cargando panel de afiliado...</div>;
    }

    return (
        <div className="flex-1 bg-muted/10 min-h-screen">
            <div className="bg-background border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <FiTrendingUp /> Portal de Partners
                    </h1>
                    <button onClick={handleLogout} className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium">
                        <FiLogOut /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">¡Hola, {profile?.fullName || 'Emprendedor'}!</h2>
                        <p className="text-muted-foreground">Comparte tu enlace único con clientes potenciales. Por cada cotización enviada, lo registraremos aquí.</p>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 flex items-center gap-4">
                        <div className="bg-blue-500/10 text-blue-500 p-4 rounded-full">
                            <FiUsers className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Leads Generados</p>
                            <p className="text-4xl font-black text-foreground">{referralsCount}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/10 text-green-500 p-4 rounded-full">
                                <span className="text-2xl font-bold">$</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Comisiones Estimadas</p>
                                <p className="text-xl font-bold text-foreground">Próximamente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
