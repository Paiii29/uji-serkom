'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ produk: 0, transaksi: 0, customer: 0, admin: 0 });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }

    async function fetchStats() {
      const [p, t, c, a] = await Promise.all([
        supabase.from('produk').select('*', { count: 'exact', head: true }),
        supabase.from('transaksi').select('*', { count: 'exact', head: true }),
        supabase.from('customer').select('*', { count: 'exact', head: true }),
        supabase.from('admin').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        produk: p.count || 0,
        transaksi: t.count || 0,
        customer: c.count || 0,
        admin: a.count || 0,
      });
    }
    fetchStats();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="admin-wrapper">
      <AdminNavbar />
      <div className="admin-section">
        <div className="admin-header">
          <h1 className="admin-title">Dashboard</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Selamat datang, <strong>{user.nama}</strong> ({user.role})
          </p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <p className="stat-label">Total Produk</p>
            <p className="stat-value">{stats.produk}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Transaksi</p>
            <p className="stat-value">{stats.transaksi}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Customer</p>
            <p className="stat-value">{stats.customer}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Admin</p>
            <p className="stat-value">{stats.admin}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin/produk" className="btn">Kelola Produk</Link>
          {user.role === 'superadmin' && (
            <Link href="/admin/kelola-admin" className="btn btn-outline">Kelola Admin</Link>
          )}
        </div>
      </div>
    </div>
  );
}