import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPieChart, FiUsers, FiCalendar, FiDatabase,
    FiShoppingCart, FiBriefcase, FiHeadphones,
    FiTrendingUp, FiBox, FiBookOpen, FiArrowRight,
    FiCheckCircle, FiSearch, FiZap
} from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const servicios = [
    {
        id: 1,
        title: 'CRM con Pipeline',
        icon: FiUsers,
        desc: 'Gestión de relaciones con clientes, seguimiento de ventas y embudos comerciales.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm overflow-hidden text-left border border-border">
                {/* Header CRM */}
                <div className="bg-muted/50 p-2 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">CRM</div>
                        <span className="text-xs font-semibold">Sales Pipeline</span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center text-[8px]">+</div>
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-border">
                            <img src="https://i.pravatar.cc/100?img=33" alt="user" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
                {/* Board CRM */}
                <div className="p-3 flex-1 flex gap-3 overflow-x-hidden bg-muted/10">
                    {/* Column 1 */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Leads</span>
                            <span className="text-[9px] bg-muted px-1.5 rounded-full">3</span>
                        </div>
                        <div className="bg-card p-2 rounded border border-border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                            <span className="text-[10px] font-bold">Reise Corp</span>
                            <span className="text-[8px] text-muted-foreground">$12,000 MXN</span>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[7px] bg-blue-400/10 text-blue-500 px-1 rounded">Nuevo</span>
                                <div className="w-4 h-4 rounded-full overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt="agent" /></div>
                            </div>
                        </div>
                        <div className="bg-card p-2 rounded border border-border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                            <span className="text-[10px] font-bold">Tech Flow SL</span>
                            <span className="text-[8px] text-muted-foreground">$8,500 MXN</span>
                        </div>
                    </div>
                    {/* Column 2 */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Negociación</span>
                            <span className="text-[9px] bg-muted px-1.5 rounded-full">1</span>
                        </div>
                        <div className="bg-card p-2 rounded border border-border shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            <span className="text-[10px] font-bold">Inversiones XYZ</span>
                            <span className="text-[8px] text-muted-foreground">$45,000 MXN</span>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[7px] bg-amber-400/10 text-amber-500 px-1 rounded">Prioridad Alta</span>
                                <div className="w-4 h-4 rounded-full overflow-hidden"><img src="https://i.pravatar.cc/100?img=47" alt="agent" /></div>
                            </div>
                        </div>
                    </div>
                    {/* Column 3 */}
                    <div className="w-1/3 flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Cerrados</span>
                            <span className="text-[9px] bg-primary/20 text-primary px-1.5 rounded-full font-bold">12</span>
                        </div>
                        <div className="bg-card p-2 rounded border border-green-500/30 shadow-sm flex flex-col gap-2 relative overflow-hidden cursor-pointer">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <span className="text-[10px] font-bold flex items-center gap-1"><FiCheckCircle className="text-green-500 w-3 h-3" /> Stark Ind.</span>
                            <span className="text-[8px] text-muted-foreground">$120,000 MXN</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: 'Dashboards Analíticos',
        icon: FiPieChart,
        desc: 'Visualización de datos en tiempo real, métricas clave y reportes automatizados.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm overflow-hidden text-left border border-border p-3 gap-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-xs font-bold">Resumen Financiero</h4>
                        <p className="text-[8px] text-muted-foreground">Actualizado hace 2 minutos</p>
                    </div>
                    <select className="text-[8px] border border-border bg-muted rounded px-1.5 py-0.5 outline-none">
                        <option>Este Mes</option>
                    </select>
                </div>
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-card border border-border p-2 rounded shadow-sm flex flex-col gap-1">
                        <span className="text-[8px] text-muted-foreground uppercase">Ingresos</span>
                        <span className="text-sm font-bold">$124K</span>
                        <span className="text-[7px] text-green-500 flex items-center"><FiTrendingUp className="mr-0.5" /> +14%</span>
                    </div>
                    <div className="bg-card border border-border p-2 rounded shadow-sm flex flex-col gap-1">
                        <span className="text-[8px] text-muted-foreground uppercase">Usuarios</span>
                        <span className="text-sm font-bold">1,842</span>
                        <span className="text-[7px] text-green-500 flex items-center"><FiTrendingUp className="mr-0.5" /> +5%</span>
                    </div>
                    <div className="bg-card border border-border p-2 rounded shadow-sm flex flex-col gap-1">
                        <span className="text-[8px] text-muted-foreground uppercase">Churn</span>
                        <span className="text-sm font-bold">1.2%</span>
                        <span className="text-[7px] text-red-500 flex items-center"><FiTrendingUp className="mr-0.5 rotate-180" /> -0.4%</span>
                    </div>
                </div>
                {/* Chart Mockup */}
                <div className="flex-1 border border-border rounded p-2 bg-card shadow-sm flex flex-col">
                    <span className="text-[9px] font-semibold mb-2">Crecimiento Anual</span>
                    <div className="flex-1 flex items-end justify-between gap-1 mt-2 relative">
                        {/* Grid lines */}
                        <div className="absolute w-full h-px bg-border/50 top-0 left-0"></div>
                        <div className="absolute w-full h-px bg-border/50 top-1/2 left-0"></div>
                        <div className="absolute w-full h-px border-b border-dashed border-border/50 bottom-0 left-0 z-0"></div>

                        {[40, 55, 45, 70, 65, 85, 80, 100, 95].map((h, i) => (
                            <div key={i} className="w-full relative group z-10 flex flex-col justify-end h-full">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`w-full rounded-t-sm ${i === 8 ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary/60'} transition-colors cursor-pointer`}
                                ></motion.div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between w-full text-[6px] text-muted-foreground mt-1 px-1">
                        <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: 'Sistemas de Registros',
        icon: FiDatabase,
        desc: 'Bases de datos seguras para pacientes, alumnos, inventarios o cualquier necesidad.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm overflow-hidden text-left border border-border">
                <div className="bg-card p-2 border-b border-border flex justify-between items-center">
                    <div className="relative w-1/2">
                        <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-3 h-3" />
                        <input type="text" placeholder="Buscar registros..." className="w-full text-[9px] pl-6 pr-2 py-1.5 rounded-full border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <button className="bg-primary text-primary-foreground text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                        + Agregar Nuevo
                    </button>
                </div>
                <div className="flex-1 overflow-auto bg-muted/5 p-2">
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border text-[8px] text-muted-foreground uppercase tracking-wider">
                                    <th className="p-2 font-medium">Expediente</th>
                                    <th className="p-2 font-medium">Persona / Contacto</th>
                                    <th className="p-2 font-medium">Última Visita</th>
                                    <th className="p-2 font-medium">Estado</th>
                                    <th className="p-2 font-medium text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 text-[9px]">
                                {[
                                    { id: 'EXP-9012', name: 'Laura Gómez', email: 'laura.g@mail.com', date: '12 Oct, 2026', status: 'Activo', color: 'bg-green-500/10 text-green-600' },
                                    { id: 'EXP-9013', name: 'Roberto Díaz', email: 'roberto@mail.com', date: '05 Oct, 2026', status: 'En Trámite', color: 'bg-amber-500/10 text-amber-600' },
                                    { id: 'EXP-9014', name: 'Alba Martínez', email: 'alba@correo.mx', date: '28 Sep, 2026', status: 'Inactivo', color: 'bg-red-500/10 text-red-600' },
                                    { id: 'EXP-9015', name: 'Carlos Ruiz', email: 'cruiz@empresa.com', date: '21 Sep, 2026', status: 'Activo', color: 'bg-green-500/10 text-green-600' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-2 font-mono text-muted-foreground">{row.id}</td>
                                        <td className="p-2">
                                            <div className="font-semibold text-foreground">{row.name}</div>
                                            <div className="text-[7px] text-muted-foreground">{row.email}</div>
                                        </td>
                                        <td className="p-2 text-muted-foreground">{row.date}</td>
                                        <td className="p-2">
                                            <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold ${row.color}`}>{row.status}</span>
                                        </td>
                                        <td className="p-2 text-right">
                                            <button className="text-primary hover:underline">Ver</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-muted/30 p-2 border-t border-border flex justify-between items-center text-[8px] text-muted-foreground">
                    <span>Mostrando 1-4 de 248 registros</span>
                    <div className="flex gap-1">
                        <button className="bg-background border border-border px-1.5 py-0.5 rounded cursor-not-allowed opacity-50">Ant</button>
                        <button className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded">1</button>
                        <button className="bg-background border border-border px-1.5 py-0.5 rounded hover:bg-muted">2</button>
                        <button className="bg-background border border-border px-1.5 py-0.5 rounded hover:bg-muted">Sig</button>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 4,
        title: 'Agendas y Reservas',
        icon: FiCalendar,
        desc: 'Sistemas de citas en línea, sincronización de calendarios y recordatorios automáticos.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm overflow-hidden text-left border border-border flex-row">
                {/* Sidebar Calendar */}
                <div className="w-2/5 border-r border-border p-2 bg-muted/10 flex flex-col gap-3">
                    <button className="w-full bg-primary text-primary-foreground text-[10px] font-bold py-1.5 rounded-md shadow-sm">+ Nueva Cita</button>
                    <div className="bg-card rounded-md border border-border p-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-bold">Oct 2026</span>
                            <div className="flex gap-1">
                                <span className="w-3 h-3 bg-muted rounded flex items-center justify-center text-[6px]">&lt;</span>
                                <span className="w-3 h-3 bg-muted rounded flex items-center justify-center text-[6px]">&gt;</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 text-center text-[6px] font-medium text-muted-foreground mb-1">
                            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div><div>Do</div>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 text-center text-[7px]">
                            {Array.from({ length: 31 }).map((_, i) => (
                                <div key={i} className={`py-0.5 rounded-sm ${i === 14 ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted cursor-pointer'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Daily Schedule */}
                <div className="w-3/5 p-0 flex flex-col bg-background relative overflow-hidden">
                    <div className="p-2 border-b border-border text-[10px] font-bold bg-card sticky top-0 z-10">Jueves, 15 de Octubre</div>
                    <div className="flex-1 overflow-y-auto relative p-2" style={{ backgroundSize: '100% 24px', backgroundImage: 'linear-gradient(to bottom, transparent 23px, var(--border) 24px)' }}>
                        <div className="absolute top-[10px] left-2 right-2 bg-blue-500/10 border-l-2 border-blue-500 p-1 rounded-r shadow-sm text-[8px]">
                            <div className="font-bold text-blue-700 dark:text-blue-300">Reunión de Avance</div>
                            <div className="text-blue-600/80 dark:text-blue-400/80">09:00 AM - 10:00 AM</div>
                        </div>
                        <div className="absolute top-[58px] left-2 right-6 bg-purple-500/10 border-l-2 border-purple-500 p-1 rounded-r shadow-sm text-[8px]">
                            <div className="font-bold text-purple-700 dark:text-purple-300">Consulta Cliente A</div>
                            <div className="text-purple-600/80 dark:text-purple-400/80">11:00 AM - 11:30 AM</div>
                        </div>
                        <div className="absolute top-[106px] left-2 right-2 bg-amber-500/10 border-l-2 border-amber-500 p-1 rounded-r shadow-sm text-[8px]">
                            <div className="font-bold text-amber-700 dark:text-amber-300">Almuerzo Equipo</div>
                            <div className="text-amber-600/80 dark:text-amber-400/80">01:00 PM - 02:00 PM</div>
                        </div>
                        {/* Current time indicator */}
                        <div className="absolute top-[80px] left-0 right-0 h-px bg-red-500 z-20 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 -ml-0.5"></div>
                        </div>
                        <div className="h-[200px]"></div> {/* spacer for scroll */}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 5,
        title: 'E-Commerce y Tiendas',
        icon: FiShoppingCart,
        desc: 'Tiendas online con pasarelas de pago integradas y control de stock.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-xl shadow-lg border border-border overflow-hidden">
                {/* Store Header */}
                <div className="bg-card p-3 border-b border-border flex justify-between items-center">
                    <div className="font-bold tracking-tighter text-sm flex items-center gap-1">
                        <div className="w-4 h-4 bg-primary rounded-sm rotate-45 flex items-center justify-center"><div className="w-2 h-2 bg-background rounded-full -rotate-45"></div></div>
                        <span className="ml-1">LuxeStore</span>
                    </div>
                    <div className="flex gap-3 text-muted-foreground items-center">
                        <FiSearch className="w-3 h-3 cursor-pointer hover:text-primary transition-colors" />
                        <div className="relative cursor-pointer hover:text-primary transition-colors">
                            <FiShoppingCart className="w-4 h-4" />
                            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[6px] w-3 h-3 flex items-center justify-center rounded-full font-bold">2</span>
                        </div>
                    </div>
                </div>
                {/* Categories */}
                <div className="flex gap-2 p-2 overflow-x-hidden border-b border-border/50 bg-muted/10 text-[8px] font-semibold">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full whitespace-nowrap">Novedades</span>
                    <span className="bg-card border border-border px-2 py-1 rounded-full whitespace-nowrap text-muted-foreground hover:bg-muted cursor-pointer">Colección Otoño</span>
                    <span className="bg-card border border-border px-2 py-1 rounded-full whitespace-nowrap text-muted-foreground hover:bg-muted cursor-pointer">Accesorios</span>
                    <span className="bg-card border border-border px-2 py-1 rounded-full whitespace-nowrap text-muted-foreground hover:bg-muted cursor-pointer">Ofertas</span>
                </div>
                {/* Product Grid */}
                <div className="flex-1 p-3 grid grid-cols-2 gap-3 overflow-y-auto bg-muted/5">
                    {[
                        { n: 'Reloj Cronógrafo Noir', p: '$4,500 MXN', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&h=100' },
                        { n: 'Auriculares Studio X', p: '$2,800 MXN', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100&h=100' },
                        { n: 'Mochila Urbana Eco', p: '$1,200 MXN', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=100&h=100' },
                        { n: 'Lentes Aviador Clas.', p: '$850 MXN', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=100&h=100' },
                    ].map((item, i) => (
                        <div key={i} className="bg-card rounded-lg overflow-hidden border border-border shadow-sm group hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                            <div className="aspect-square bg-muted relative overflow-hidden">
                                <img src={item.img} alt={item.n} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {i === 0 && <span className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[6px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Nuevo</span>}
                            </div>
                            <div className="p-2 flex flex-col flex-1 justify-between">
                                <div>
                                    <h5 className="text-[9px] font-bold leading-tight mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">{item.n}</h5>
                                    <p className="text-[10px] text-muted-foreground mb-2">{item.p}</p>
                                </div>
                                <button className="w-full bg-primary/10 text-primary font-bold text-[8px] py-1.5 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-auto">
                                    Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: 6,
        title: 'Portal de Empleados',
        icon: FiBriefcase,
        desc: 'Gestión de recursos humanos, nóminas, vacaciones y comunicación interna.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm border border-border overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-primary/80 to-secondary/80 relative">
                    {/* Header bg */}
                </div>
                <div className="px-4 pb-4 relative flex-1 flex flex-col">
                    <div className="w-12 h-12 rounded-full border-2 border-background shadow-md overflow-hidden bg-muted absolute -top-6 left-4 z-10">
                        <img src="https://i.pravatar.cc/100?img=5" alt="employee" className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-7 flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Carlos Sánchez</h3>
                            <p className="text-[9px] text-muted-foreground flex items-center gap-1"><FiBriefcase className="w-2 h-2" /> Desarrollo Hnos. • IT Dept.</p>
                        </div>
                        <span className="bg-green-500/10 text-green-600 border border-green-500/20 text-[7px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="bg-card border border-border p-2 rounded-lg flex flex-col gap-1 items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-primary">12 Días</span>
                            <span className="text-[7px] text-muted-foreground uppercase">Vacaciones Disp.</span>
                        </div>
                        <div className="bg-card border border-border p-2 rounded-lg flex flex-col gap-1 items-center justify-center text-center cursor-pointer hover:bg-muted">
                            <FiCheckCircle className="text-primary w-4 h-4 mb-0.5" />
                            <span className="text-[8px] font-bold">Ver Nóminas</span>
                        </div>
                    </div>

                    <div className="mt-4 flex-1">
                        <h4 className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider mb-2">Anuncios Recientes</h4>
                        <div className="space-y-2">
                            <div className="bg-muted/30 border border-border p-2 rounded shadow-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-bold">Evaluación de Desempeño</span>
                                    <span className="text-[7px] text-muted-foreground">Hace 2h</span>
                                </div>
                                <p className="text-[8px] text-muted-foreground leading-tight">Recuerda completar tu autoevaluación 360 antes del viernes próximo. Es mandatorio para todos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 7,
        title: 'Sistema de Tickets',
        icon: FiHeadphones,
        desc: 'Plataforma de atención al cliente tipo Helpdesk para gestionar incidencias.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm border border-border overflow-hidden">
                <div className="bg-card p-2 border-b border-border flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded">Abiertos (4)</div>
                        <div className="text-[10px] font-medium text-muted-foreground hover:bg-muted px-2 py-1 rounded cursor-pointer">Resueltos</div>
                    </div>
                    <button className="bg-foreground text-background text-[9px] font-bold px-2 py-1 rounded shadow-sm">+ Nuevo Ticket</button>
                </div>
                <div className="flex-1 overflow-y-auto bg-muted/5 divide-y divide-border/50">
                    {[
                        { id: '#4091', title: 'Error al procesar pago con tarjeta', user: 'Ana M.', avatar: 'https://i.pravatar.cc/100?img=1', time: '10 min', prio: 'Urgente', pColor: 'bg-red-500', tColor: 'text-red-500' },
                        { id: '#4090', title: 'Solicitud de cambio de plan anual', user: 'Empresa Z', avatar: 'https://i.pravatar.cc/100?img=2', time: '1 hr', prio: 'Normal', pColor: 'bg-blue-500', tColor: 'text-blue-500' },
                        { id: '#4089', title: 'Problema de acceso a cuenta compartida', user: 'Luis G.', avatar: 'https://i.pravatar.cc/100?img=3', time: '3 hrs', prio: 'Alta', pColor: 'bg-amber-500', tColor: 'text-amber-500' },
                        { id: '#4088', title: 'Duda sobre la facturación de Abril', user: 'Laura S.', avatar: 'https://i.pravatar.cc/100?img=4', time: '1 día', prio: 'Baja', pColor: 'bg-slate-400', tColor: 'text-slate-500' },
                    ].map((t, i) => (
                        <div key={i} className="p-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-2">
                                <div className="text-[11px] font-semibold leading-tight">{t.title}</div>
                                <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${t.pColor} bg-opacity-10 ${t.tColor} border border-current shadow-sm`}>{t.prio}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <img src={t.avatar} className="w-4 h-4 rounded-full border border-border" />
                                    <span className="text-[9px] text-muted-foreground">{t.user} <span className="opacity-50 mx-0.5">•</span> {t.id}</span>
                                </div>
                                <span className="text-[8px] text-muted-foreground">{t.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: 8,
        title: 'Embudos y Marketing',
        icon: FiTrendingUp,
        desc: 'Landing pages optimizadas para conversión y captación de leads.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-lg border border-border overflow-hidden lg:flex-row">
                {/* Sidebar mock builder */}
                <div className="w-1/4 bg-card border-r border-border p-2 hidden sm:flex flex-col gap-2">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Bloques</span>
                    <div className="bg-muted border border-border rounded p-1.5 flex flex-col items-center gap-1 cursor-grab hover:border-primary">
                        <div className="w-6 h-4 bg-primary/20 rounded-sm"></div>
                        <span className="text-[6px] font-medium">Hero</span>
                    </div>
                    <div className="bg-muted border border-border rounded p-1.5 flex flex-col items-center gap-1 cursor-grab hover:border-primary">
                        <div className="w-6 h-4 border border-primary/20 bg-background rounded-sm"></div>
                        <span className="text-[6px] font-medium">Features</span>
                    </div>
                    <div className="bg-muted border border-border rounded p-1.5 flex flex-col items-center gap-1 cursor-grab border-primary shadow-sm relative">
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                        <div className="w-6 h-4 bg-background border border-border rounded-sm flex items-center justify-center"><div className="w-3 h-1 bg-primary/50 rounded-sm"></div></div>
                        <span className="text-[6px] font-medium text-primary">Form</span>
                    </div>
                </div>
                {/* Canvas mockup */}
                <div className="flex-1 bg-muted/20 relative p-3 flex flex-col items-center justify-center">
                    <div className="w-full max-w-[200px] bg-background shadow-xl rounded-lg border border-primary/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 left-0 h-4 bg-background border-b border-border flex items-center justify-center p-1 cursor-move hover:bg-muted">
                            <div className="w-4 h-1 bg-border rounded-full"></div>
                        </div>
                        <div className="p-4 pt-6 text-center space-y-3">
                            <div className="mx-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                <FiTrendingUp className="w-4 h-4" />
                            </div>
                            <h4 className="text-[12px] font-extrabold leading-tight">Descarga Tu Guía Gratuita</h4>
                            <p className="text-[8px] text-muted-foreground leading-snug px-2">Descubre los 5 secretos para escalar tu agencia en 90 días o menos.</p>

                            <div className="space-y-1.5 mt-4">
                                <div className="h-6 w-full border border-border rounded flex items-center px-2 shadow-inner bg-muted/10 relative overflow-hidden group">
                                    <span className="text-[7px] text-muted-foreground group-hover:hidden">nombre@agencia.com</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-blue-500/10 border-l border-blue-500/20 hidden group-hover:block"></div>
                                </div>
                                <button className="w-full h-7 bg-primary rounded text-[9px] font-bold text-primary-foreground shadow-md hover:scale-[1.02] transition-transform">
                                    ¡Descargar Ahora!
                                </button>
                            </div>
                            <p className="text-[6px] text-muted-foreground opacity-70 mt-2">*Tus datos están %100 seguros.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 9,
        title: 'Gestión de Inventarios',
        icon: FiBox,
        desc: 'Control de almacén, entradas, salidas y alertas de reabastecimiento.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm border border-border overflow-hidden p-3 gap-2">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                        <FiBox className="text-primary" /> Inventario Central
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[9px] text-destructive font-bold">1 Alerta</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-card border border-border p-2 rounded shadow-sm">
                        <div className="text-[8px] text-muted-foreground mb-0.5">Total SKU</div>
                        <div className="text-xs font-bold">1,402</div>
                    </div>
                    <div className="bg-card border border-border p-2 rounded shadow-sm">
                        <div className="text-[8px] text-muted-foreground mb-0.5">Pendiente de ingreso</div>
                        <div className="text-xs font-bold text-primary">24 Cajas</div>
                    </div>
                </div>

                <div className="flex-1 bg-card border border-border rounded shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-muted p-2 border-b border-border text-[8px] font-bold uppercase text-muted-foreground grid grid-cols-12">
                        <div className="col-span-6">Producto</div>
                        <div className="col-span-3 text-right">Stock</div>
                        <div className="col-span-3 text-right">Cap.</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 divide-y divide-border/50">
                        {[
                            { n: 'Laptop XPS 15', c: 'TEC-901', s: 45, cap: 50, critical: false },
                            { n: 'Monitor Ultra 34"', c: 'TEC-882', s: 3, cap: 20, critical: true },
                            { n: 'Teclado Mecánico', c: 'ACC-110', s: 120, cap: 150, critical: false },
                            { n: 'Webcam 4K PRO', c: 'ACC-304', s: 15, cap: 30, critical: false },
                        ].map((item, i) => {
                            const pct = Math.round((item.s / item.cap) * 100);
                            return (
                                <div key={i} className="p-1.5 grid grid-cols-12 items-center hover:bg-muted/30">
                                    <div className="col-span-6">
                                        <div className="text-[9px] font-semibold truncate leading-tight">{item.n}</div>
                                        <div className="text-[7px] text-muted-foreground">{item.c}</div>
                                    </div>
                                    <div className={`col-span-3 text-right text-[10px] font-mono ${item.critical ? 'text-destructive font-bold' : ''}`}>
                                        {item.s}
                                    </div>
                                    <div className="col-span-3 pl-2 flex items-center">
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${item.critical ? 'bg-destructive' : pct > 80 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: 'Plataformas E-Learning',
        icon: FiBookOpen,
        desc: 'Escuelas virtuales con cursos, evaluaciones y seguimiento de progreso.',
        preview: (
            <div className="flex flex-col h-full bg-background rounded-md shadow-sm border border-border overflow-hidden">
                {/* Navbar mock */}
                <div className="bg-card p-2 border-b border-border flex justify-between items-center">
                    <span className="text-[10px] font-black tracking-tight flex items-center gap-1"><FiBookOpen className="text-primary" /> AcademIA</span>
                    <div className="w-5 h-5 rounded-full bg-muted border border-border overflow-hidden"><img src="https://i.pravatar.cc/100?img=32" /></div>
                </div>
                {/* Player Layout */}
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-2/3 flex flex-col border-r border-border">
                        {/* Video Mockup */}
                        <div className="aspect-video bg-black relative group flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=300" className="opacity-50 object-cover w-full h-full absolute inset-0" />
                            <div className="w-8 h-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg relative z-10 cursor-pointer hover:scale-110 transition-transform">
                                <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-white ml-1"></div>
                            </div>
                            {/* Progres bar video */}
                            <div className="absolute bottom-0 w-full h-1 bg-white/20">
                                <div className="h-full bg-primary" style={{ width: '35%' }}></div>
                            </div>
                        </div>
                        {/* Course info */}
                        <div className="p-3 bg-card flex-1">
                            <h2 className="text-[11px] font-bold">Módulo 3: React Avanzado y Estado Local</h2>
                            <p className="text-[8px] text-muted-foreground mt-1">Aprende a gestionar el ciclo de vida de manera declarativa construyendo este clon interactivo.</p>
                        </div>
                    </div>
                    {/* Sidebar Syllabus */}
                    <div className="w-1/3 bg-muted/10 flex flex-col">
                        <div className="p-2 border-b border-border text-[9px] font-bold bg-muted/30">Temario</div>
                        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                            {[
                                { t: '1. useState a Profundidad', min: '12:40', done: true, active: false },
                                { t: '2. useEffect sin errores', min: '18:15', done: true, active: false },
                                { t: '3. Construyendo el clon', min: '24:50', done: false, active: true },
                                { t: '4. Tarea Módulo 3', min: 'Test', done: false, active: false },
                            ].map((lec, i) => (
                                <div key={i} className={`p-2 flex border-l-2 cursor-pointer ${lec.active ? 'bg-card border-primary' : 'border-transparent hover:bg-muted/50'}`}>
                                    <div className="mr-1.5 mt-0.5">
                                        {lec.done ? <FiCheckCircle className="w-3 h-3 text-green-500" /> : lec.active ? <div className="w-3 h-3 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-1 h-1 bg-primary rounded-full"></div></div> : <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30"></div>}
                                    </div>
                                    <div>
                                        <div className={`text-[8px] font-medium leading-tight ${lec.active ? 'text-primary' : 'text-foreground'}`}>{lec.t}</div>
                                        <div className="text-[6px] text-muted-foreground mt-0.5">{lec.min}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
];

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState(servicios[0].id);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-background py-20 sm:py-32">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl mb-6"
                    >
                        Sistemas Inteligentes para <br className="hidden sm:block" />
                        <span className="text-primary">Evolucionar tu Negocio</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 text-lg sm:text-xl leading-8 text-muted-foreground max-w-2xl mx-auto"
                    >
                        Digitalizamos y automatizamos tus procesos con tecnología de punta.
                        Desde CRMs completos hasta Dashboards de análisis. Impulsa tu productividad al máximo.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 flex items-center justify-center gap-x-6"
                    >
                        <Link
                            to="/cotizacion"
                            className="rounded-md bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary inline-flex items-center group transition-all"
                        >
                            Solicita tu Cotización
                            <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Interactive Showcase Section */}
            <section className="py-24 bg-muted/20 border-y border-border/50">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">Soluciones a tu Medida</h2>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Explora ejemplos visuales de lo que podemos construir para ti. Selecciona un rubro para ver una vista previa interactiva.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
                        {/* Sidebar list */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-2 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border rounded-full hidden lg:block"></div>
                            {servicios.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveTab(s.id)}
                                    className={`text-left p-4 rounded-xl transition-all relative overflow-hidden group ${activeTab === s.id ? 'bg-card shadow-md border border-border' : 'hover:bg-muted/50 border border-transparent'}`}
                                >
                                    {activeTab === s.id && (
                                        <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10 hidden lg:block" />
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${activeTab === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            <s.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold text-sm ${activeTab === s.id ? 'text-primary' : 'text-foreground'}`}>{s.title}</h3>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Content Preview Display */}
                        <div className="w-full lg:w-2/3 lg:sticky lg:top-24">
                            <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden aspect-[16/10] sm:aspect-video lg:aspect-[4/3] relative flex flex-col">
                                {/* Browser Mockup Header */}
                                <div className="h-10 bg-muted border-b border-border flex items-center px-4 gap-2 w-full shrink-0">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                                    </div>
                                    <div className="mx-auto bg-background/50 border border-border/50 text-[10px] text-muted-foreground px-4 py-1 rounded w-1/2 flex justify-center backdrop-blur-sm truncate">
                                        https://tu-empresa.com/{servicios.find(s => s.id === activeTab)?.title.toLowerCase().replace(/ /g, '-')}
                                    </div>
                                </div>

                                {/* Main Preview Content */}
                                <div className="flex-1 bg-muted/10 p-4 sm:p-8 relative overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute inset-4 sm:inset-8 flex flex-col"
                                        >
                                            <div className="mb-6">
                                                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                                    {servicios.find(s => s.id === activeTab)?.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm mt-2 max-w-lg">
                                                    {servicios.find(s => s.id === activeTab)?.desc}
                                                </p>
                                            </div>

                                            <div className="flex-1 rounded-xl bg-background border border-border/80 shadow-2xl overflow-hidden relative group">
                                                {/* THE ACTUAL PREVIEW COMPONENT INSERTED HERE */}
                                                <div className="absolute inset-0 pointer-events-none p-1 bg-muted/20">
                                                    {servicios.find(s => s.id === activeTab)?.preview}
                                                </div>

                                                {/* Overlay to drive users to quote */}
                                                <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto flex-col sm:flex-row gap-4 p-4">
                                                    <Link to={`/demo/${activeTab}`} className="bg-background text-foreground border-2 border-primary px-6 py-3 rounded-full font-bold shadow-lg hover:bg-primary/10 transition-colors flex items-center gap-2">
                                                        <FiZap className="text-primary" /> Probar Demo Interactiva
                                                    </Link>
                                                    <Link to="/cotizacion" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                                        Me interesa este proyecto <FiArrowRight />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Mobile CTA */}
                            <div className="mt-8 text-center lg:hidden">
                                <Link to="/cotizacion" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-lg hover:bg-primary/90 transition-colors">
                                    Solicitar Cotización <FiArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Call to Action */}
            <section className="py-20 bg-background relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 text-center bg-primary rounded-3xl p-10 md:p-20 relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary mix-blend-multiply" />
                    <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 relative z-10">¿Listo para transformar tu idea en realidad?</h2>
                    <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-10 relative z-10">
                        Nuestro equipo de expertos está preparado para desarrollar el sistema que llevara tu empresa al siguiente nivel. Obtén una propuesta con IA integrada en minutos.
                    </p>
                    <Link
                        to="/cotizacion"
                        className="rounded-md bg-background px-8 py-4 text-primary font-bold shadow hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 relative z-10 inline-flex items-center hover:scale-105 transition-transform"
                    >
                        Iniciar Proyecto Ahora
                    </Link>
                </div>
            </section>
        </div>
    );
}
