import { Link } from 'react-router-dom';
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

const demos = [
    { id: 1, name: 'Smart CRM', desc: 'Gestión de relaciones y leads pipeline', Component: DemoCRM },
    { id: 2, name: 'Analytics', desc: 'Dashboards Ejecutivos gerenciales', Component: DemoAnalytics },
    { id: 3, name: 'Registros Médicos', desc: 'Gestión Clínica e historiales', Component: DemoRecords },
    { id: 4, name: 'Calendar Booking', desc: 'Agendas Inteligentes y reservas', Component: DemoCalendar },
    { id: 5, name: 'E-Commerce', desc: 'Tiendas Virtuales de alta conversión', Component: DemoEcommerce },
    { id: 6, name: 'Portal RRHH', desc: 'Gestión de Empleados y nóminas', Component: DemoEmployees },
    { id: 7, name: 'Soporte Helpdesk', desc: 'Bandeja de Tickets y atención al cliente', Component: DemoTickets },
    { id: 8, name: 'Marketing & Web', desc: 'Landing Pages y Páginas estáticas', Component: DemoMarketing },
    { id: 9, name: 'Control de Stocks', desc: 'Administrador de inventario', Component: DemoInventory },
    { id: 10, name: 'Plataforma E-Learning', desc: 'Cursos, módulos y capacitación', Component: DemoElearning }
];

export default function DemosIndex() {
    return (
        <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-8 min-h-screen fade-in-up">
            <h1 className="text-3xl sm:text-5xl font-serif text-foreground mb-3 sm:mb-4">Portafolio Interactivo</h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-10 sm:mb-16 max-w-3xl">Explora en directo todas nuestras instancias demostrativas. Estos sandboxes muestran la fluidez y arquitectura que podrías tener en tu empresa. Ningún cambio es persistente.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {demos.map(d => (
                    <Link key={d.id} to={`/demo/${d.id}`} className="bg-card flex flex-col rounded-2xl border border-border/50 shadow-sm hover:shadow-[0_20px_50px_rgba(40,240,250,0.05)] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
                        
                        {/* Micro-Rendered Preview Frame */}
                        <div className="w-full h-32 sm:h-40 bg-background border-b border-border/50 relative overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                    <d.Component />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 flex flex-col flex-1">
                            <h2 className="text-base sm:text-2xl font-serif text-foreground mb-1 sm:mb-3">{d.name}</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 hidden sm:block mb-4">{d.desc}</p>
                            <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                <span className="hidden sm:inline">Probar Sandbox</span>
                                <span className="sm:hidden">Ver</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
