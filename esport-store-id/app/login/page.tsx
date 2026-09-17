'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Cek admin dulu
    const { data: adminData } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (adminData) {
      login({
        id: adminData.id,
        email: adminData.email,
        nama: adminData.nama,
        role: adminData.role,
      });
      // Trigger event biar CartContext load keranjang user ini
      window.dispatchEvent(new Event('user-login'));
      router.push('/admin/dashboard');
      setLoading(false);
      return;
    }

    // Cek customer
    const { data: customerData } = await supabase
      .from('customer')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (customerData) {
      login({
        id: customerData.id,
        email: customerData.email,
        nama: customerData.nama,
        role: 'customer',
      });
      // Trigger event biar CartContext load keranjang user ini
      window.dispatchEvent(new Event('user-login'));
      router.push('/');
      setLoading(false);
      return;
    }

    setError('Email atau password salah');
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-sub">Masuk ke akun kamu</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Belum punya akun? <Link href="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}