import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import Dashboard from './pages/Dashboard';
import DashboardOverview from './pages/DashboardOverview';
import MyProperties from './pages/MyProperties';
import MyLeases from './pages/MyLeases';
import Maintenance from './pages/Maintenance';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="properties" element={<ProtectedRoute roles={['owner','admin']}><MyProperties /></ProtectedRoute>} />
          <Route path="leases"    element={<MyLeases />} />
          <Route path="maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
