import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiShield, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin');
        } catch (err: any) {
            setLocalError(err.message || 'Error de autenticación. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-foreground font-sans overflow-x-hidden min-h-screen">
            {/* STITCH: TopNavBar Split-Screen Context */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-[0_0_48px_rgba(212,175,55,0.02)]">
                <div className="flex justify-between items-center px-8 py-4 max-w-full">
                    <div className="text-2xl font-bold tracking-tighter text-foreground font-serif">
                        MisSolucionesIA
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors tracking-tight font-medium">Volver a Inicio</Link>
                        <Link to="/cotizacion" className="text-muted-foreground hover:text-primary transition-colors tracking-tight font-medium">Ventas</Link>
                    </div>
                </div>
            </nav>

            {/* STITCH: Main Content Area (Centralized Split UX) */}
            <main className="min-h-screen flex flex-col items-center justify-center relative pt-20 pb-12 px-6">
                
                {/* Subtle Ambient Elements (Light Luxury Cosmico) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full"></div>
                </div>

                {/* Login Container Glass-Card */}
                <section className="w-full max-w-xl z-10 mt-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-card/70 backdrop-blur-[40px] rounded-[2rem] p-12 md:p-16 border border-border shadow-2xl flex flex-col gap-12 relative overflow-hidden">
                        
                        {/* Branding Context */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-muted/50 border border-border mb-4 shadow-inner">
                                <FiShield className="text-primary text-4xl" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-foreground">
                                Acceso <span className="text-primary italic">Exclusivo</span>
                            </h1>
                            <p className="text-muted-foreground font-medium tracking-wide text-xs uppercase mt-2">Bienvenido al futuro de su infraestructura B2B</p>
                        </div>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {localError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3 text-sm font-semibold"
                                >
                                    <FiAlertCircle className="shrink-0 w-5 h-5" />
                                    <p>{localError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative z-10">
                            {/* Email Input */}
                            <div className="relative group">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block group-focus-within:text-primary transition-colors" htmlFor="email">
                                    Email de Administrador / Corporativo
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent border-0 border-b-2 border-border/60 py-4 px-0 text-xl text-foreground placeholder:text-muted-foreground/30 focus:ring-0 focus:border-primary transition-all duration-300 outline-none"
                                    placeholder="ejecutivo@empresa.com"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors" htmlFor="password">
                                        Firma de Identidad (Clave)
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b-2 border-border/60 py-4 px-0 pr-10 text-xl text-foreground placeholder:text-muted-foreground/30 focus:ring-0 focus:border-primary transition-all duration-300 outline-none"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2"
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Primary CTA */}
                            <button
                                disabled={loading}
                                className="w-full py-6 rounded-full bg-primary text-primary-foreground font-black text-lg tracking-widest uppercase transition-all duration-500 hover:scale-[1.02] active:scale-95 mt-4 shadow-lg hover:shadow-primary/30 flex justify-center items-center"
                                type="submit"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    "Autenticar Entorno"
                                )}
                            </button>
                        </form>

                        {/* Additional Info */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-border/60 relative z-10">
                            <p className="text-xs text-muted-foreground font-medium">¿Sin credenciales maestro?</p>
                            <Link to="/cotizacion" className="text-xs font-bold uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all duration-300 border-b border-primary/30 pb-1">
                                Retornar a Cotización
                            </Link>
                        </div>

                        {/* Elaborate Decoration */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
                    </motion.div>
                </section>

                {/* Trust Indicators */}
                <div className="mt-16 flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground font-sans">Entorno Cifrado de Extremo a Extremo</p>
                    <div className="flex gap-8 items-center">
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
                            <FiShield className="text-muted-foreground text-lg" />
                        </div>
                    </div>
                </div>
            </main>

            {/* STITCH: Footer Minimal */}
            <footer className="w-full py-12 border-t border-border bg-card">
                <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-6">
                    <div className="text-sm font-bold text-foreground">
                        © 2026 MisSolucionesIA. Reservados todos los derechos.
                    </div>
                </div>
            </footer>
        </div>
    );
}
