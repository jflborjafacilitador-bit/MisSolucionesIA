import { useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiDownload, FiPlus, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';

interface Registro {
    id: string;
    nombre: string;
    email: string;
    fechaRegistro: string;
    ultimaVisita: string;
    estado: 'Activo' | 'Inactivo' | 'Pendiente';
    departamento: string;
}

const INITIAL_DATA: Registro[] = Array.from({ length: 45 }).map((_, i) => {
    const estados: ('Activo' | 'Inactivo' | 'Pendiente')[] = ['Activo', 'Inactivo', 'Pendiente'];
    const deptos = ['Cardiología', 'Pediatría', 'General', 'Neurología', 'Traumatología'];
    const nombres = ['Laura Gómez', 'Carlos Ruiz', 'Roberto Díaz', 'Ana Martínez', 'Luis Fernando', 'María López', 'Jorge Pérez', 'Elena Nito', 'Pedro Pascal', 'Sara Connor'];
    
    return {
        id: `EXP-90${10 + i}`,
        nombre: nombres[i % nombres.length] + (i > 9 ? ` ${i}` : ''),
        email: `contacto${i}@correo.com`,
        fechaRegistro: `1${(i % 9) + 1} Ene 2026`,
        ultimaVisita: `${(i % 28) + 1} Oct 2026`,
        estado: estados[i % 3],
        departamento: deptos[i % deptos.length]
    };
});

export default function DemoRecords() {
    const [busqueda, setBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState<string>('Todos');
    const [paginaLocal, setPaginaLocal] = useState(1);
    const registrosPorPagina = 10;

    const datosFiltrados = useMemo(() => {
        return INITIAL_DATA.filter(reg => {
            const matchBusqueda = reg.nombre.toLowerCase().includes(busqueda.toLowerCase()) || reg.id.toLowerCase().includes(busqueda.toLowerCase());
            const matchEstado = estadoFiltro === 'Todos' || reg.estado === estadoFiltro;
            return matchBusqueda && matchEstado;
        });
    }, [busqueda, estadoFiltro]);

    const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
    const datosPaginados = datosFiltrados.slice((paginaLocal - 1) * registrosPorPagina, paginaLocal * registrosPorPagina);

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'Activo': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Inactivo': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'Pendiente': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 bg-background/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Sistemas de Registros</h2>
                    <p className="text-sm text-muted-foreground mt-1">Bases de datos seguras con búsqueda y filtrado en tiempo real.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                        <FiDownload /> Exportar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                        <FiPlus /> Nuevo Registro
                    </button>
                </div>
            </div>

            {/* Controles de tabla */}
            <div className="bg-card border-x border-t border-border rounded-t-xl p-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="relative w-full sm:w-80">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Buscar por Expediente o Nombre..." 
                        className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPaginaLocal(1); }}
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm text-muted-foreground font-medium flex items-center gap-1"><FiFilter /> Estado:</span>
                    <select 
                        className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={estadoFiltro}
                        onChange={(e) => { setEstadoFiltro(e.target.value); setPaginaLocal(1); }}
                    >
                        <option value="Todos">Todos</option>
                        <option value="Activo">Activos</option>
                        <option value="Pendiente">Pendientes</option>
                        <option value="Inactivo">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-card border border-border rounded-b-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                <th className="px-6 py-4">Expediente</th>
                                <th className="px-6 py-4">Información Personal</th>
                                <th className="px-6 py-4">Departamento</th>
                                <th className="px-6 py-4">Última Visita</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {datosPaginados.length > 0 ? datosPaginados.map((row) => (
                                <tr key={row.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-muted-foreground font-medium">{row.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-foreground">{row.nombre}</div>
                                        <div className="text-xs text-muted-foreground">{row.email}</div>
                                    </td>
                                    <td className="px-6 py-4">{row.departamento}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{row.ultimaVisita}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(row.estado)}`}>
                                            {row.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Ver Detalles">
                                                <FiEye />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors" title="Editar">
                                                <FiEdit2 />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors" title="Eliminar">
                                                <FiTrash2 />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" title="Más">
                                                <FiMoreVertical />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No se encontraron registros que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="bg-muted/10 p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground mt-auto">
                    <div>
                        Mostrando <span className="font-bold text-foreground">{(paginaLocal - 1) * registrosPorPagina + 1}</span> a <span className="font-bold text-foreground">{Math.min(paginaLocal * registrosPorPagina, datosFiltrados.length)}</span> de <span className="font-bold text-foreground">{datosFiltrados.length}</span> registros
                    </div>
                    <div className="flex gap-1">
                        <button 
                            className="bg-card border border-border p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setPaginaLocal(p => Math.max(1, p - 1))}
                            disabled={paginaLocal === 1}
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPaginas }).map((_, i) => (
                            <button 
                                key={i}
                                className={`w-8 h-8 rounded-lg border text-sm font-bold transition-all ${paginaLocal === i + 1 ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card border-border hover:bg-muted text-foreground'}`}
                                onClick={() => setPaginaLocal(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            className="bg-card border border-border p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setPaginaLocal(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaLocal === totalPaginas || totalPaginas === 0}
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-6 text-center">
                 <p className="text-xs text-muted-foreground">
                    ⚡ <strong>Interactúa:</strong> Usa la barra de búsqueda o el selector de estado para ver cómo los registros se filtran instantáneamente.
                 </p>
            </div>
        </div>
    );
}
