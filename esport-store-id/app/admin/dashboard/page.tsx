'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface Transaksi {
  id: number;
  total: number;
  tanggal: string;
  items: { nama: string; qty: number; harga: number }[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ produk: 0, transaksi: 0, customer: 0, admin: 0 });
  const [pendapatan, setPendapatan] = useState(0);
  const [chartData, setChartData] = useState<{ tanggal: string; pendapatan: number }[]>([]);
  const [produkTerlaris, setProdukTerlaris] = useState<{ nama: string; qty: number }[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }

    async function fetchAll() {
      const [p, t, c, a, trx] = await Promise.all([
        supabase.from('produk').select('*', { count: 'exact', head: true }),
        supabase.from('transaksi').select('*', { count: 'exact', head: true }),
        supabase.from('customer').select('*', { count: 'exact', head: true }),
        supabase.from('admin').select('*', { count: 'exact', head: true }),
        supabase.from('transaksi').select('*').order('tanggal', { ascending: true }),
      ]);

      setStats({
        produk: p.count || 0,
        transaksi: t.count || 0,
        customer: c.count || 0,
        admin: a.count || 0,
      });

      const trxData = (trx.data || []) as Transaksi[];

      const totalPendapatan = trxData.reduce((sum, x) => sum + Number(x.total), 0);
      setPendapatan(totalPendapatan);

      const last7Days: { tanggal: string; pendapatan: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const dayTotal = trxData
          .filter((trx) => {
            const trxDate = new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            return trxDate === dateStr;
          })
          .reduce((sum, x) => sum + Number(x.total), 0);
        last7Days.push({ tanggal: dateStr, pendapatan: dayTotal });
      }
      setChartData(last7Days);

      const map = new Map<string, number>();
      trxData.forEach((trx) => {
        trx.items.forEach((item) => {
          map.set(item.nama, (map.get(item.nama) || 0) + item.qty);
        });
      });
      const terlaris = Array.from(map.entries())
        .map(([nama, qty]) => ({ nama: nama.length > 15 ? nama.slice(0, 15) + '...' : nama, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
      setProdukTerlaris(terlaris);
    }

    fetchAll();
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

        <div className="stat-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <p className="stat-label">Total Pendapatan</p>
          <p className="stat-value" style={{ fontSize: '2rem' }}>
            Rp {pendapatan.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Pendapatan 7 Hari Terakhir</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="tanggal" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                  contentStyle={{ background: '#fff', border: '1px solid #e0e0e0' }}
                />
                <Line
                  type="monotone"
                  dataKey="pendapatan"
                  stroke="#e60012"
                  strokeWidth={3}
                  dot={{ fill: '#e60012', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {produkTerlaris.length > 0 && (
          <div className="chart-card">
            <h2 className="chart-title">Produk Terlaris (Top 5)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={produkTerlaris}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="nama" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    formatter={(value: any) => `${Number(value)} terjual`}
                    contentStyle={{ background: '#fff', border: '1px solid #e0e0e0' }}
                  />
                  <Bar dataKey="qty" fill="#e60012" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link href="/admin/produk" className="btn">Kelola Produk</Link>
          {user.role === 'superadmin' && (
            <Link href="/admin/kelola-admin" className="btn btn-outline">Kelola Admin</Link>
          )}
        </div>
      </div>
    </div>
  );
}