import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import CotizacionPage from './pages/CotizacionPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import DemoDashboard from './pages/DemoDashboard';
import DemosIndex from './pages/DemosIndex';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import Lenis from 'lenis';
import CustomCursor from './components/ui/CustomCursor';

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

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CustomCursor />
            <Toaster position="top-right" theme="system" richColors />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/cotizacion" element={<CotizacionPage />} />
                    <Route path="/portafolio" element={<DemosIndex />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/partner" element={<PartnerDashboard />} />
                </Route>
                <Route path="/demo/:id" element={<DemoDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
