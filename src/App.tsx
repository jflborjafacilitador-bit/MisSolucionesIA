import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import Lenis from 'lenis';
import CustomCursor from './components/ui/CustomCursor';

// Lazy imports — cada ruta carga su propio chunk solo cuando se necesita
const LandingPage      = lazy(() => import('./pages/LandingPage'));
const CotizacionPage   = lazy(() => import('./pages/CotizacionPage'));
const Login            = lazy(() => import('./pages/Login'));
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const DemoDashboard    = lazy(() => import('./pages/DemoDashboard'));
const DemosIndex       = lazy(() => import('./pages/DemosIndex'));

// Spinner mínimo mientras carga el chunk de la ruta
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
);

function App() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CustomCursor />
            <Toaster position="top-right" theme="system" richColors />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/"           element={<LandingPage />} />
                        <Route path="/cotizacion" element={<CotizacionPage />} />
                        <Route path="/portafolio" element={<DemosIndex />} />
                        <Route path="/login"      element={<Login />} />
                        <Route path="/admin"      element={<AdminDashboard />} />
                        <Route path="/partner"    element={<PartnerDashboard />} />
                    </Route>
                    <Route path="/demo/:id" element={<DemoDashboard />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
