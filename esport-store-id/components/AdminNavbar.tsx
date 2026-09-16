'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="admin-navbar">
      <Link href="/admin/dashboard" className="admin-nav-logo">Admin Panel</Link>
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
    </nav>
  );
}