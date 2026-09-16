'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';

interface Admin {
  id: number;
  email: string;
  nama: string;
  role: string;
  created_at: string;
}

export default function KelolaAdmin() {
  const { user } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nama: '', role: 'admin' });
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admin').select('*').order('id');
    setAdmins(data || []);
  };

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      router.push('/login');
      return;
    }
    fetchAdmins();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('admin').insert(form);
    if (error) {
      alert('Gagal tambah admin: ' + error.message);
    } else {
      alert('Admin baru berhasil ditambahkan!');
      setModalOpen(false);
      setForm({ email: '', password: '', nama: '', role: 'admin' });
      fetchAdmins();
    }
    setLoading(false);
  };

  const handleHapus = async (id: number, role: string) => {
    if (role === 'superadmin') {
      alert('Tidak bisa hapus superadmin!');
      return;
    }
    if (!confirm('Yakin hapus admin ini?')) return;
    const { error } = await supabase.from('admin').delete().eq('id', id);
    if (error) alert('Gagal hapus: ' + error.message);
    else fetchAdmins();
  };

  if (!user || user.role !== 'superadmin') return null;

  return (
    <div className="admin-wrapper">
      <AdminNavbar />
      <div className="admin-section">
        <div className="admin-header">
          <h1 className="admin-title">Kelola Admin</h1>
          <button onClick={() => setModalOpen(true)} className="btn">+ Tambah Admin</button>
        </div>

        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Halaman ini hanya bisa diakses oleh <strong>Superadmin</strong>.
        </p>

        <div className="produk-admin-grid">
          {admins.map((a) => (
            <div key={a.id} className="produk-admin-card">
              <p className="card-produk-kategori">{a.role}</p>
              <p className="produk-admin-nama">{a.nama || '-'}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{a.email}</p>
              {a.role !== 'superadmin' && (
                <div className="produk-admin-actions">
                  <button onClick={() => handleHapus(a.id, a.role)} className="btn btn-sm btn-danger">Hapus</button>
                </div>
              )}
              {a.role === 'superadmin' && (
                <p style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 800, letterSpacing: '1px' }}>
                  SUPERADMIN - TIDAK BISA DIHAPUS
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TAMBAH ADMIN */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Tambah Admin Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input type="text" className="form-input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="text" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">Batal</button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}