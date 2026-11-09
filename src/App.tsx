import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { PublicHome } from './components/PublicHome.js';
import { AdminLogin } from './components/AdminLogin.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { BookDetailView } from './components/BookDetailView.js';
import { checkAuth, getStoredAdminUser } from './api.js';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [currentView, setCurrentView] = useState<'public' | 'admin-dashboard' | 'book-detail' | 'login'>('public');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialize theme and verify auth on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem('bma_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    checkAuth().then(authed => {
      setIsAdmin(authed);
      if (authed) {
        setAdminUser(getStoredAdminUser());
      }
    });

    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      setCurrentView('admin-dashboard');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('bma_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNavigate = (view: 'public' | 'admin-dashboard' | 'book-detail' | 'login') => {
    if (view === 'admin-dashboard' && !isAdmin) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const handleLoginSuccess = (user: { email: string; name: string }) => {
    setIsAdmin(true);
    setAdminUser(user);
    setCurrentView('admin-dashboard');
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentView('book-detail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bma-bg)] text-[var(--bma-text-primary)] transition-colors duration-200">
      <Navbar
        isAdmin={isAdmin}
        userEmail={adminUser?.email}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
        onNavigate={handleNavigate}
        selectedBookTitle={selectedBookId || undefined}
      />

      <main className="flex-1 w-full">
        {currentView === 'login' && (
          <AdminLogin
            onSuccess={handleLoginSuccess}
            onCancel={() => setCurrentView('public')}
          />
        )}

        {currentView === 'public' && (
          <PublicHome
            onGoToAdmin={() => handleNavigate(isAdmin ? 'admin-dashboard' : 'login')}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onSelectBook={handleSelectBook}
          />
        )}

        {currentView === 'book-detail' && selectedBookId && (
          <BookDetailView
            bookId={selectedBookId}
            onBack={() => setCurrentView('admin-dashboard')}
            onBookDeleted={() => {
              setSelectedBookId(null);
              setCurrentView('admin-dashboard');
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
