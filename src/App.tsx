import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import InvoicePage from "./pages/InvoicePage";
import ConnectPage from "./pages/ConnectPage";
import CreateEscrowPage from "./pages/CreateEscrowPage";
import PayEscrowPage from "./pages/PayEscrowPage";
import EscrowDetailsPage from "./pages/EscrowDetailsPage";
import AddEscrowPage from "./pages/AddEscrowPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />
            
            {/* Wallet Connection */}
            <Route path="/connect" element={<ConnectPage />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Escrow Routes */}
            <Route path="/create" element={<CreateEscrowPage />} />
            <Route path="/add-escrow" element={<AddEscrowPage />} />
            <Route path="/pay/:escrowId" element={<PayEscrowPage />} />
            <Route path="/escrow/:escrowId" element={<EscrowDetailsPage />} />
            
            {/* Invoice (legacy) */}
            <Route path="/invoice/:invoiceId" element={<InvoicePage />} />
            
            {/* 404 - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
