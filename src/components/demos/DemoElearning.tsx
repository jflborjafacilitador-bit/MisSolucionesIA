import { useState } from 'react';
import { FiPlayCircle, FiCheckCircle, FiCircle, FiFileText, FiMessageCircle, FiAward, FiChevronLeft, FiStar } from 'react-icons/fi';

interface Modulo {
    id: string;
    titulo: string;
    clases: Clase[];
}

interface Clase {
    id: string;
    titulo: string;
    duracion: string;
    completada: boolean;
    tipo: 'video' | 'lectura' | 'quiz';
}

const CURSO_MOCK: Modulo[] = [
    {
        id: '1',
        titulo: 'Módulo 1: Fundamentos del Desarrollo Frontend',
        clases: [
            { id: '1-1', titulo: 'Bienvenida y Metodología', duracion: '05:20', completada: true, tipo: 'video' },
            { id: '1-2', titulo: 'Configuración del Entorno de Trabajo', duracion: '12:45', completada: true, tipo: 'video' },
            { id: '1-3', titulo: 'Guía de herramientas (PDF)', duracion: '10 min', completada: true, tipo: 'lectura' },
        ]
    },
    {
        id: '2',
        titulo: 'Módulo 2: Arquitectura de Componentes en React',
        clases: [
            { id: '2-1', titulo: 'Patrones de diseño modernos', duracion: '22:10', completada: false, tipo: 'video' },
            { id: '2-2', titulo: 'Estado global vs local', duracion: '18:30', completada: false, tipo: 'video' },
            { id: '2-3', titulo: 'Cuestionario de arquitectura', duracion: '5 min', completada: false, tipo: 'quiz' },
        ]
    },
    {
        id: '3',
        titulo: 'Módulo 3: Optimización y Performance',
        clases: [
            { id: '3-1', titulo: 'Lazy Loading y Suspense', duracion: '15:20', completada: false, tipo: 'video' },
            { id: '3-2', titulo: 'Memoization avanzado', duracion: '25:00', completada: false, tipo: 'video' },
        ]
    }
];

export default function DemoElearning() {
    const [claseActiva, setClaseActiva] = useState<Clase>(CURSO_MOCK[1].clases[0]);
    const [modulosExpandidos, setModulosExpandidos] = useState<Record<string, boolean>>({ '1': true, '2': true, '3': false });
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleModulo = (id: string) => {
        setModulosExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getIconoClase = (tipo: string, completada: boolean) => {
        if (completada) return <FiCheckCircle className="text-emerald-500 w-4 h-4" />;
        if (tipo === 'video') return <FiPlayCircle className="text-primary w-4 h-4" />;
        if (tipo === 'lectura') return <FiFileText className="text-amber-500 w-4 h-4" />;
        if (tipo === 'quiz') return <FiAward className="text-purple-500 w-4 h-4" />;
        return <FiCircle className="text-muted-foreground w-4 h-4" />;
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-background animate-in fade-in duration-500 overflow-hidden">
            
            {/* Reproductor / Contenido Principal */}
            <div className="flex-1 flex flex-col bg-muted/10 overflow-y-auto">
                {/* Navbar Top */}
                <div className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-4 sm:px-8 justify-between shrink-0">
                    <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <FiChevronLeft /> Mis Cursos
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">Progreso:</span>
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '38%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-500">38%</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary font-bold text-xs ring-2 ring-background shadow-md">
                            JD
                        </div>
                    </div>
                </div>

                {/* Área de Video */}
                <div className="p-4 sm:p-8 flex-1 flex flex-col max-w-5xl mx-auto w-full">
                    <div className="bg-black w-full aspect-video rounded-2xl shadow-2xl relative overflow-hidden group mb-6">
                        {/* Fake Video Thumbnail/Placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                            <div className="text-center opacity-70">
                                <h1 className="text-2xl sm:text-4xl font-black text-white/50 mb-4 tracking-tight drop-shadow-md">{claseActiva.titulo}</h1>
                                {isPlaying ? (
                                    <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                                        <div className="w-1.5 h-6 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-10 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        <div className="w-1.5 h-8 bg-primary rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsPlaying(true)}
                                        className="w-20 h-20 rounded-full bg-primary/80 backdrop-blur flex items-center justify-center text-white hover:scale-110 hover:bg-primary transition-all mx-auto shadow-xl"
                                    >
                                        <FiPlayCircle className="w-10 h-10 ml-1" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Controles de video fake */}
                        <div className={`absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                            <div className="w-full relative flex flex-col justify-end gap-2">
                                <div className="absolute bottom-5 inset-x-0 h-1 bg-white/30 rounded-full cursor-pointer hover:h-1.5 transition-all">
                                    <div className="h-full bg-primary rounded-full" style={{ width: isPlaying ? '15%' : '0%' }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-white/80 font-mono mt-1 w-full">
                                    <span>{isPlaying ? '03:14' : '00:00'}</span>
                                    <span>{claseActiva.duracion}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descripción y Comentarios */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{claseActiva.titulo}</h2>
                                <p className="text-muted-foreground text-sm">En esta clase aprenderemos los conceptos fundamentales de la arquitectura moderna de componentes, separando la lógica de la presentación para crear aplicaciones más mantenibles y escalables.</p>
                            </div>
                            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/50 text-muted-foreground hover:bg-muted font-bold text-sm rounded-lg transition-colors border border-border">
                                <FiStar /> Valorar Clase
                            </button>
                        </div>
                        
                        <div className="mt-4 pt-6 border-t border-border flex-1">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><FiMessageCircle /> Discusiones y Preguntas (4)</h3>
                            <div className="flex gap-4 p-4 border border-border rounded-lg bg-background">
                                <div className="w-10 h-10 bg-blue-500/20 text-blue-500 font-bold flex items-center justify-center rounded-full shrink-0">A</div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">Andrés Gómez</span>
                                        <span className="text-[10px] text-muted-foreground">Hace 2 días</span>
                                    </div>
                                    <p className="text-sm">¿Cómo aplicaríamos esto si usamos Redux o Zustand para el estado global?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Temario / Sidebar Derecho */}
            <div className="w-full md:w-80 border-l border-border bg-card flex flex-col shrink-0">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-bold text-lg">Contenido del Curso</h3>
                    <p className="text-[11px] text-muted-foreground">3 Módulos • 8 Clases • 2h 45m</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {CURSO_MOCK.map((modulo) => (
                        <div key={modulo.id} className="border-b border-border last:border-0">
                            <button 
                                onClick={() => toggleModulo(modulo.id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-bold text-sm pr-4 leading-tight">{modulo.titulo}</span>
                                <span className={`text-muted-foreground transition-transform ${modulosExpandidos[modulo.id] ? 'rotate-90' : ''}`}>
                                    <FiChevronLeft className="-rotate-90" />
                                </span>
                            </button>
                            
                            {modulosExpandidos[modulo.id] && (
                                <div className="bg-background pb-2">
                                    {modulo.clases.map((clase, index) => (
                                        <button 
                                            key={clase.id}
                                            onClick={() => { setClaseActiva(clase); setIsPlaying(false); }}
                                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${claseActiva.id === clase.id ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                                        >
                                            <div className="mt-1">
                                                {getIconoClase(clase.tipo, clase.completada)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${claseActiva.id === clase.id ? 'text-primary' : (clase.completada ? 'text-muted-foreground' : 'text-foreground')}`}>
                                                    {index + 1}. {clase.titulo}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                                    {clase.duracion}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
