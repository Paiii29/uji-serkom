'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: '', email: '', password: '', telepon: '', alamat: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Cek email sudah terdaftar
    const { data: existing } = await supabase
      .from('customer')
      .select('email')
      .eq('email', form.email)
      .single();

    if (existing) {
      setError('Email sudah terdaftar');
      setLoading(false);
      return;
    }

    // Insert customer baru
    const { data, error: insertError } = await supabase
      .from('customer')
      .insert({
        nama: form.nama,
        email: form.email,
        password: form.password,
        telepon: form.telepon,
        alamat: form.alamat,
      })
      .select()
      .single();

    if (insertError) {
      setError('Gagal daftar: ' + insertError.message);
      setLoading(false);
      return;
    }

    login({
      id: data.id,
      email: data.email,
      nama: data.nama,
      role: 'customer',
    });
    router.push('/');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Daftar</h1>
        <p className="auth-sub">Buat akun customer baru</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-input"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telepon</label>
            <input
              type="text"
              className="form-input"
              value={form.telepon}
              onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-block" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="auth-footer">
          Sudah punya akun? <Link href="/login">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}