import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AIAnalisis from '../components/AIAnalisis';
import { FiLogOut, FiMail, FiPhone, FiDollarSign, FiClock, FiChevronRight } from 'react-icons/fi';

interface Cotizacion {
    id: string;
    nombre: string;
    telefono: string;
    correo: string;
    proyecto: string;
    presupuesto: string;
    descripcion: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Cotizacion | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login');
            } else {
                fetchCotizaciones();
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!session) navigate('/login');
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);

    const fetchCotizaciones = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('cotizaciones')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCotizaciones(data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return <div className="p-10 text-center">Cargando dashboard...</div>;
    }

    return (
        <div className="flex-1 bg-muted/10 min-h-screen">
            <div className="bg-background border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="text-sm flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium"
                    >
                        <FiLogOut /> Cerrar Sesión
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de Cotizaciones */}
                <div className="lg:col-span-1 bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col h-[80vh]">
                    <div className="p-4 border-b border-border bg-muted/30">
                        <h2 className="font-semibold text-lg flex justify-between items-center">
                            Solicitudes Recientes
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {cotizaciones.length}
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {cotizaciones.length === 0 ? (
                            <p className="text-center text-muted-foreground p-4 text-sm">No hay cotizaciones registradas.</p>
                        ) : (
                            cotizaciones.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelected(c)}
                                    className={`w-full text-left p-4 rounded-lg flex items-center justify-between transition-colors border ${selected?.id === c.id
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-background border-transparent hover:bg-muted/50 hover:border-border'
                                        }`}
                                >
                                    <div className="truncate pr-4">
                                        <p className="font-medium text-sm truncate">{c.nombre}</p>
                                        <p className="text-xs text-muted-foreground truncate">{c.proyecto}</p>
                                    </div>
                                    <FiChevronRight className="flex-shrink-0 text-muted-foreground" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detalle y Análisis */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2">
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{selected.nombre}</h2>
                                    <p className="inline-block mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                                        {selected.proyecto}
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md mt-1 sm:mt-0 flex items-center gap-2">
                                    <FiClock /> {new Date(selected.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                    <div className="bg-primary/10 p-2 rounded-md text-primary"><FiMail /></div>
                                    <div className="truncate">
                                        <p className="text-xs text-muted-foreground">Correo</p>
                                        <p className="text-sm font-medium truncate">{selected.correo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                    <div className="bg-primary/10 p-2 rounded-md text-primary"><FiPhone /></div>
                                    <div className="truncate">
                                        <p className="text-xs text-muted-foreground">Teléfono</p>
                                        <p className="text-sm font-medium">{selected.telefono || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border/50">
                                    <div className="bg-primary/10 p-2 rounded-md text-primary"><FiDollarSign /></div>
                                    <div className="truncate">
                                        <p className="text-xs text-muted-foreground">Presupuesto</p>
                                        <p className="text-sm font-medium">{selected.presupuesto}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Descripción / Idea del Cliente</h3>
                                <div className="bg-background p-5 rounded-lg border border-border/50 text-base leading-relaxed whitespace-pre-wrap">
                                    {selected.descripcion}
                                </div>
                            </div>

                            <AIAnalisis data={selected} />
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-border rounded-xl bg-card">
                            <p className="text-muted-foreground text-center">
                                Selecciona una cotización de la lista<br />para ver los detalles y generar el análisis con IA.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
