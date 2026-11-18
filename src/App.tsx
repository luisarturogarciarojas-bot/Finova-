import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { DesktopSidebar } from './components/DesktopSidebar';
import { HomeView } from './views/HomeView';
import { BalanceView } from './views/BalanceView';
import { DebtsView } from './views/DebtsView';
import { InventoryView } from './views/InventoryView';
import { InvoicingView } from './views/InvoicingView';
import { CashFlowComparativeView } from './views/CashFlowComparativeView';
import { MonthlyReportsView } from './views/MonthlyReportsView';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { StoreSettingsModal } from './components/modals/StoreSettingsModal';
import { SearchModal } from './components/modals/SearchModal';
import { HelpModal } from './components/modals/HelpModal';
import { AccountsModal } from './components/modals/AccountsModal';
import { SaleTypeSelectorModal } from './components/modals/SaleTypeSelectorModal';
import { ProductSaleSelectorModal } from './components/modals/ProductSaleSelectorModal';
import { FreeSaleModal } from './components/modals/FreeSaleModal';
import { QuoteModal } from './components/modals/QuoteModal';
import { PeriodSelectorModal } from './components/modals/PeriodSelectorModal';
import { BalanceDetailModal } from './components/modals/BalanceDetailModal';
import { AuthModal } from './components/modals/AuthModal';
import { AdminPanelModal } from './components/modals/AdminPanelModal';
import { PlanUpgradeModal } from './components/modals/PlanUpgradeModal';
import { CreateProductModal } from './components/modals/CreateProductModal';
import { CreateCustomerModal } from './components/modals/CreateCustomerModal';
import { ImportOldCompanyModal } from './components/modals/ImportOldCompanyModal';
import { BusinessOnboardingModal } from './components/modals/BusinessOnboardingModal';
import { CustomersView } from './views/CustomersView';
import { AuthScreen } from './components/auth/AuthScreen';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { FloatingPWAInstallPrompt } from './components/common/FloatingPWAInstallPrompt';

const MainAppContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inicio':
        return <HomeView />;
      case 'balance':
        return <BalanceView />;
      case 'deudas':
        return <DebtsView />;
      case 'inventario':
        return <InventoryView />;
      case 'facturas':
        return <InvoicingView />;
      case 'flujocaja':
        return <CashFlowComparativeView />;
      case 'reportes':
        return <MonthlyReportsView />;
      case 'clientes':
        return <CustomersView />;
      default:
        return <HomeView />;
    }
  };

  // Natively responsive multiplatform app (Mobile, Tablet, Desktop)
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (hidden on mobile, shown on lg screens) */}
        <div className="hidden lg:block shrink-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <DesktopSidebar onOpenHelp={() => setIsHelpOpen(true)} />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          {renderActiveView()}
        </main>
      </div>

      {/* Bottom Navigation for mobile screens (hidden on desktop lg) */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>

      {/* Global Modals */}
      <AccountsModal />
      <SaleTypeSelectorModal />
      <ProductSaleSelectorModal />
      <FreeSaleModal />
      <QuoteModal />
      <ExpenseModal />
      <PeriodSelectorModal />
      <BalanceDetailModal />
      <StoreSettingsModal />
      <AuthModal />
      <AdminPanelModal />
      <PlanUpgradeModal />
      <CreateProductModal />
      <CreateCustomerModal />
      <ImportOldCompanyModal />
      <BusinessOnboardingModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <OfflineIndicator />
      <FloatingPWAInstallPrompt />
    </div>
  );
};

const RootApp: React.FC = () => {
  const { currentUser } = useFinance();

  if (!currentUser) {
    return <AuthScreen />;
  }

  return <MainAppContent />;
};

export default function App() {
  return (
    <FinanceProvider>
      <RootApp />
    </FinanceProvider>
  );
}
