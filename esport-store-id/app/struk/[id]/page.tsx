'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Transaksi {
  id: number;
  pembeli: {
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
  };
  items: {
    id: number;
    nama: string;
    harga: number;
    qty: number;
  }[];
  total: number;
  status: string;
  tanggal: string;
}

export default function StrukPage() {
  const params = useParams();
  const router = useRouter();
  const [trx, setTrx] = useState<Transaksi | null>(null);

  useEffect(() => {
    async function fetchTrx() {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .eq('id', Number(params.id))
        .single();
      if (!error) setTrx(data);
    }
    fetchTrx();
  }, [params.id]);

  if (!trx) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Memuat struk...</p>
      </div>
    );
  }

  const formatTanggal = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="struk-actions no-print">
        <button onClick={() => window.print()} className="btn">
          Cetak Struk
        </button>
        <button onClick={() => router.push('/')} className="btn btn-outline">
          Kembali ke Beranda
        </button>
      </div>

      <div className="struk-wrapper">
        <div className="struk-box">
          <div className="struk-header">
            <h1>ESPORT STORE ID</h1>
            <p>Merchandise Resmi Tim Esport</p>
            <p>Ponorogo, Jawa Timur</p>
          </div>

          <div className="struk-divider"></div>

          <div className="struk-info">
            <p><strong>No. Transaksi:</strong> #{trx.id}</p>
            <p><strong>Tanggal:</strong> {formatTanggal(trx.tanggal)}</p>
          </div>

          <div className="struk-divider"></div>

          <div className="struk-pembeli">
            <p><strong>Pembeli:</strong></p>
            <p>{trx.pembeli.nama}</p>
            <p>{trx.pembeli.email}</p>
            <p>{trx.pembeli.telepon}</p>
            <p>{trx.pembeli.alamat}</p>
          </div>

          <div className="struk-divider"></div>

          <table className="struk-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {trx.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nama}</td>
                  <td>{item.qty}</td>
                  <td>Rp {item.harga.toLocaleString('id-ID')}</td>
                  <td>Rp {(item.harga * item.qty).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="struk-divider"></div>

          <div className="struk-total">
            <p><strong>TOTAL BAYAR:</strong></p>
            <p className="struk-total-amount">
              Rp {Number(trx.total).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="struk-divider"></div>

          <div className="struk-footer">
            <p>Terima kasih telah berbelanja!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
            <p style={{ marginTop: '1rem', fontWeight: 700 }}>
              ~ Esport Store ID ~
            </p>
          </div>
        </div>
      </div>
    </>
  );
}