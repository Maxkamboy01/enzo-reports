import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth, DB_META } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import AppLayout from './components/layout/AppLayout';
import { dashShifer } from './services/apiShifer';
import { dashJbi } from './services/apiJbi';

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
import Settings from './pages/Settings';

// Shifer (Grey Mix)
import ShiferProductionPerformance from './pages/shifer/ShiferProductionPerformance';
import ShiferIssueItemMetaterials from './pages/shifer/ShiferIssueItemMetaterials';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60000 } },
});

// Read localStorage token for a given DB key — used as fallback when React
// state hasn't propagated yet (setDbTokens is async).
const lsHas = db => !!localStorage.getItem(DB_META[db]?.token);

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  // isAuthenticated uses React state; localStorage is the synchronous fallback
  // for the one render that fires between login() and the state update landing.
  const ok = isAuthenticated || !!localStorage.getItem('enzo_user');
  return ok ? children : <Navigate to="/login" replace />;
}

// Redirects "/" to the first available DB's home page
function SmartHome() {
  const { dbTokens } = useAuth();
  const hasCement = dbTokens.cement || lsHas('cement');
  const hasShifer = dbTokens.shifer || lsHas('shifer');
  const hasJbi    = dbTokens.jbi    || lsHas('jbi');
  if (hasCement) return <Dashboard />;
  if (hasShifer) return <Navigate to="/shifer/production-performance" replace />;
  if (hasJbi)    return <Navigate to="/jbi/mill-production" replace />;
  return <Dashboard />;
}

// Guards a route that requires a specific database token.
// Uses localStorage as a synchronous fallback so that the one-render gap
// between login() and React state propagation can't bounce the user back.
function DBRoute({ db, children }) {
  const { dbTokens } = useAuth();
  const hasCement = dbTokens.cement || lsHas('cement');
  const hasShifer = dbTokens.shifer || lsHas('shifer');
  const hasJbi    = dbTokens.jbi    || lsHas('jbi');

  if (dbTokens[db] || lsHas(db)) return children;
  if (hasCement) return <Navigate to="/" replace />;
  if (hasShifer) return <Navigate to="/shifer/production-performance" replace />;
  if (hasJbi)    return <Navigate to="/jbi/mill-production" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <I18nProvider>
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

              <Route path="/shifer/mill-production"    element={<DBRoute db="shifer"><MillProduction   fetcher={dashShifer.millProduction} /></DBRoute>} />
              <Route path="/shifer/volume-daily"       element={<DBRoute db="shifer"><VolumeDaily      fetcher={dashShifer.volumeDaily} /></DBRoute>} />
              <Route path="/shifer/shift-performance"  element={<DBRoute db="shifer"><ShiftPerformance fetcher={dashShifer.shiftPerformance} /></DBRoute>} />

              <Route path="/shifer/raw-materials-stock"        element={<DBRoute db="shifer"><RawMaterialsStock       fetcher={dashShifer.rawMaterialsStock} /></DBRoute>} />
              <Route path="/shifer/raw-material-receipt"       element={<DBRoute db="shifer"><RawMaterialReceipt      fetcher={dashShifer.rawMaterialReceipt} /></DBRoute>} />
              <Route path="/shifer/raw-material-consumption"   element={<DBRoute db="shifer"><RawMaterialConsumption  fetcher={dashShifer.rawMaterialConsumption} /></DBRoute>} />
              <Route path="/shifer/raw-material-movement"      element={<DBRoute db="shifer"><RawMaterialMovement     fetcher={dashShifer.rawMaterialMovement} /></DBRoute>} />
              <Route path="/shifer/raw-material-pivot"         element={<DBRoute db="shifer"><RawMaterialPivot        fetcher={dashShifer.rawMaterialPivot} /></DBRoute>} />
              <Route path="/shifer/material-vs-bom"            element={<DBRoute db="shifer"><MaterialVsBom           fetcher={dashShifer.materialVsBom} /></DBRoute>} />
              <Route path="/shifer/material-overconsumption"   element={<DBRoute db="shifer"><MaterialOverconsumption fetcher={dashShifer.materialOverconsumption} /></DBRoute>} />
              <Route path="/shifer/material-consumption-shift" element={<DBRoute db="shifer"><MaterialConsumptionShift fetcher={dashShifer.materialConsumptionShift} /></DBRoute>} />

              <Route path="/shifer/silo-stock"                   element={<DBRoute db="shifer"><SiloStock                 fetcher={dashShifer.siloStock} /></DBRoute>} />
              <Route path="/shifer/cement-consumption"           element={<DBRoute db="shifer"><CementConsumption         fetcher={dashShifer.cementConsumption} /></DBRoute>} />
              <Route path="/shifer/cement-additive-composition"  element={<DBRoute db="shifer"><CementAdditiveComposition fetcher={dashShifer.cementAdditiveComposition} /></DBRoute>} />

              <Route path="/shifer/clinker-factor"       element={<DBRoute db="shifer"><ClinkerFactor      fetcher={dashShifer.clinkerFactor} /></DBRoute>} />
              <Route path="/shifer/clinker-factor-trend" element={<DBRoute db="shifer"><ClinkerFactorTrend fetcher={dashShifer.clinkerFactorTrend} /></DBRoute>} />

              <Route path="/shifer/defect-details" element={<DBRoute db="shifer"><DefectDetails fetcher={dashShifer.defectDetails} /></DBRoute>} />

              <Route path="/shifer/cost-structure"     element={<DBRoute db="shifer"><CostStructure    fetcher={dashShifer.costStructure} /></DBRoute>} />
              <Route path="/shifer/cost-summary"       element={<DBRoute db="shifer"><CostSummary      fetcher={dashShifer.costSummary} /></DBRoute>} />
              <Route path="/shifer/cost-trend-monthly" element={<DBRoute db="shifer"><CostTrendMonthly fetcher={dashShifer.costTrendMonthly} /></DBRoute>} />

              <Route path="/shifer/inventory-transfer" element={<DBRoute db="shifer"><InventoryTransfer fetcher={dashShifer.inventoryTransfer} /></DBRoute>} />

              {/* ── JBI routes ── */}
              <Route path="/jbi/mill-production" element={<DBRoute db="jbi"><MillProduction fetcher={dashJbi.millProduction} /></DBRoute>} />
              <Route path="/jbi/volume-daily"    element={<DBRoute db="jbi"><VolumeDaily    fetcher={dashJbi.volumeDaily} /></DBRoute>} />

              <Route path="/jbi/raw-materials-stock"        element={<DBRoute db="jbi"><RawMaterialsStock       fetcher={dashJbi.rawMaterialsStock} /></DBRoute>} />
              <Route path="/jbi/raw-material-receipt"       element={<DBRoute db="jbi"><RawMaterialReceipt      fetcher={dashJbi.rawMaterialReceipt} /></DBRoute>} />
              <Route path="/jbi/raw-material-consumption"   element={<DBRoute db="jbi"><RawMaterialConsumption  fetcher={dashJbi.rawMaterialConsumption} /></DBRoute>} />
              <Route path="/jbi/raw-material-movement"      element={<DBRoute db="jbi"><RawMaterialMovement     fetcher={dashJbi.rawMaterialMovement} /></DBRoute>} />
              <Route path="/jbi/raw-material-pivot"         element={<DBRoute db="jbi"><RawMaterialPivot        fetcher={dashJbi.rawMaterialPivot} /></DBRoute>} />
              <Route path="/jbi/material-vs-bom"          element={<DBRoute db="jbi"><MaterialVsBom           fetcher={dashJbi.materialVsBom} /></DBRoute>} />
              <Route path="/jbi/material-overconsumption" element={<DBRoute db="jbi"><MaterialOverconsumption fetcher={dashJbi.materialOverconsumption} /></DBRoute>} />

              <Route path="/jbi/cement-consumption"           element={<DBRoute db="jbi"><CementConsumption         fetcher={dashJbi.cementConsumption} /></DBRoute>} />
              <Route path="/jbi/cement-additive-composition"  element={<DBRoute db="jbi"><CementAdditiveComposition fetcher={dashJbi.cementAdditiveComposition} /></DBRoute>} />

              <Route path="/jbi/defect-details" element={<DBRoute db="jbi"><DefectDetails fetcher={dashJbi.defectDetails} /></DBRoute>} />

              <Route path="/jbi/cost-structure"     element={<DBRoute db="jbi"><CostStructure    fetcher={dashJbi.costStructure} /></DBRoute>} />
              <Route path="/jbi/cost-summary"       element={<DBRoute db="jbi"><CostSummary      fetcher={dashJbi.costSummary} /></DBRoute>} />
              <Route path="/jbi/cost-trend-monthly" element={<DBRoute db="jbi"><CostTrendMonthly fetcher={dashJbi.costTrendMonthly} /></DBRoute>} />

              <Route path="/jbi/inventory-transfer" element={<DBRoute db="jbi"><InventoryTransfer fetcher={dashJbi.inventoryTransfer} /></DBRoute>} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
