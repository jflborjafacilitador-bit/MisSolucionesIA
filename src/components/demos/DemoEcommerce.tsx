import { useState } from 'react';
import { FiShoppingCart, FiSearch, FiFilter, FiHeart, FiStar, FiChevronRight, FiCheck, FiPlus } from 'react-icons/fi';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    rating: number;
    image: string;
    isNew: boolean;
}

const PRODUCTS: Product[] = [
    { id: '1', name: 'Reloj Cronógrafo Noir', price: 4500, category: 'Accesorios', rating: 4.8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', isNew: true },
    { id: '2', name: 'Auriculares Studio X Max', price: 2800, category: 'Electrónica', rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', isNew: false },
    { id: '3', name: 'Mochila Urbana Eco-Friendly', price: 1200, category: 'Lifestyle', rating: 4.5, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', isNew: true },
    { id: '4', name: 'Lentes Aviador Clásicos', price: 850, category: 'Accesorios', rating: 4.3, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80', isNew: false },
    { id: '5', name: 'Zapatillas Runner 3000', price: 2100, category: 'Deportes', rating: 4.7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', isNew: true },
    { id: '6', name: 'Termo Premium Acero Inox', price: 450, category: 'Lifestyle', rating: 4.6, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', isNew: false },
];

export default function DemoEcommerce() {
    const [cart, setCart] = useState<Product[]>([]);
    const [addedId, setAddedId] = useState<string | null>(null);

    const handleAddToCart = (p: Product) => {
        setCart(prev => [...prev, p]);
        setAddedId(p.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 overflow-y-auto">
            {/* Header Tienda */}
            <header className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
                <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="font-extrabold text-xl tracking-tighter flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-md rotate-45 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 bg-background rounded-full -rotate-45"></div>
                        </div>
                        LuxeStore
                    </div>
                    <div className="hidden md:flex items-center gap-6 font-semibold text-sm">
                        <span className="text-foreground border-b-2 border-primary pb-1 cursor-pointer">Inicio</span>
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Colecciones</span>
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Ofertas</span>
                        <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Soporte</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <button className="hover:text-foreground transition-colors"><FiSearch className="w-5 h-5" /></button>
                        <button className="hover:text-foreground transition-colors"><FiHeart className="w-5 h-5" /></button>
                        <button className="relative hover:text-foreground transition-colors group">
                            <FiShoppingCart className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-in zoom-in group-hover:scale-110 transition-transform">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Banner Promotional */}
            <div className="bg-foreground text-background py-10 px-6 sm:py-16 text-center relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Nueva Colección Otoño</span>
                    <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">El estilo que define tu rutina.</h2>
                    <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                        Explorar Catálogo
                    </button>
                </div>
            </div>

            {/* Categorias & Filtros */}
            <div className="max-w-7xl mx-auto w-full px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-none">
                    {['Todos', 'Accesorios', 'Electrónica', 'Lifestyle', 'Deportes'].map((cat, i) => (
                        <button key={i} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-colors ${i === 0 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 border border-border rounded-lg text-sm font-bold bg-card hover:bg-muted transition-colors w-full md:w-auto justify-center">
                    <FiFilter /> Filtrar
                </button>
            </div>

            {/* Grid de Productos */}
            <div className="max-w-7xl mx-auto w-full px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {PRODUCTS.map(p => (
                    <div key={p.id} className="group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden relative">
                        {p.isNew && <span className="absolute top-4 left-4 bg-background text-foreground text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm border border-border uppercase tracking-wider">Nuevo</span>}
                        <button className="absolute top-4 right-4 z-10 p-2 bg-background/50 backdrop-blur-sm rounded-full text-muted-foreground hover:text-rose-500 hover:bg-background transition-colors shadow-sm">
                            <FiHeart />
                        </button>
                        <div className="aspect-square overflow-hidden bg-muted relative">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
                                <FiStar className="fill-current" /> <span className="font-bold text-muted-foreground">{p.rating}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                            <p className="text-xs text-muted-foreground mb-4">{p.category}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="font-black text-xl">${p.price.toLocaleString()}</span>
                                <button 
                                    onClick={() => handleAddToCart(p)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${addedId === p.id ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:scale-110'}`}
                                >
                                    {addedId === p.id ? <FiCheck className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="max-w-7xl mx-auto font-bold text-center pb-12 w-full flex items-center justify-center">
                <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    Ver más productos <FiChevronRight />
                </button>
            </div>
        </div>
    );
}
