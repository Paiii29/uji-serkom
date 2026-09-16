'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-store">
      <div className="footer-store-inner">
        {/* Kolom 1: Brand */}
        <div className="footer-col">
          <p className="footer-store-logo">ESPORT STORE ID</p>
          <p className="footer-store-desc">
            Merchandise resmi tim esport favoritmu. Jersey, hoodie, kaos, topi, dan aksesoris gaming berkualitas tinggi.
          </p>
          <div className="footer-store-social">
            {/* Instagram */}
            <a
              href="https://instagram.com/who.linnn_"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Paiii29"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97.01 1.95.13 2.87.39 2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.05.78 2.13 0 1.54-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/6285737429908"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              aria-label="WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </a>
          </div>

          {/* TOMBOL LIHAT PROFIL CEO */}
          <a
            href="https://portofolio-paiii29.vercel.app/"
            className="footer-store-ceo"
          >
            <span>Lihat Profil CEO Kami</span>
            <span className="footer-store-ceo-arrow">→</span>
          </a>
        </div>

        {/* Kolom 2: Navigasi */}
        <div className="footer-col">
          <p className="footer-store-title">Navigasi</p>
          <ul className="footer-store-list">
            <li><Link href="/">Beranda</Link></li>
            <li><Link href="/keranjang">Keranjang</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/register">Daftar</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Kategori */}
        <div className="footer-col">
          <p className="footer-store-title">Kategori</p>
          <ul className="footer-store-list">
            <li><Link href="/">Jersey</Link></li>
            <li><Link href="/">Hoodie</Link></li>
            <li><Link href="/">Kaos</Link></li>
            <li><Link href="/">Aksesoris</Link></li>
          </ul>
        </div>

        {/* Kolom 4: Kontak */}
        <div className="footer-col">
          <p className="footer-store-title">Kontak</p>
          <ul className="footer-store-list">
            <li>Email: dafaadrenalin29@gmail.com</li>
            <li>Telepon: 6285737429908</li>
            <li>Lokasi: Ponorogo, Jawa Timur</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-store-bottom">
        <p>© {new Date().getFullYear()} Esport Store ID. All Rights Reserved.</p>
        <p>Dibuat oleh Dafa Adrenalin Pratama</p>
      </div>
    </footer>
  );
}