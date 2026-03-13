import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetMode, setResetMode] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Inicio de sesión exitoso');
            navigate('/admin');
        } catch {
            toast.error('Credenciales incorrectas. Verifica tu email y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { toast.error('Escribe tu correo primero.'); return; }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('¡Correo de recuperación enviado! Revisa tu bandeja.');
            setResetMode(false);
        } catch {
            toast.error('No se pudo enviar el correo. Verifica que el correo sea correcto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border border-border/50 shadow-xl rounded-2xl overflow-hidden p-8"
            >
                <div className="text-center mb-8">
                    <img src="/icons/icon-192.png" alt="Logo" className="w-14 h-14 rounded-2xl mx-auto mb-4 shadow-lg" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {resetMode ? 'Recuperar Contraseña' : 'Acceso Admin'}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {resetMode
                            ? 'Te enviaremos un enlace para restablecer tu contraseña.'
                            : 'Ingresa tus credenciales para administrar las cotizaciones.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {resetMode ? (
                        <motion.form
                            key="reset"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleReset}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
                            </button>
                            <button type="button" onClick={() => setResetMode(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                                ← Volver al inicio de sesión
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="admin@empresa.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Contraseña</label>
                                    <button type="button" onClick={() => setResetMode(true)} className="text-xs text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                            >
                                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
