'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Tutup menu saat scroll (optional)
  useEffect(() => {
    const onScroll = () => {
      if (open) setOpen(false);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-nav-inner">
        <Link href="/admin/dashboard" className="admin-nav-logo">
          Admin Panel
        </Link>

        {/* Tombol Hamburger (muncul di HP) */}
        <button
          className="admin-nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? (
            // Ikon X (close)
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            // Ikon Garis Tiga (hamburger)
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Menu Desktop */}
        <ul className="admin-nav-menu">
          <li><Link href="/admin/dashboard">Dashboard</Link></li>
          <li><Link href="/admin/produk">Produk</Link></li>
          <li><Link href="/admin/kategori">Kategori</Link></li>
          <li><Link href="/admin/laporan">Laporan</Link></li>
          {user?.role === 'superadmin' && (
            <li><Link href="/admin/kelola-admin">Kelola Admin</Link></li>
          )}
          <li><Link href="/">Lihat Toko</Link></li>
          <li>
            <button onClick={handleLogout} className="nav-logout">
              Logout ({user?.nama})
            </button>
          </li>
        </ul>
      </div>

      {/* Menu Mobile (slide down) */}
      <div className={`admin-nav-mobile ${open ? 'open' : ''}`}>
        <ul>
          <li><Link href="/admin/dashboard" onClick={() => setOpen(false)}>Dashboard</Link></li>
          <li><Link href="/admin/produk" onClick={() => setOpen(false)}>Produk</Link></li>
          <li><Link href="/admin/kategori" onClick={() => setOpen(false)}>Kategori</Link></li>
          <li><Link href="/admin/laporan" onClick={() => setOpen(false)}>Laporan</Link></li>
          {user?.role === 'superadmin' && (
            <li><Link href="/admin/kelola-admin" onClick={() => setOpen(false)}>Kelola Admin</Link></li>
          )}
          <li><Link href="/" onClick={() => setOpen(false)}>Lihat Toko</Link></li>
          <li>
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="nav-logout-mobile"
            >
              Logout ({user?.nama})
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}