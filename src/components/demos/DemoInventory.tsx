import { useState } from 'react';
import { FiBox, FiAlertTriangle, FiArrowUpRight, FiSearch, FiFilter, FiDownload, FiShoppingCart } from 'react-icons/fi';

interface Item {
    id: string;
    sku: string;
    nombre: string;
    categoria: string;
    stock: number;
    minimo: number;
    precio: number;
    estado: 'Óptimo' | 'Poco Stock' | 'Agotado';
}

const INITIAL_INVENTORY: Item[] = [
    { id: '1', sku: 'LAP-XPS-15', nombre: 'Laptop Dell XPS 15', categoria: 'Computadoras', stock: 42, minimo: 10, precio: 35000, estado: 'Óptimo' },
    { id: '2', sku: 'MON-LG-34', nombre: 'Monitor LG Ultrawide 34"', categoria: 'Periféricos', stock: 5, minimo: 8, precio: 8500, estado: 'Poco Stock' },
    { id: '3', sku: 'TEC-KEYCH-K2', nombre: 'Teclado Mecánico Keychron K2', categoria: 'Accesorios', stock: 120, minimo: 20, precio: 2100, estado: 'Óptimo' },
    { id: '4', sku: 'MOU-MX-MAST', nombre: 'Mouse Logitech MX Master 3', categoria: 'Accesorios', stock: 0, minimo: 15, precio: 1800, estado: 'Agotado' },
    { id: '5', sku: 'HUB-ANK-7', nombre: 'Hub USB-C Anker 7', categoria: 'Cables', stock: 8, minimo: 10, precio: 950, estado: 'Poco Stock' },
    { id: '6', sku: 'CAM-LOG-B', nombre: 'Webcam Logitech Brio 4K', categoria: 'Periféricos', stock: 18, minimo: 5, precio: 3200, estado: 'Óptimo' },
];

export default function DemoInventory() {
    const [inventario, setInventario] = useState<Item[]>(INITIAL_INVENTORY);

    const reabastecer = (id: string) => {
        setInventario(prev => prev.map(item => {
            if (item.id === id) {
                const newStock = item.stock + 20;
                let newEstado = item.estado;
                if (newStock > item.minimo) newEstado = 'Óptimo';
                return { ...item, stock: newStock, estado: newEstado as any };
            }
            return item;
        }));
    };

    const getStatusStyle = (estado: string) => {
        switch(estado) {
            case 'Óptimo': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'Poco Stock': return 'bg-amber-500/10 text-amber-600 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
            case 'Agotado': return 'bg-red-500/10 text-red-600 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] font-bold';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
                        <FiBox className="text-primary" /> Gestión de Inventario Central
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Control de almacén con alertas inteligentes de reabastecimiento.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                        <FiDownload /> Reporte
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                        <FiArrowUpRight /> Ingreso Stock
                    </button>
                </div>
            </div>

            {/* Widgets KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        <FiBox />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total SKUs</p>
                        <p className="text-2xl font-black mt-0.5">1,204</p>
                    </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500"></div>
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        <FiAlertTriangle />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Poco Stock</p>
                        <p className="text-2xl font-black mt-0.5">{inventario.filter(i => i.estado === 'Poco Stock').length}</p>
                    </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500"></div>
                    <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        <FiShoppingCart />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Agotados</p>
                        <p className="text-2xl font-black mt-0.5">{inventario.filter(i => i.estado === 'Agotado').length}</p>
                    </div>
                </div>
            </div>

            {/* Listado / Tabla */}
            <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full sm:w-80">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Buscar por SKU o Producto..." className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted w-full sm:w-auto justify-center">
                        <FiFilter /> Categorías
                    </button>
                </div>

                <div className="overflow-x-auto flex-1 p-2">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                <th className="px-4 py-3">Código SKU</th>
                                <th className="px-4 py-3">Producto</th>
                                <th className="px-4 py-3 text-right">Cant. Actual</th>
                                <th className="px-4 py-3">Barra de Nivel</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {inventario.map(item => {
                                const cap = Math.max(item.stock, item.minimo * 3);
                                const pct = (item.stock / cap) * 100;

                                return (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-muted-foreground">{item.sku}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold">{item.nombre}</div>
                                            <div className="text-xs text-muted-foreground">{item.categoria}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-lg">
                                            {item.stock}
                                        </td>
                                        <td className="px-4 py-3 w-48">
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${pct > 40 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[9px] text-muted-foreground mt-1 text-right">Min: {item.minimo}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${getStatusStyle(item.estado)}`}>
                                                {item.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => reabastecer(item.id)}
                                                className={`text-xs px-3 py-1.5 rounded font-bold shadow-sm transition-transform active:scale-95 ${item.estado !== 'Óptimo' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card border border-border text-muted-foreground opacity-50 cursor-not-allowed'}`}
                                                disabled={item.estado === 'Óptimo'}
                                            >
                                                Comprar
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-4 text-center">
                 <p className="text-xs text-muted-foreground">
                    ⚡ <strong>Prueba la alerta:</strong> Presiona "Comprar" en los items agotados o con poco stock para ver cómo se actualiza el estatus en tiempo real.
                 </p>
            </div>
        </div>
    );
}
