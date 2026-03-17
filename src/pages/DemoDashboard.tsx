import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCode } from 'react-icons/fi';
import { useEffect } from 'react';

// Se importarán los componentes de demo aquí
import DemoCRM from '../components/demos/DemoCRM';
import DemoAnalytics from '../components/demos/DemoAnalytics';
import DemoRecords from '../components/demos/DemoRecords';
import DemoCalendar from '../components/demos/DemoCalendar';
import DemoEcommerce from '../components/demos/DemoEcommerce';
import DemoEmployees from '../components/demos/DemoEmployees';
import DemoTickets from '../components/demos/DemoTickets';
import DemoMarketing from '../components/demos/DemoMarketing';
import DemoInventory from '../components/demos/DemoInventory';
import DemoElearning from '../components/demos/DemoElearning';

export default function DemoDashboard() {
    const { id } = useParams();

    useEffect(() => {
        // Al entrar a una demo, scroleamos hacia arriba
        window.scrollTo(0, 0);
    }, [id]);

    const renderDemo = () => {
        switch (id) {
            case '1': return <DemoCRM />;
            case '2': return <DemoAnalytics />;
            case '3': return <DemoRecords />;
            case '4': return <DemoCalendar />;
            case '5': return <DemoEcommerce />;
            case '6': return <DemoEmployees />;
            case '7': return <DemoTickets />;
            case '8': return <DemoMarketing />;
            case '9': return <DemoInventory />;
            case '10': return <DemoElearning />;
            default: return <div className="p-12 text-center text-destructive font-bold">Demo no encontrada</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Topbar flotante para contexto de demo */}
            <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-[100] shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors group">
                        <FiArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <FiCode className="w-4 h-4" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-sm leading-tight text-foreground">Entorno de Demostración</h1>
                            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Interactivo
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/cotizacion" className="hidden sm:inline-flex bg-background border border-border text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-muted transition-colors">
                        Soporte
                    </Link>
                    <Link to="/cotizacion" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Solicitar Proyecto Similar
                    </Link>
                </div>
            </header>

            {/* Contenedor principal de la demo */}
            <main className="flex-1 relative flex flex-col bg-gradient-to-br from-muted/30 to-background overflow-hidden">
                {renderDemo()}
            </main>
        </div>
    );
}
