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
import DemoPreview from '../components/ui/DemoPreview';

const demos = [
    { id: 1, name: 'Smart CRM',           desc: 'Gestión de relaciones y leads pipeline',        Component: DemoCRM },
    { id: 2, name: 'Analytics',           desc: 'Dashboards Ejecutivos gerenciales',              Component: DemoAnalytics },
    { id: 3, name: 'Registros Médicos',   desc: 'Gestión Clínica e historiales',                  Component: DemoRecords },
    { id: 4, name: 'Calendar Booking',    desc: 'Agendas Inteligentes y reservas',                Component: DemoCalendar },
    { id: 5, name: 'E-Commerce',          desc: 'Tiendas Virtuales de alta conversión',           Component: DemoEcommerce },
    { id: 6, name: 'Portal RRHH',         desc: 'Gestión de Empleados y nóminas',                 Component: DemoEmployees },
    { id: 7, name: 'Soporte Helpdesk',    desc: 'Bandeja de Tickets y atención al cliente',       Component: DemoTickets },
    { id: 8, name: 'Marketing & Web',     desc: 'Landing Pages y Páginas estáticas',              Component: DemoMarketing },
    { id: 9, name: 'Control de Stocks',   desc: 'Administrador de inventario',                    Component: DemoInventory },
    { id: 10, name: 'E-Learning',         desc: 'Cursos, módulos y capacitación',                 Component: DemoElearning },
];

export default function DemosIndex() {
    return (
        <div className="pt-24 sm:pt-32 pb-12 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-8 min-h-screen">
            <h1 className="text-3xl sm:text-5xl font-serif text-foreground mb-3 sm:mb-4">
                Portafolio Interactivo
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-10 sm:mb-16 max-w-3xl">
                Explora en directo todas nuestras instancias demostrativas. Estos sandboxes muestran
                la fluidez y arquitectura que podrías tener en tu empresa. Ningún cambio es persistente.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {demos.map(d => (
                    <Link
                        key={d.id}
                        to={`/demo/${d.id}`}
                        className="bg-card flex flex-col rounded-2xl border border-border/50 shadow-sm hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 group overflow-hidden"
                    >
                        {/* Preview escalado con dimensiones fijas — resuelve error Recharts width=-1 */}
                        <DemoPreview visibleHeight={140}>
                            <d.Component />
                        </DemoPreview>

                        <div className="p-3 sm:p-5 flex flex-col flex-1 border-t border-border/50">
                            <h2 className="text-sm sm:text-lg font-bold text-foreground mb-0.5 sm:mb-1 leading-tight">
                                {d.name}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed flex-1 text-xs hidden sm:block">
                                {d.desc}
                            </p>
                            <div className="mt-2 sm:mt-3 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                                <span className="hidden sm:inline">Probar Sandbox</span>
                                <span className="sm:hidden">Abrir</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
