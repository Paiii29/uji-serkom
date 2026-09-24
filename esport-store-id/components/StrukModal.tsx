'use client';

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
  tanggal: string;
}

interface StrukModalProps {
  transaksi: Transaksi;
  onClose: () => void;
}

export default function StrukModal({ transaksi, onClose }: StrukModalProps) {
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

  const handlePrint = () => {
    // Buat iframe tersembunyi untuk print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // HTML struk untuk print
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk-${transaksi.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            color: #000;
          }
          .struk-box {
            max-width: 600px;
            margin: 0 auto;
            border-top: 4px solid #000;
            padding: 20px;
          }
          .struk-header {
            text-align: center;
            margin-bottom: 16px;
          }
          .struk-header h1 {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .struk-header p {
            font-size: 12px;
            margin: 2px 0;
          }
          .struk-divider {
            border-top: 1px dashed #999;
            margin: 16px 0;
          }
          .struk-info p,
          .struk-pembeli p {
            font-size: 13px;
            margin: 4px 0;
            line-height: 1.5;
          }
          .struk-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          .struk-table th {
            text-align: left;
            border-bottom: 1px solid #999;
            padding: 8px 4px;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
          }
          .struk-table td {
            padding: 8px 4px;
            border-bottom: 1px dashed #ddd;
          }
          .struk-table td:last-child,
          .struk-table th:last-child {
            text-align: right;
          }
          .struk-total {
            text-align: right;
          }
          .struk-total p {
            margin: 4px 0;
            font-size: 14px;
          }
          .struk-total-amount {
            font-size: 22px;
            font-weight: 900;
          }
          .struk-footer {
            text-align: center;
            margin-top: 16px;
          }
          .struk-footer p {
            font-size: 11px;
            margin: 4px 0;
          }
          @page { margin: 15mm; size: A4 portrait; }
        </style>
      </head>
      <body>
        <div class="struk-box">
          <div class="struk-header">
            <h1>ESPORT STORE ID</h1>
            <p>Merchandise Resmi Tim Esport</p>
            <p>Ponorogo, Jawa Timur</p>
          </div>

          <div class="struk-divider"></div>

          <div class="struk-info">
            <p><strong>No. Transaksi:</strong> #${transaksi.id}</p>
            <p><strong>Tanggal:</strong> ${formatTanggal(transaksi.tanggal)}</p>
          </div>

          <div class="struk-divider"></div>

          <div class="struk-pembeli">
            <p><strong>Pembeli:</strong></p>
            <p>${transaksi.pembeli.nama}</p>
            <p>${transaksi.pembeli.email}</p>
            <p>${transaksi.pembeli.telepon}</p>
            <p>${transaksi.pembeli.alamat}</p>
          </div>

          <div class="struk-divider"></div>

          <table class="struk-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${transaksi.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.nama}</td>
                  <td>${item.qty}</td>
                  <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                  <td>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="struk-divider"></div>

          <div class="struk-total">
            <p><strong>TOTAL BAYAR:</strong></p>
            <p class="struk-total-amount">Rp ${Number(transaksi.total).toLocaleString('id-ID')}</p>
          </div>

          <div class="struk-divider"></div>

          <div class="struk-footer">
            <p>Terima kasih telah berbelanja!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
            <p style="margin-top: 16px; font-weight: 700;">~ Esport Store ID ~</p>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Tunggu konten render, baru print
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Hapus iframe setelah print
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };

  return (
    <div className="modal-overlay struk-modal-overlay" onClick={onClose}>
      <div
        className="modal-content struk-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: '1.5rem', position: 'relative' }}
      >
        <button
          onClick={onClose}
          className="btn-close struk-modal-close"
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
          title="Tutup"
        >
          ✕
        </button>

        <div className="struk-box" style={{ borderTop: 'none', padding: '1rem' }}>
          <div className="struk-header">
            <h1>ESPORT STORE ID</h1>
            <p>Merchandise Resmi Tim Esport</p>
            <p>Ponorogo, Jawa Timur</p>
          </div>

          <div className="struk-divider"></div>

          <div className="struk-info">
            <p><strong>No. Transaksi:</strong> #{transaksi.id}</p>
            <p><strong>Tanggal:</strong> {formatTanggal(transaksi.tanggal)}</p>
          </div>

          <div className="struk-divider"></div>

          <div className="struk-pembeli">
            <p><strong>Pembeli:</strong></p>
            <p>{transaksi.pembeli.nama}</p>
            <p>{transaksi.pembeli.email}</p>
            <p>{transaksi.pembeli.telepon}</p>
            <p>{transaksi.pembeli.alamat}</p>
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
              {transaksi.items.map((item) => (
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
              Rp {Number(transaksi.total).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="struk-divider"></div>

          <div className="struk-footer">
            <p>Terima kasih telah berbelanja!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
            <p style={{ marginTop: '1rem', fontWeight: 700 }}>~ Esport Store ID ~</p>
          </div>
        </div>

        <div className="modal-actions struk-modal-actions" style={{ marginTop: '1.25rem' }}>
          <button onClick={handlePrint} className="btn">
            Cetak Sekarang
          </button>
          <button onClick={onClose} className="btn btn-outline">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}