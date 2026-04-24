import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Production
import MillProduction from './pages/MillProduction';
import VolumeDaily from './pages/VolumeDaily';
import ShiftPerformance from './pages/ShiftPerformance';

// Raw Materials
import RawMaterialsStock from './pages/RawMaterialsStock';
import RawMaterialReceipt from './pages/RawMaterialReceipt';
import RawMaterialConsumption from './pages/RawMaterialConsumption';
import RawMaterialMovement from './pages/RawMaterialMovement';
import RawMaterialPivot from './pages/RawMaterialPivot';
import MaterialVsBom from './pages/MaterialVsBom';
import MaterialOverconsumption from './pages/MaterialOverconsumption';
import MaterialConsumptionShift from './pages/MaterialConsumptionShift';

// Silo & Cement
import SiloStock from './pages/SiloStock';
import CementConsumption from './pages/CementConsumption';
import CementAdditiveComposition from './pages/CementAdditiveComposition';

// Clinker
import ClinkerFactor from './pages/ClinkerFactor';
import ClinkerFactorTrend from './pages/ClinkerFactorTrend';

// Quality
import DefectDetails from './pages/DefectDetails';

// Cost
import CostStructure from './pages/CostStructure';
import CostSummary from './pages/CostSummary';
import CostTrendMonthly from './pages/CostTrendMonthly';

// Inventory
import InventoryTransfer from './pages/InventoryTransfer';

// Shifer (Grey Mix)
import ShiferProductionPerformance from './pages/shifer/ShiferProductionPerformance';
import ShiferIssueItemMetaterials from './pages/shifer/ShiferIssueItemMetaterials';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 } },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Redirects "/" to the first available DB's home page
function SmartHome() {
  const { dbTokens } = useAuth();
  if (dbTokens.cement) return <Dashboard />;
  if (dbTokens.shifer) return <Navigate to="/shifer/production-performance" replace />;
  if (dbTokens.jbi)    return <Navigate to="/" replace />;
  return <Dashboard />;
}

// Guards a route that requires a specific database token
function DBRoute({ db, children }) {
  const { dbTokens } = useAuth();
  if (dbTokens[db]) return children;
  // Redirect to their actual home
  if (dbTokens.cement) return <Navigate to="/" replace />;
  if (dbTokens.shifer) return <Navigate to="/shifer/production-performance" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<SmartHome />} />

              {/* ── Cement routes ── */}
              <Route path="/mill-production"    element={<DBRoute db="cement"><MillProduction /></DBRoute>} />
              <Route path="/volume-daily"       element={<DBRoute db="cement"><VolumeDaily /></DBRoute>} />
              <Route path="/shift-performance"  element={<DBRoute db="cement"><ShiftPerformance /></DBRoute>} />

              <Route path="/raw-materials-stock"        element={<DBRoute db="cement"><RawMaterialsStock /></DBRoute>} />
              <Route path="/raw-material-receipt"       element={<DBRoute db="cement"><RawMaterialReceipt /></DBRoute>} />
              <Route path="/raw-material-consumption"   element={<DBRoute db="cement"><RawMaterialConsumption /></DBRoute>} />
              <Route path="/raw-material-movement"      element={<DBRoute db="cement"><RawMaterialMovement /></DBRoute>} />
              <Route path="/raw-material-pivot"         element={<DBRoute db="cement"><RawMaterialPivot /></DBRoute>} />
              <Route path="/material-vs-bom"            element={<DBRoute db="cement"><MaterialVsBom /></DBRoute>} />
              <Route path="/material-overconsumption"   element={<DBRoute db="cement"><MaterialOverconsumption /></DBRoute>} />
              <Route path="/material-consumption-shift" element={<DBRoute db="cement"><MaterialConsumptionShift /></DBRoute>} />

              <Route path="/silo-stock"                   element={<DBRoute db="cement"><SiloStock /></DBRoute>} />
              <Route path="/cement-consumption"           element={<DBRoute db="cement"><CementConsumption /></DBRoute>} />
              <Route path="/cement-additive-composition"  element={<DBRoute db="cement"><CementAdditiveComposition /></DBRoute>} />

              <Route path="/clinker-factor"       element={<DBRoute db="cement"><ClinkerFactor /></DBRoute>} />
              <Route path="/clinker-factor-trend" element={<DBRoute db="cement"><ClinkerFactorTrend /></DBRoute>} />

              <Route path="/defect-details" element={<DBRoute db="cement"><DefectDetails /></DBRoute>} />

              <Route path="/cost-structure"     element={<DBRoute db="cement"><CostStructure /></DBRoute>} />
              <Route path="/cost-summary"       element={<DBRoute db="cement"><CostSummary /></DBRoute>} />
              <Route path="/cost-trend-monthly" element={<DBRoute db="cement"><CostTrendMonthly /></DBRoute>} />

              <Route path="/inventory-transfer" element={<DBRoute db="cement"><InventoryTransfer /></DBRoute>} />

              {/* ── Shifer routes ── */}
              <Route path="/shifer/production-performance" element={<DBRoute db="shifer"><ShiferProductionPerformance /></DBRoute>} />
              <Route path="/shifer/issue-materials"        element={<DBRoute db="shifer"><ShiferIssueItemMetaterials /></DBRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
