import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import CotizacionPage from './pages/CotizacionPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import DemoDashboard from './pages/DemoDashboard';
import { Toaster } from 'sonner';

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster position="top-right" theme="system" richColors />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/cotizacion" element={<CotizacionPage />} />
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
