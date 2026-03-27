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
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-8 min-h-screen fade-in-up">
            <h1 className="text-5xl font-serif text-foreground mb-4">Portafolio Interactivo</h1>
            <p className="text-lg text-muted-foreground mb-16 max-w-3xl">Explora en directo todas nuestras instancias demostrativas de interfaz. Estos sandboxes están diseñados para mostrar la fluidez y arquitectura que podrías tener en tu propia empresa. Ningún cambio que hagas aquí será persistente.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {demos.map(d => (
                    <Link key={d.id} to={`/demo/${d.id}`} className="bg-card flex flex-col rounded-2xl border border-border/50 shadow-sm hover:shadow-[0_20px_50px_rgba(40,240,250,0.05)] hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
                        
                        {/* Micro-Rendered Preview Frame */}
                        <div className="w-full h-40 bg-background border-b border-border/50 relative overflow-hidden pointer-events-none flex items-start justify-center pt-8">
                            <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                <d.Component />
                            </div>
                            <div className="absolute inset-0 bg-transparent mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                            <h2 className="text-2xl font-serif text-foreground mb-3">{d.name}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-8">{d.desc}</p>
                            <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                Probar Sandbox
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
