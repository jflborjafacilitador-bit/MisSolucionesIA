import { Link } from 'react-router-dom';
import { FiMonitor, FiShoppingCart, FiUsers, FiPieChart, FiLayout, FiCalendar, FiBriefcase, FiAperture, FiDatabase, FiBookOpen } from 'react-icons/fi';

const demos = [
    { id: 1, name: 'Smart CRM', desc: 'Gestión de relaciones y leads pipeline', icon: FiUsers },
    { id: 2, name: 'Analytics', desc: 'Dashboards Ejecutivos gerenciales', icon: FiPieChart },
    { id: 3, name: 'Registros Médicos', desc: 'Gestión Clínica e historiales', icon: FiDatabase },
    { id: 4, name: 'Calendar Booking', desc: 'Agendas Inteligentes y reservas', icon: FiCalendar },
    { id: 5, name: 'E-Commerce', desc: 'Tiendas Virtuales de alta conversión', icon: FiShoppingCart },
    { id: 6, name: 'Portal RRHH', desc: 'Gestión de Empleados y nóminas', icon: FiBriefcase },
    { id: 7, name: 'Soporte Helpdesk', desc: 'Bandeja de Tickets y atención al cliente', icon: FiAperture },
    { id: 8, name: 'Marketing & Web', desc: 'Landing Pages y Páginas estáticas', icon: FiLayout },
    { id: 9, name: 'Control de Stocks', desc: 'Administrador de inventario', icon: FiMonitor },
    { id: 10, name: 'Plataforma E-Learning', desc: 'Cursos, módulos y capacitación', icon: FiBookOpen }
];

export default function DemosIndex() {
    return (
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-8 min-h-screen fade-in-up">
            <h1 className="text-5xl font-serif text-foreground mb-4">Portafolio Iteractivo</h1>
            <p className="text-lg text-muted-foreground mb-16 max-w-3xl">Explora en directo todas nuestras instancias demostrativas de interfaz. Estos sandboxes están diseñados para mostrar la fluidez y arquitectura que podrías tener en tu propia empresa. Ningún cambio que hagas aquí será persistente.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {demos.map(d => (
                    <Link key={d.id} to={`/demo/${d.id}`} className="bg-card p-8 flex flex-col rounded-2xl border border-border/50 shadow-sm hover:shadow-[0_20px_50px_rgba(40,240,250,0.05)] hover:-translate-y-2 transition-all duration-300 group">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                            <d.icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-serif text-foreground mb-3">{d.name}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-8">{d.desc}</p>
                        <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity mt-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            Probar Sandbox
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
