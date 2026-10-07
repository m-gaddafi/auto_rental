import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import DashboardView from './components/DashboardView';
import RentSheetView from './components/RentSheetView';
import UnitsView from './components/UnitsView';
import ImportReceiptsView from './components/ImportReceiptsView';
import ConfirmationsView from './components/ConfirmationsView';
import VerificationsView from './components/VerificationsView';
import MasterLogView from './components/MasterLogView';
import AddUnitModal from './components/AddUnitModal';
import AddPropertyModal from './components/AddPropertyModal';
import SetupModal from './components/SetupModal';
import Toast from './components/Toast';
import { api } from './api';
import { RotateCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [toast, setToast] = useState(null);

  // Modals
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Check initial authentication
  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const meRes = await api.getMe();
      if (meRes.data?.authenticated) {
        setCurrentUser(meRes.data.user);
        loadDashboardData();
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('Authentication check failed:', err);
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadDashboardData = () => {
    refreshStats();
    refreshProperties();
    refreshUnits();
  };

  const refreshStats = async () => {
    try {
      const statsRes = await api.getDashboardStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const refreshProperties = async () => {
    try {
      const propRes = await api.getProperties();
      setProperties(propRes.data || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const refreshUnits = async () => {
    try {
      const unitRes = await api.getUnits();
      setUnits(unitRes.data || []);
    } catch (err) {
      console.error('Failed to load units:', err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      showToast('You have been logged out. Please sign in to continue.', 'info');
    }
  };

  // If checking authentication on initial load, show minimal sleek loader
  if (isCheckingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-secondary)'
      }}>
        <RotateCw size={32} color="#6366f1" className="pulse" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading AutoRental...</div>
      </div>
    );
  }

  // If user is not logged in, render the dedicated Login Page directly!
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // User is logged in: Render the full application with Left Sidebar
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      {/* Left Sidebar Navigation containing ALL buttons on the left */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        currentUser={currentUser}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
        onOpenAddUnit={() => setIsAddUnitOpen(true)}
        onOpenAddProperty={() => setIsAddPropertyOpen(true)}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Main Content Area on the right */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflowX: 'hidden'
      }}>
        <main style={{
          maxWidth: 1380,
          width: '100%',
          margin: '0 auto',
          padding: '28px 32px 64px 32px',
          flex: 1
        }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              setActiveTab={setActiveTab}
              onOpenAddUnit={() => setIsAddUnitOpen(true)}
              onOpenAddProperty={() => setIsAddPropertyOpen(true)}
            />
          )}

          {activeTab === 'rent-sheet' && (
            <RentSheetView
              properties={properties}
            />
          )}

          {activeTab === 'units' && (
            <UnitsView
              properties={properties}
              onRefreshProperties={refreshProperties}
              onOpenAddUnit={() => setIsAddUnitOpen(true)}
              onOpenAddProperty={() => setIsAddPropertyOpen(true)}
              showToast={showToast}
            />
          )}

          {activeTab === 'import' && (
            <ImportReceiptsView
              units={units}
              setActiveTab={setActiveTab}
              showToast={showToast}
              onRefreshStats={refreshStats}
            />
          )}

          {activeTab === 'confirmations' && (
            <ConfirmationsView
              units={units}
              showToast={showToast}
              onRefreshStats={refreshStats}
            />
          )}

          {activeTab === 'verifications' && (
            <VerificationsView
              showToast={showToast}
              onRefreshStats={refreshStats}
            />
          )}

          {activeTab === 'masterlog' && (
            <MasterLogView
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddUnitModal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        properties={properties}
        onSuccess={() => {
          refreshUnits();
          refreshStats();
        }}
        showToast={showToast}
      />

      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onSuccess={() => {
          refreshProperties();
          refreshStats();
        }}
        showToast={showToast}
      />

      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        showToast={showToast}
        properties={properties}
        units={units}
        refreshData={() => {
          refreshProperties();
          refreshUnits();
          refreshStats();
        }}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
