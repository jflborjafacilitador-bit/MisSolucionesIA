import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiDatabase, FiBriefcase,
    FiTrendingUp, FiCheckCircle, FiZap, FiSun, FiMoon, FiMenu, FiX
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Magnetic from '../components/ui/Magnetic';
import TiltCard from '../components/ui/TiltCard';
import DemoMarketing from '../components/demos/DemoMarketing';
import DemoEcommerce from '../components/demos/DemoEcommerce';
import DemoCRM from '../components/demos/DemoCRM';
import DemoAnalytics from '../components/demos/DemoAnalytics';

export default function LandingPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    });
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Cerrar menú al cambiar tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <div className="bg-background selection:bg-primary/20 selection:text-foreground relative min-h-screen font-sans">

            {/* ── NAVBAR ─────────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-b border-border/50">
                <div className="flex justify-between items-center w-full px-4 sm:px-8 py-3 max-w-7xl mx-auto">

                    {/* Logo */}
                    <div className="text-xl font-serif font-bold text-foreground tracking-tight truncate">
                        MisSolucionesIA
                    </div>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center space-x-8 font-medium text-sm tracking-tight text-foreground">
                        <Link to="/portafolio" className="text-muted-foreground hover:text-foreground transition-colors">Portafolio</Link>
                        <Link to="/cotizacion" className="text-muted-foreground hover:text-foreground transition-colors">Precios</Link>
                        <Link to="/login"      className="text-muted-foreground hover:text-foreground transition-colors">Acceder</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted/50 text-foreground transition-colors"
                            aria-label="Cambiar tema"
                        >
                            {theme === 'dark'
                                ? <FiSun className="w-4 h-4 text-amber-500" />
                                : <FiMoon className="w-4 h-4 text-primary" />}
                        </button>

                        {/* CTA — desktop only */}
                        <div className="hidden sm:block">
                            <Magnetic>
                                <Link
                                    to="/cotizacion"
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm tracking-wide hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md whitespace-nowrap"
                                >
                                    Agendar Consultoría
                                </Link>
                            </Magnetic>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted/50 transition-colors"
                            aria-label="Abrir menú"
                        >
                            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                {menuOpen && (
                    <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/30 px-4 py-4 flex flex-col gap-3 text-sm font-medium">
                        <Link to="/portafolio" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">Portafolio</Link>
                        <Link to="/cotizacion" onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">Precios</Link>
                        <Link to="/login"      onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">Acceder</Link>
                        <Link
                            to="/cotizacion"
                            onClick={() => setMenuOpen(false)}
                            className="mt-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-bold text-center hover:opacity-90 active:scale-95 transition-all"
                        >
                            Agendar Consultoría
                        </Link>
                    </div>
                )}
            </nav>

            <main className="pt-16">

                {/* ── HERO SECTION ───────────────────────────────────────── */}
                <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10 sm:mb-16 max-w-4xl"
                    >
                        <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-primary uppercase mb-3 sm:mb-4 block">
                            Desarrollo de Software a la Medida
                        </span>
                        <h1
                            className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.1] mb-5 sm:mb-8"
                            style={{ textWrap: 'balance' } as React.CSSProperties}
                        >
                            Herramientas Digitales para{' '}
                            <span className="italic text-primary/80">Impulsar tu Negocio</span>.
                        </h1>
                        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            Creamos plataformas robustas, tiendas en línea y sistemas de gestión personalizados para optimizar tus operaciones y aumentar tus ventas sin complicaciones técnicas.
                        </p>
                        {/* CTA móvil visible en el hero */}
                        <div className="sm:hidden mt-6">
                            <Link
                                to="/cotizacion"
                                className="inline-block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl font-bold text-base hover:opacity-90 active:scale-95 transition-all shadow-md"
                            >
                                Agendar Consultoría
                            </Link>
                        </div>
                    </motion.div>

                    {/* Bento Grid */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6"
                    >
                        {/* Bento Large */}
                        <TiltCard className="col-span-1 md:col-span-7">
                            <div className="w-full h-56 sm:h-80 md:h-[460px] bg-card rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(212,175,55,0.06)] relative group border border-border/50">
                                <img
                                    alt="AI Workspace"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxYUSQ2ZJ4Q8a4x4RmTyHVeovaRARkgkMxj0xHfQeXcRTdX816kTKEc7vCQjLx9FE1NnDd6ZoWA2nwmerMAmcw9sNVh82jUpJf1Pzf1dMFjWVkBAR9RsUQ3sYpbM8nCwdpvfuY-1-jkcSjbcGUrXFTf3SfCORDvunPzK1E03WJdgqSG0SwHOUmIMmujjfXVrXhANjAaT-R2fTOAlSufjdjqLv9pRqrpkc7JUiGDZVm8RZcVdf2TQEVU2W7PTXaWMDKVkCVkgJ6acU"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white z-10">
                                    <div className="flex items-center space-x-2 mb-1 opacity-90">
                                        <FiZap className="text-yellow-400" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Tecnología Avanzada</span>
                                    </div>
                                    <h3 className="font-serif text-xl sm:text-3xl font-medium shadow-sm drop-shadow-md">
                                        Integración de Inteligencia Artificial
                                    </h3>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Bento Small Top */}
                        <TiltCard className="col-span-1 md:col-span-5">
                            <div className="w-full h-48 sm:h-52 md:h-[220px] bg-muted/30 rounded-2xl flex flex-col justify-end p-6 sm:p-10 relative overflow-hidden border border-border/50">
                                <div className="absolute top-0 right-0 p-6">
                                    <FiTrendingUp className="text-5xl sm:text-6xl text-primary/20" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-serif text-xl sm:text-2xl mb-1 text-foreground">Automatización de Tareas</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Conecta tus aplicaciones y elimina el trabajo repetitivo manual para tu equipo de trabajo.</p>
                                </div>
                            </div>
                        </TiltCard>

                        {/* Bento Small Bottom */}
                        <TiltCard className="col-span-1 md:col-span-5 md:col-start-8">
                            <div className="w-full h-48 sm:h-52 md:h-[220px] bg-primary text-primary-foreground rounded-2xl p-6 sm:p-8 flex items-center space-x-4 shadow-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                    <FiCheckCircle className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h4 className="font-serif text-xl sm:text-2xl mb-1 text-white">Seguridad Total</h4>
                                    <p className="text-xs sm:text-sm text-white/80">Protegemos la información sensible de tu negocio y la de tus clientes corporativos.</p>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>
                </section>

                {/* ── PROYECTOS DESTACADOS ────────────────────────────────── */}
                <section id="portafolio" className="py-16 sm:py-32 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-20 gap-4">
                            <div className="max-w-2xl">
                                <h2 className="font-serif text-3xl sm:text-5xl text-foreground mb-3 sm:mb-6">Proyectos Destacados</h2>
                                <p className="text-base sm:text-lg text-muted-foreground">Desarrollamos ecosistemas digitales enfocados y orientados a resultados tangibles. Aquí puede explorar las interfaces funcionales que creamos.</p>
                            </div>
                            <div className="mt-2 md:mt-0 shrink-0">
                                <Link to="/portafolio" className="text-primary font-bold border-b-2 border-primary/50 py-1 cursor-pointer hover:text-primary/70 transition-colors text-sm sm:text-base">
                                    Ver todas las demos →
                                </Link>
                            </div>
                        </div>

                        {/* Grid de demos — scroll horizontal en mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* Card Web Preview */}
                            <Link to="/demo/8" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm">
                                <div className="w-full h-40 bg-muted/20 border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    {/* Preview escalado — contenedor con clip para evitar overflow */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                            <DemoMarketing />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <h3 className="font-serif text-xl sm:text-2xl mb-2 sm:mb-3 text-foreground">Páginas Web B2B</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-xs sm:text-sm">Presentación corporativa veloz, persuasiva y orientada a la simple captación de clientes.</p>
                                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Probar Diseño Ahora
                                    </div>
                                </div>
                            </Link>

                            {/* Card Ecommerce */}
                            <Link to="/demo/5" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm">
                                <div className="w-full h-40 bg-muted/20 border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                            <DemoEcommerce />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <h3 className="font-serif text-xl sm:text-2xl mb-2 sm:mb-3 text-foreground">Tiendas Online Rápidas</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-xs sm:text-sm">Comercio electrónico que guía ágilmente al usuario por el catálogo hasta concluir la compra final.</p>
                                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Comprar en Tienda
                                    </div>
                                </div>
                            </Link>

                            {/* Card CRM */}
                            <Link to="/demo/1" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm">
                                <div className="w-full h-40 bg-muted/20 border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                            <DemoCRM />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <h3 className="font-serif text-xl sm:text-2xl mb-2 sm:mb-3 text-foreground">Gestor Inmobiliario CRM</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-xs sm:text-sm">Organiza a todos tus contactos, sigue tareas clave y nunca pierdas un presupuesto a la vista.</p>
                                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Abrir Panel
                                    </div>
                                </div>
                            </Link>

                            {/* Card Analytics */}
                            <Link to="/demo/2" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm">
                                <div className="w-full h-40 bg-background border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                            <DemoAnalytics />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <h3 className="font-serif text-xl sm:text-2xl mb-2 sm:mb-3 text-foreground">Reportes Estadísticos</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-xs sm:text-sm">Visualiza gráficas interactivas y mantente al tanto del rendimiento exacto de tu empresa en segundos.</p>
                                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Ver Gráficas
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── WHY CHOOSE US ──────────────────────────────────────── */}
                <section className="py-16 sm:py-24 overflow-hidden bg-muted/10 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">

                            {/* Text col */}
                            <div className="lg:w-5/12 order-2 lg:order-1 w-full">
                                <h2 className="font-serif text-3xl sm:text-5xl text-foreground mb-5 sm:mb-8">
                                    Aplicaciones Creadas Para Crecer
                                </h2>
                                <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-loose">
                                    Nuestra tecnología está optimizada para que no te sientas atrapado. Diseñamos con código amigable y estándares claros para que lideres tu mercado.
                                </p>
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <FiDatabase className="text-primary text-lg sm:text-xl" />
                                        </div>
                                        <div>
                                            <h5 className="font-serif text-lg sm:text-xl mb-1 text-foreground">Bases Sólidas</h5>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Estructuras tecnológicas transparentes ideales para crecer gradualmente y agregar más volumen en el futuro.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <FiBriefcase className="text-primary text-lg sm:text-xl" />
                                        </div>
                                        <div>
                                            <h5 className="font-serif text-lg sm:text-xl mb-1 text-foreground">Enfocados al Negocio</h5>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Nos quitamos de tecnicismos complejos para resolver los inconvenientes medulares que detienen tus ventas.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image col */}
                            <div className="lg:w-7/12 order-1 lg:order-2 w-full">
                                <div className="relative">
                                    <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full mix-blend-multiply opacity-50" />
                                    <div className="relative z-10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] border-4 sm:border-8 border-card bg-card overflow-hidden h-56 sm:h-80 lg:h-[400px]">
                                        <img
                                            alt="AI Interface"
                                            className="w-full h-full object-cover"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsyhzDPhLHJFYqMOMZ3dvn45QLuHYwgqOCuIyf9Cty722-YNmIRWL586MESBk-Ih_SvjOgfK6JcxffwIf4fg5aWqNGXiidly8Gsi_3oJHUxa9zi429Qw_4Cs8eOArZ8fqQf8Lntn-BnbRV6uJTfHTLMDcdlxG1P9tFt4rf7tBZB38GYGpwnAb5BAIbU0JZaP3sIeQ-nkNz8XTCNIA2Vng7PQ_caioi4pzK9LXdn9uu4j9rPN6u0soV6smOAVaDjIxuDzEh1-6NOdY"
                                        />
                                        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-background/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-border">
                                            <p className="font-bold text-xs sm:text-sm">IA Engine: <span className="text-green-500">Óptimo</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA SECTION ────────────────────────────────────────── */}
                <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="bg-muted/50 border border-primary/20 p-8 sm:p-16 rounded-3xl text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <FiZap className="text-[300px] absolute -top-20 -left-20 rotate-12 text-primary" />
                        </div>
                        <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-foreground mb-4 sm:mb-6 relative z-10 tracking-tight">
                            ¿Listo para redefinir el futuro de tu empresa?
                        </h2>
                        <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto relative z-10">
                            Iniciemos una conversación sobre cómo nuestras inteligencias comerciales pueden potenciar su legado.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                            <Magnetic>
                                <Link
                                    to="/cotizacion"
                                    className="bg-primary text-primary-foreground px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto text-center"
                                >
                                    Agendar Consultoría Privada
                                </Link>
                            </Magnetic>
                        </div>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="bg-card w-full border-t border-border/50">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 px-4 sm:px-8 py-10 sm:py-16 max-w-7xl mx-auto">
                    <div className="col-span-2 sm:col-span-2 md:col-span-1">
                        <div className="text-xl font-serif font-bold text-foreground mb-4">MisSolucionesIA</div>
                        <p className="text-sm tracking-wide text-muted-foreground leading-relaxed">
                            Artesanos de software inteligente para empresas que quieren crecer con tecnología real.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-4">Navegación</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link to="/"           className="hover:text-primary transition-all">Inicio</Link></li>
                            <li><Link to="/portafolio" className="hover:text-primary transition-all">Portafolio</Link></li>
                            <li><Link to="/cotizacion" className="hover:text-primary transition-all">Cotización</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-4">Legalidad</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link to="/" className="hover:text-primary transition-all">Privacidad</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-all">Términos</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-all">Seguridad</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-4">Contacto</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><a href="mailto:soporte@missolucionesia.com" className="hover:text-primary transition-all">Soporte Técnico</a></li>
                            <li><Link to="/cotizacion" className="hover:text-primary transition-all">Ventas</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 border-t border-border/30">
                    <p className="text-xs tracking-wide text-muted-foreground text-center">
                        © 2026 MisSolucionesIA. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
