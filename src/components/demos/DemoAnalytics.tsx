import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiPieChart, FiDollarSign, FiUsers, FiActivity } from 'react-icons/fi';

const dataMeses = [
    { name: 'Ene', ingresos: 45000, usuarios: 1200 },
    { name: 'Feb', ingresos: 52000, usuarios: 1400 },
    { name: 'Mar', ingresos: 48000, usuarios: 1350 },
    { name: 'Abr', ingresos: 61000, usuarios: 1700 },
    { name: 'May', ingresos: 59000, usuarios: 1650 },
    { name: 'Jun', ingresos: 75000, usuarios: 2100 },
    { name: 'Jul', ingresos: 82000, usuarios: 2400 },
    { name: 'Ago', ingresos: 80000, usuarios: 2350 },
    { name: 'Sep', ingresos: 95000, usuarios: 2800 },
    { name: 'Oct', ingresos: 104000, usuarios: 3100 },
    { name: 'Nov', ingresos: 120000, usuarios: 3500 },
    { name: 'Dic', ingresos: 124000, usuarios: 3800 },
];

const dataFuentes = [
    { name: 'Orgánico', value: 4000 },
    { name: 'Referidos', value: 3000 },
    { name: 'Redes Sociales', value: 2000 },
    { name: 'Campaña Ads', value: 1500 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/90 backdrop-blur-md p-3 border border-border shadow-xl rounded-xl">
                <p className="font-bold text-sm mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs font-semibold flex items-center gap-2" style={{ color: entry.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        {entry.name === 'ingresos' ? 'Ingresos: ' : 'Nuevos Usuarios: '}
                        {entry.name === 'ingresos' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DemoAnalytics() {
    const [timeframe, setTimeframe] = useState('Anual');

    return (
        <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 overflow-y-auto animate-in fade-in duration-500 bg-background/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Panel Analítico</h2>
                    <p className="text-sm text-muted-foreground mt-1">Métricas en tiempo real e insights de negocio.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${timeframe === 'Mensual' ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border hover:bg-muted text-muted-foreground'}`} onClick={() => setTimeframe('Mensual')}>Mensual</button>
                    <button className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${timeframe === 'Trimestral' ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border hover:bg-muted text-muted-foreground'}`} onClick={() => setTimeframe('Trimestral')}>Trimestral</button>
                    <button className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${timeframe === 'Anual' ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border hover:bg-muted text-muted-foreground'}`} onClick={() => setTimeframe('Anual')}>Anual</button>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
                        <FiDollarSign className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ingresos Totales</span>
                        <div className="text-3xl font-black mt-2 mb-1">$845,000</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                            <FiTrendingUp /> +14.5% vs ant.
                        </div>
                    </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                        <FiUsers className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Usuarios Activos</span>
                        <div className="text-3xl font-black mt-2 mb-1">24,302</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                            <FiTrendingUp /> +8.2% vs ant.
                        </div>
                    </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-amber-500/5 group-hover:text-amber-500/10 transition-colors">
                        <FiActivity className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversión</span>
                        <div className="text-3xl font-black mt-2 mb-1">4.6%</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
                            <FiTrendingUp /> +0.4% vs ant.
                        </div>
                    </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 text-red-500/5 group-hover:text-red-500/10 transition-colors">
                        <FiPieChart className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Churn Rate</span>
                        <div className="text-3xl font-black mt-2 mb-1">1.2%</div>
                        <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 w-fit px-2 py-0.5 rounded-full">
                            <FiTrendingDown className="rotate-180" /> -0.2% vs ant.
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph */}
                <div className="lg:col-span-2 bg-card p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col h-[400px]">
                    <h3 className="font-bold mb-6">Crecimiento de Ingresos vs Usuarios</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataMeses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(value) => `$${value / 1000}k`} dx={-10} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dx={10} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} className="dark:stroke-neutral-800" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area yAxisId="left" type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area yAxisId="right" type="monotone" dataKey="usuarios" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorUsuarios)" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Graphs Stacked */}
                <div className="flex flex-col gap-6">
                    {/* Pie Chart */}
                    <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm flex-1 flex flex-col min-h-[250px] lg:min-h-0">
                        <h3 className="font-bold mb-2">Fuentes de Adquisición</h3>
                        <div className="flex-1 w-full min-h-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dataFuentes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {dataFuentes.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Number in center of pie */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black">10.5k</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Leads</span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Bar Chart */}
                    <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm flex-1 flex flex-col min-h-[200px] lg:min-h-0">
                        <h3 className="font-bold mb-4">Conversión por Plan</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Básico', ventas: 400 },
                                    { name: 'Pro', ventas: 300 },
                                    { name: 'Enterprise', ventas: 150 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={5}/>
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Bar dataKey="ventas" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center">
                 <p className="text-xs text-muted-foreground bg-muted/50 inline-block px-4 py-2 rounded-full border border-border">
                    💡 <strong>Prueba Interrumpida:</strong> Esta es una visualización técnica. Los datos son generados aleatoriamente para propósito de demostración.
                 </p>
            </div>
        </div>
    );
}
