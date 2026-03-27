import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiDatabase, FiBriefcase,
    FiTrendingUp, FiCheckCircle, FiZap, FiSun, FiMoon
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

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <div className="bg-background selection:bg-primary/20 selection:text-foreground relative min-h-screen font-sans">
            {/* STITCH: TopNavBar (The Anchor) */}
            <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl shadow-[0_12px_40px_rgba(212,175,55,0.06)] border-b border-border/50">
                <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-serif font-bold text-foreground tracking-tight">MisSolucionesIA</div>
                    <div className="hidden md:flex items-center space-x-10 font-medium text-sm tracking-tight text-foreground">
                        <Link to="/portafolio" className="text-muted-foreground hover:text-foreground transition-colors">Portafolio</Link>
                        <Link to="/cotizacion" className="text-muted-foreground hover:text-foreground transition-colors">Precios</Link>
                        <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Acceder</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/50 text-foreground transition-colors cursor-pointer">
                            {theme === 'dark' ? <FiSun className="w-5 h-5 text-amber-500" /> : <FiMoon className="w-5 h-5 text-primary" />}
                        </button>
                        <Magnetic>
                            <Link to="/cotizacion" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold tracking-wide hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md">
                                Agendar Consultoría
                            </Link>
                        </Magnetic>
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                {/* STITCH: Hero Section: Bento Grid Style */}
                <section className="max-w-7xl mx-auto px-8 py-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16 max-w-4xl">
                        <span className="text-sm font-bold tracking-[0.2em] text-primary uppercase mb-4 block">Desarrollo de Software a la Medida</span>
                        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-foreground leading-[1.1] mb-8" style={{ textWrap: 'balance' }}>
                            Herramientas Digitales para <span className="italic text-primary/80">Impulsar tu Negocio</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                            Creamos plataformas robustas, tiendas en línea y sistemas de gestión personalizados para optimizar tus operaciones y aumentar tus ventas sin complicaciones técnicas.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="grid grid-cols-12 grid-rows-2 gap-6 h-auto md:h-[700px]">
                        {/* Bento Large Item */}
                        <TiltCard className="col-span-12 md:col-span-7 row-span-2">
                            <div className="w-full h-full bg-card rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(212,175,55,0.06)] relative group border border-border/50">
                                <img alt="AI Workspace" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxYUSQ2ZJ4Q8a4x4RmTyHVeovaRARkgkMxj0xHfQeXcRTdX816kTKEc7vCQjLx9FE1NnDd6ZoWA2nwmerMAmcw9sNVh82jUpJf1Pzf1dMFjWVkBAR9RsUQ3sYpbM8nCwdpvfuY-1-jkcSjbcGUrXFTf3SfCORDvunPzK1E03WJdgqSG0SwHOUmIMmujjfXVrXhANjAaT-R2fTOAlSufjdjqLv9pRqrpkc7JUiGDZVm8RZcVdf2TQEVU2W7PTXaWMDKVkCVkgJ6acU"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                                <div className="absolute bottom-10 left-10 text-white z-10" style={{ transform: "translateZ(40px)" }}>
                                    <div className="flex items-center space-x-2 mb-2 opacity-90">
                                        <FiZap className="text-yellow-400" />
                                        <span className="text-xs uppercase tracking-widest font-bold">Tecnología Avanzada</span>
                                    </div>
                                    <h3 className="font-serif text-3xl font-medium shadow-sm drop-shadow-md">Integración de Inteligencia Artificial</h3>
                                </div>
                            </div>
                        </TiltCard>
                        {/* Bento Small Item Top */}
                        <TiltCard className="col-span-12 md:col-span-5 row-span-1">
                            <div className="w-full h-full bg-muted/30 rounded-2xl flex flex-col justify-end p-10 relative overflow-hidden border border-border/50">
                                <div className="absolute top-0 right-0 p-8">
                                    <FiTrendingUp className="text-6xl text-primary/20" />
                                </div>
                                <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
                                    <h4 className="font-serif text-2xl mb-2 text-foreground">Automatización de Tareas</h4>
                                    <p className="text-sm text-muted-foreground">Conecta tus aplicaciones y elimina el trabajo repetitivo manual para tu equipo de trabajo.</p>
                                </div>
                            </div>
                        </TiltCard>
                        {/* Bento Small Item Bottom */}
                        <TiltCard className="col-span-12 md:col-span-5 row-span-1">
                            <div className="w-full h-full bg-primary text-primary-foreground rounded-2xl p-10 flex items-center space-x-6 shadow-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0" style={{ transform: "translateZ(40px)" }}>
                                    <FiCheckCircle className="text-white text-3xl" />
                                </div>
                                <div style={{ transform: "translateZ(30px)" }}>
                                    <h4 className="font-serif text-2xl mb-1 text-white">Seguridad Total</h4>
                                    <p className="text-sm text-white/80">Protegemos la información sensible de tu negocio y la de tus clientes corporativos.</p>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>
                </section>

                {/* Fake Trust Bar Deleted intentionally to increase authenticity */}

                {/* STITCH: Solutions Section Grid */}
                <section id="portafolio" className="py-32 bg-background">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
                            <div className="max-w-2xl">
                                <h2 className="font-serif text-5xl text-foreground mb-6">Proyectos Destacados</h2>
                                <p className="text-lg text-muted-foreground">Desarrollamos ecosistemas digitales enfocados y orientados a resultados tangibles. Aquí puede explorar las interfaces funcionales que creamos.</p>
                            </div>
                            <div className="mt-8 md:mt-0">
                                <Link to="/portafolio" className="text-primary font-bold border-b-2 border-primary/50 py-2 cursor-pointer hover:text-primary/70 transition-colors">
                                    Explorar todas las demos interactivas
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Card Web Preview */}
                            <Link to="/demo/8" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm relative">
                                <div className="w-full h-48 bg-muted/20 border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                        <DemoMarketing />
                                    </div>
                                    <div className="absolute inset-0 bg-transparent mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="font-serif text-2xl mb-4 text-foreground">Páginas Web B2B</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-sm">Presentación corporativa veloz, persuasiva y orientada a la simple captación de clientes.</p>
                                    <div className="mt-6 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Probar Diseño Ahora
                                    </div>
                                </div>
                            </Link>

                            {/* Card Ecommerce Preview */}
                            <Link to="/demo/5" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm relative">
                                <div className="w-full h-48 bg-muted/20 border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                        <DemoEcommerce />
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="font-serif text-2xl mb-4 text-foreground">Tiendas Online Rápidas</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-sm">Comercio electrónico que guía ágilmente al usuario por el catálogo hasta concluir la compra final.</p>
                                    <div className="mt-6 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Comprar en Tienda
                                    </div>
                                </div>
                            </Link>

                            {/* Card CRM Preview */}
                            <Link to="/demo/1" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm relative">
                                <div className="w-full h-48 bg-muted/20 border-b border-border/50 relative overflow-hidden pointer-events-none flex items-start justify-center pt-8">
                                    <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                        <DemoCRM />
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="font-serif text-2xl mb-4 text-foreground">Gestor Inmobiliario CRM</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-sm">Organiza a todos tus contactos, sigue tareas clave y nunca pierdas un presupuesto a la vista.</p>
                                    <div className="mt-6 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Abrir Panel
                                    </div>
                                </div>
                            </Link>

                            {/* Card Analytics Preview */}
                            <Link to="/demo/2" className="bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] border border-border/50 group flex flex-col cursor-pointer overflow-hidden shadow-sm relative">
                                <div className="w-full h-48 bg-background border-b border-border/50 relative overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25]">
                                        <DemoAnalytics />
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-1">
                                    <h3 className="font-serif text-2xl mb-4 text-foreground">Reportes Estadísticos</h3>
                                    <p className="text-muted-foreground leading-relaxed flex-1 text-sm">Visualiza gráficas interactivas y mantente al tanto del rendimiento exacto de tu empresa en segundos.</p>
                                    <div className="mt-6 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        Ver Gráficas
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* STITCH: Why Choose Us - Asymmetrical Layout */}
                <section className="py-24 overflow-hidden bg-muted/10 relative">
                    {/* Incorporating local React component logic (Interactive Interface Demo) inside Stitch's asymmetrical structure! */}
                    <div className="max-w-7xl mx-auto px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-20">
                            <div className="lg:w-5/12 ml-0 lg:ml-10 order-2 lg:order-1">
                                <h2 className="font-serif text-5xl text-foreground mb-8">Aplicaciones Creadas Para Crecer</h2>
                                <p className="text-lg text-muted-foreground mb-10 leading-loose">
                                    Nuestra tecnología está optimizada para que no te sientas atrapado. Diseñamos con código amigable y estándares claros para que lideres tu mercado.
                                </p>
                                <div className="space-y-8">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <FiDatabase className="text-primary text-xl" />
                                        </div>
                                        <div>
                                            <h5 className="font-serif text-xl mb-1 text-foreground">Bases Sólidas</h5>
                                            <p className="text-sm text-muted-foreground">Estructuras tecnológicas transparentes ideales para crecer gradualmente y agregar más volumen en el futuro.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <FiBriefcase className="text-primary text-xl" />
                                        </div>
                                        <div>
                                            <h5 className="font-serif text-xl mb-1 text-foreground">Enfocados al Negocio</h5>
                                            <p className="text-sm text-muted-foreground">Nos quitamos de tecnicismos complejos para resolver los inconvenientes medulares que detienen tus ventas.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-7/12 order-1 lg:order-2 w-full">
                                <div className="relative">
                                    <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full mix-blend-multiply opacity-50"></div>
                                    {/* Local Widget transcoded into Stitch Layout */}
                                    <div className="relative z-10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] border-8 border-card bg-card overflow-hidden h-[400px] flex items-center justify-center">
                                        <img alt="AI Interface" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsyhzDPhLHJFYqMOMZ3dvn45QLuHYwgqOCuIyf9Cty722-YNmIRWL586MESBk-Ih_SvjOgfK6JcxffwIf4fg5aWqNGXiidly8Gsi_3oJHUxa9zi429Qw_4Cs8eOArZ8fqQf8Lntn-BnbRV6uJTfHTLMDcdlxG1P9tFt4rf7tBZB38GYGpwnAb5BAIbU0JZaP3sIeQ-nkNz8XTCNIA2Vng7PQ_caioi4pzK9LXdn9uu4j9rPN6u0soV6smOAVaDjIxuDzEh1-6NOdY" />
                                        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-border">
                                            <p className="font-bold text-sm">IA Engine Status: <span className="text-green-500">Optimo</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STITCH: CTA Section */}
                <section className="py-24 max-w-7xl mx-auto px-8">
                    <div className="bg-muted/50 border border-primary/20 p-16 rounded-3xl text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <FiZap className="text-[300px] absolute -top-20 -left-20 rotate-12 text-primary" />
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 relative z-10 tracking-tight">¿Listo para redefinir el futuro de tu empresa?</h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">Iniciemos una conversación sobre cómo nuestras inteligencias comerciales pueden potenciar su legado.</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10">
                            <Magnetic>
                                <Link to="/cotizacion" className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">
                                    Agendar Consultoría Privada
                                </Link>
                            </Magnetic>
                        </div>
                    </div>
                </section>
            </main>

            {/* STITCH: Footer */}
            <footer className="bg-card w-full border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-7xl mx-auto">
                    <div className="col-span-1 md:col-span-1">
                        <div className="text-xl font-serif font-bold text-foreground mb-6">MisSolucionesIA</div>
                        <p className="text-sm tracking-wide text-muted-foreground leading-relaxed">
                            Artesanos de software inteligente para la élite empresarial global. Elevando el estándar tecnológico hacia el 2026.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-sm uppercase tracking-widest mb-6">Navegación</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link to="/" className="hover:text-primary transition-all">Acerca de Nostros</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-all">Soluciones B2B</Link></li>
                            <li><Link to="/cotizacion" className="hover:text-primary transition-all">Cotización Rápida</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-sm uppercase tracking-widest mb-6">Legalidad</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link to="/" className="hover:text-primary transition-all">Política de Privacidad</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-all">Términos de Servicio</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-all">Estándares Seguridad</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-sm uppercase tracking-widest mb-6">Contacto</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-all">Soporte Técnico</a></li>
                            <li><a href="#" className="hover:text-primary transition-all">Ventas Institucionales</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-8 py-8 border-t border-border/30">
                    <p className="text-xs tracking-wide text-muted-foreground text-center">
                        © 2026 MisSolucionesIA. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
