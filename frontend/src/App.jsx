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
import { RotateCw, Menu, Building2, Shield, Settings } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      setIsMobileMenuOpen(false);
      showToast('You have been logged out. Please sign in to continue.', 'info');
    }
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.is_superuser || currentUser?.is_staff;

  const tabLabels = {
    'dashboard': 'Dashboard',
    'rent-sheet': 'Rent Ledger',
    'units': 'Properties & Units',
    'import': 'Import Receipts',
    'confirmations': 'Confirmations',
    'verifications': 'Verifications',
    'masterlog': 'Master Log',
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

  // User is logged in: Render the full application with Responsive Sidebar
  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        currentUser={currentUser}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
        onOpenSetup={() => setIsSetupOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area on the right */}
      <div className="main-content-wrapper">
        {/* Mobile Header Topbar (visible only on screens < 1024px) */}
        <header className="mobile-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                padding: 0
              }}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={16} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {tabLabels[activeTab] || 'AutoRental'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <button
                onClick={() => setIsSetupOpen(true)}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 600
                }}
              >
                <Settings size={13} />
                <span>Setup</span>
              </button>
            )}
            <span
              className={`badge ${isAdmin ? 'badge-rose' : 'badge-indigo'}`}
              style={{ fontSize: '0.68rem', padding: '3px 7px' }}
            >
              {currentUser.username}
            </span>
          </div>
        </header>

        <main className="main-container">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              setActiveTab={setActiveTab}
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

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
