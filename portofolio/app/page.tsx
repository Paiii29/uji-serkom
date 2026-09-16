'use client';

import { useEffect, useRef, useState } from 'react';

interface GaleriItem {
  judul: string;
  tanggal: string;
  fotos: string[];
}

interface ArtikelItem {
  judul: string;
  tanggal: string;
  konten: string[];
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [galeriAktif, setGaleriAktif] = useState<GaleriItem | null>(null);
  const [artikelAktif, setArtikelAktif] = useState<ArtikelItem | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const dialogGaleri = useRef<HTMLDialogElement>(null);
  const dialogArtikel = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const galeriData: Record<string, GaleriItem> = {
    pkl: {
      judul: 'Kunjungan Industri di GAMELAB Salatiga',
      tanggal: '5 Januari 2026',
      fotos: ['/img/Kegiatan KI 1.png', '/img/Kegiatan KI 2.png', '/img/Kegiatan KI 3.png'],
    },
    pengalaman: {
      judul: 'Proyek Website Undangan Digital',
      tanggal: '2026',
      fotos: ['/img/Undangan 1.png', '/img/Undangan 2.png', '/img/Undangan 3.png'],
    },
    prestasi1: {
      judul: 'Kejuaraan Lomba Pramuka',
      tanggal: '2025',
      fotos: ['/img/Prestasi 1.png', '/img/Prestasi 2.png'],
    },
    prestasi2: {
      judul: 'Lomba PBB Variasi',
      tanggal: '2024',
      fotos: ['/img/Prestasi 3.png', '/img/Prestasi 4.png'],
    },
  };

  const artikelData: Record<string, ArtikelItem> = {
    nextjs: {
      judul: 'Pengalaman Mempelajari Next.js untuk Membuat Undangan Digital Saat PKL',
      tanggal: '4-5-2026',
      konten: [
        'Selama melaksanakan Praktik Kerja Lapangan (PKL), saya mendapatkan kesempatan untuk mempelajari dan menerapkan teknologi Next.js dalam pembuatan undangan digital.',
        'Sebelum mempelajari Next.js, saya sudah mengenal dasar-dasar HTML, CSS, JavaScript, dan React. Di tempat PKL, saya kemudian belajar bagaimana menggunakan Next.js untuk membangun website undangan digital yang memiliki beberapa halaman dan komponen dengan tampilan yang menarik serta responsif.',
        'Dalam proses pembuatan undangan digital, saya belajar membuat dan mengatur berbagai component agar dapat digunakan kembali pada beberapa bagian website.',
        'Selain mempelajari Next.js, saya juga mendapatkan pengalaman dalam membuat tampilan frontend. Saya belajar mengatur layout, warna, font, animasi, ornamen, dan berbagai elemen visual agar undangan digital terlihat lebih modern dan menarik.',
        'Pengalaman ini menjadi bekal bagi saya untuk terus mengembangkan kemampuan di bidang Web Development, khususnya dalam pembuatan website menggunakan React dan Next.js.',
      ],
    },
    webdev: {
      judul: 'Pengalaman Belajar Web Development di SMK',
      tanggal: '6-8-2024',
      konten: [
        'Menjadi siswa di SMK Negeri 1 Jenangan memberikan saya banyak pengalaman dan pengetahuan baru, terutama dalam bidang Web Development. Sebagai siswa jurusan Rekayasa Perangkat Lunak,',
        'saya mulai mengenal bagaimana sebuah website dibuat, mulai dari menulis kode hingga menghasilkan tampilan website yang dapat digunakan oleh pengguna.',
        'Pada awal belajar, saya mempelajari dasar-dasar HTML dan CSS untuk memahami bagaimana sebuah halaman website dibangun dan dipercantik.',
        'Setelah memahami dasar tersebut, saya mulai belajar JavaScript untuk membuat website menjadi lebih interaktif. Dari proses tersebut, saya semakin tertarik untuk mendalami dunia pengembangan website.',
        'Dengan ilmu dan pengalaman yang saya dapatkan selama belajar di SMK Negeri 1 Jenangan, saya ingin terus meningkatkan kemampuan saya di bidang Web Development. Saya berharap kemampuan tersebut dapat menjadi bekal untuk menghadapi dunia kerja dan mengembangkan berbagai project website yang lebih baik di masa depan.',
      ],
    },
  };

  const bukaGaleri = (key: string) => {
    setGaleriAktif(galeriData[key]);
    setModalIndex(0);
    dialogGaleri.current?.showModal();
  };

  const tutupGaleri = () => {
    dialogGaleri.current?.close();
    setGaleriAktif(null);
  };

  const bukaArtikel = (key: string) => {
    setArtikelAktif(artikelData[key]);
    dialogArtikel.current?.showModal();
  };

  const tutupArtikel = () => {
    dialogArtikel.current?.close();
    setArtikelAktif(null);
  };

  const nextFoto = () => {
    if (!galeriAktif) return;
    setModalIndex((prev) => (prev + 1) % galeriAktif.fotos.length);
  };

  const prevFoto = () => {
    if (!galeriAktif) return;
    setModalIndex((prev) => (prev - 1 + galeriAktif.fotos.length) % galeriAktif.fotos.length);
  };

  const btnIconStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    minWidth: '50px',
    background: 'var(--mpl-red)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '1.5rem',
    clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
    cursor: 'pointer',
    border: 'none',
  };

  return (
    <>
      {/* 1. NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo">DAFA ADRENALIN P</div>
        <ul className="nav-menu">
          <li><a href="#beranda">Beranda</a></li>
          <li><a href="#tentang">Tentang</a></li>
          <li><a href="#profil">Profil</a></li>
          <li><a href="#pendidikan">Pendidikan</a></li>
          <li><a href="#pengalaman">Pengalaman</a></li>
          <li><a href="#kegiatan">Kegiatan</a></li>
          <li><a href="#karya">Karya</a></li>
          <li><a href="#prestasi">Prestasi</a></li>
          <li><a href="#kontak">Kontak</a></li>
        </ul>
      </nav>

      {/* 2. HERO */}
      <section id="beranda" className="hero">
        <div className="hero-content">
          <div>
            <span className="hero-badge">SYSTEM ONLINE</span>
            <h1 className="hero-title">Dafa Adrenalin Pratama</h1>
            <h2 className="hero-subtitle">Junior Web Developer</h2>
            <p className="hero-desc">Membangun website modern dengan Next.js & TypeScript</p>
            <div className="hero-buttons">
              <a href="#kontak" className="btn-primary">Hubungi Saya</a>
              <a href="#karya" className="btn-outline">Lihat Karya</a>
            </div>
          </div>
          <div className="hero-photo-wrap">
            <div className="hero-photo-frame">
              <img src="/img/ap.png" alt="Dafa Adrenalin Pratama" className="hero-photo" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. TENTANG SAYA */}
      <section id="tentang" className="section">
        <div className="section-inner">
          <h2 className="section-title">Tentang <span>Saya</span></h2>
          <div className="divider-glow"></div>
          <div className="card" style={{ padding: '2.5rem' }}>
            <p className="card-text" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
              Saya adalah siswa SMK jurusan Rekayasa Perangkat Lunak yang sedang belajar dan
              mengembangkan kemampuan di bidang pemrograman web. Saya suka mempelajari hal-hal baru,
              terutama yang berkaitan dengan pembuatan website dan aplikasi.
            </p>
            <div style={{ borderLeft: '3px solid var(--mpl-red)', paddingLeft: '1rem' }}>
              <p style={{ color: 'var(--mpl-red)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '1px' }}>VISI</p>
              <p className="card-text" style={{ fontStyle: 'italic' }}>
                Menjadi web developer profesional yang mampu menciptakan solusi digital bermanfaat bagi banyak orang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROFIL PROFESIONAL */}
      <section id="profil" className="section">
        <div className="section-inner">
          <h2 className="section-title">Profil <span>Profesional</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>JABATAN</p>
              <p className="card-title">Siswa / Junior Web Developer</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>INSTANSI</p>
              <p className="card-title">SMK Negeri 1 Jenangan</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>BIDANG</p>
              <p className="card-title" style={{ fontSize: '0.9rem' }}>Web Development, UI Design</p>
            </div>
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <p className="card-text">
              Saat ini saya sedang menempuh pendidikan di jurusan Rekayasa Perangkat Lunak dan
              aktif mempelajari pengembangan web modern seperti HTML, CSS, JavaScript, dan Next.js.
              Saya juga terbiasa menggunakan Git untuk versioning dan Figma untuk desain UI.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PENDIDIKAN */}
      <section id="pendidikan" className="section">
        <div className="section-inner">
          <h2 className="section-title">Riwayat <span>Pendidikan</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-2">
            <div className="card">
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2024 - Sekarang</p>
              <p className="card-title">SMK Negeri 1 Jenangan</p>
              <p className="card-text">Rekayasa Perangkat Lunak</p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2021 - 2024</p>
              <p className="card-title">MTsN 1 Ponorogo</p>
              <p className="card-text">Madrasah Tsanawiyah</p>
            </div>
            <div className="card">
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2015 - 2021</p>
              <p className="card-title">MI Tarbiyatul Islam Coper</p>
              <p className="card-text">Madrasah Ibtidaiyah</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PENGALAMAN */}
      <section id="pengalaman" className="section">
        <div className="section-inner">
          <h2 className="section-title">Pengalaman <span>Belajar</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-2">
            <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2026</p>
                <p className="card-title">Proyek Website Praktik Kerja Lapangan</p>
                <p className="card-text">Tugas Praktik Kerja Lapangan Membuat website Undangan Digital menggunakan Next.js.</p>
              </div>
              <button onClick={() => bukaGaleri('pengalaman')} title="Lihat Foto" style={btnIconStyle}>▣</button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. KEAHLIAN */}
      <section id="keahlian" className="section">
        <div className="section-inner">
          <h2 className="section-title">Keahlian <span>Saya</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-3">
            <div className="card" style={{ textAlign: 'center' }}><p className="card-title">HTML & CSS</p></div>
            <div className="card" style={{ textAlign: 'center' }}><p className="card-title">JavaScript</p></div>
            <div className="card" style={{ textAlign: 'center' }}><p className="card-title">TypeScript</p></div>
            <div className="card" style={{ textAlign: 'center' }}><p className="card-title">React & Next.js</p></div>
            <div className="card" style={{ textAlign: 'center' }}><p className="card-title">Tailwind CSS</p></div>
            <div className="card" style={{ textAlign: 'center' }}><p className="card-title">Git & GitHub</p></div>
          </div>
        </div>
      </section>

      {/* 8. KEGIATAN & ARTIKEL */}
      <section id="kegiatan" className="section">
        <div className="section-inner">
          <h2 className="section-title">Kegiatan <span>& Artikel</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-2">
            <div>
              <h3 style={{ color: 'var(--mpl-red)', marginBottom: '1rem', letterSpacing: '2px', fontWeight: 900 }}>KEGIATAN</h3>

              <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>5 Januari 2026</p>
                  <p className="card-title" style={{ fontSize: '0.95rem' }}>Kunjungan Industri di Salatiga</p>
                </div>
                <button onClick={() => bukaGaleri('pkl')} title="Lihat Foto" style={btnIconStyle}>▣</button>
              </div>
            </div>

            <div>
              <h3 style={{ color: 'var(--mpl-red)', marginBottom: '1rem', letterSpacing: '2px', fontWeight: 900 }}>ARTIKEL</h3>

              <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>4-5-2026</p>
                  <p className="card-title" style={{ fontSize: '0.95rem' }}>Pengalaman Mempelajari Next.js untuk Membuat Undangan Digital Saat PKL</p>
                  <p className="card-text" style={{ fontSize: '0.85rem' }}>Pengalaman belajar Next.js.</p>
                </div>
                <button onClick={() => bukaArtikel('nextjs')} title="Baca Artikel" style={btnIconStyle}>▤</button>
              </div>

              <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>6-8-2024</p>
                  <p className="card-title" style={{ fontSize: '0.95rem' }}>Pengalaman Belajar Web Development di SMK</p>
                  <p className="card-text" style={{ fontSize: '0.85rem' }}>Cerita belajar web development dari nol sebagai siswa SMK.</p>
                </div>
                <button onClick={() => bukaArtikel('webdev')} title="Baca Artikel" style={btnIconStyle}>▤</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 9. KARYA */}
      <section id="karya" className="section">
        <div className="section-inner">
          <h2 className="section-title">Karya <span>& Portofolio</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-2">
            {/* CARD 1: ESPORT STORE ID */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2026</p>
              <p className="card-title">Esport Store ID - Merchandise Tim Esport</p>
              <p className="card-text" style={{ marginBottom: '1.25rem', flexGrow: 1 }}>
                Website e-commerce merchandise tim esport dengan fitur katalog, keranjang, checkout, dan admin panel. Dibangun dengan Next.js & Supabase.
              </p>
              <a
                href="https://esport-store-id.vercel.app/"
                style={{
                  display: 'inline-block',
                  padding: '0.6rem 1.2rem',
                  background: 'var(--mpl-red)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontSize: '0.75rem',
                  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                  alignSelf: 'flex-start',
                  marginTop: 'auto',
                }}
              >
                Lihat Proyek →
              </a>
            </div>

            {/* CARD 2: PORTOFOLIO */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2026</p>
              <p className="card-title">Website Portofolio Pribadi</p>
              <p className="card-text" style={{ marginBottom: '1.25rem', flexGrow: 1 }}>
                Portofolio pribadi dengan Next.js App Router dan Tailwind CSS.
              </p>
              <a
                href="#beranda"
                style={{
                  display: 'inline-block',
                  padding: '0.6rem 1.2rem',
                  background: 'var(--mpl-red)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontSize: '0.75rem',
                  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                  alignSelf: 'flex-start',
                  marginTop: 'auto',
                }}
              >
                Lihat Proyek →
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* 10. PRESTASI */}
      <section id="prestasi" className="section">
        <div className="section-inner">
          <h2 className="section-title">Prestasi <span>Saya</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-2">
            <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2025</p>
                <p className="card-title" style={{ fontSize: '0.95rem' }}>Kejuaraan Lomba Pramuka</p>
                <p className="card-text" style={{ fontSize: '0.8rem' }}>Tingkat Provinsi</p>
              </div>
              <button onClick={() => bukaGaleri('prestasi1')} title="Lihat Foto" style={btnIconStyle}>▣</button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--mpl-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>2025</p>
                <p className="card-title" style={{ fontSize: '0.95rem' }}>Lomba PBB Variasi</p>
                <p className="card-text" style={{ fontSize: '0.8rem' }}>Tingkat Nasional</p>
              </div>
              <button onClick={() => bukaGaleri('prestasi2')} title="Lihat Foto" style={btnIconStyle}>▣</button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. KONTAK */}
      <section id="kontak" className="kontak-section">
        <div className="section-inner">
          <h2 className="section-title">Hubungi <span>Saya</span></h2>
          <div className="divider-glow"></div>
          <div className="grid-3">
            <a href="mailto:dafaadrenalin29@gmail.com" className="kontak-card" style={{ textDecoration: 'none' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>EMAIL</p>
              <p className="card-title" style={{ fontSize: '0.9rem' }}>dafaadrenalin29@gmail.com</p>
            </a>
            <a href="https://wa.me/6285737429908" target="_blank" className="kontak-card" style={{ textDecoration: 'none' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>WHATSAPP</p>
              <p className="card-title" style={{ fontSize: '0.9rem' }}>6285737429908</p>
            </a>
            <div className="kontak-card">
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.5rem' }}>LOKASI</p>
              <p className="card-title" style={{ fontSize: '0.9rem' }}>Ponorogo, Jawa Timur</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="footer">
        <p className="footer-name">Dafa Adrenalin Pratama</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: '0.5rem', letterSpacing: '2px' }}>Junior Web Developer</p>
        <div className="footer-social">
          <a href="https://github.com/Paiii29" target="_blank">GitHub</a>
          <a href="https://instagram.com/who.linnn_" target="_blank">Instagram</a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Dafa Adrenalin Pratama. ALL RIGHTS RESERVED.</p>
      </footer>

      {/* ============ DIALOG GALERI ============ */}
      <dialog
        ref={dialogGaleri}
        className="galeri-dialog"
        onClick={(e) => { if (e.target === dialogGaleri.current) tutupGaleri(); }}
      >
        {galeriAktif && (
          <>
            <div className="galeri-header">
              <div>
                <p className="galeri-title">{galeriAktif.judul}</p>
                <p className="galeri-date">{galeriAktif.tanggal}</p>
              </div>
              <button className="galeri-close" onClick={tutupGaleri}>✕</button>
            </div>

            <div className="galeri-body">
              <div className="galeri-slider">
                <img
                  src={galeriAktif.fotos[modalIndex]}
                  alt={`Foto ${modalIndex + 1}`}
                  className="galeri-img"
                />
                {galeriAktif.fotos.length > 1 && (
                  <>
                    <button className="galeri-nav prev" onClick={prevFoto}>‹</button>
                    <button className="galeri-nav next" onClick={nextFoto}>›</button>
                  </>
                )}
              </div>

              <p className="galeri-counter">
                {modalIndex + 1} / {galeriAktif.fotos.length}
              </p>

              <div className="galeri-thumbs">
                {galeriAktif.fotos.map((foto, i) => (
                  <div
                    key={i}
                    className={`galeri-thumb ${i === modalIndex ? 'active' : ''}`}
                    onClick={() => setModalIndex(i)}
                    style={{
                      backgroundImage: `url(${foto})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </dialog>

      {/* ============ DIALOG ARTIKEL ============ */}
      <dialog
        ref={dialogArtikel}
        className="galeri-dialog"
        onClick={(e) => { if (e.target === dialogArtikel.current) tutupArtikel(); }}
      >
        {artikelAktif && (
          <>
            <div className="galeri-header">
              <div>
                <p className="galeri-title">{artikelAktif.judul}</p>
                <p className="galeri-date">{artikelAktif.tanggal}</p>
              </div>
              <button className="galeri-close" onClick={tutupArtikel}>✕</button>
            </div>

            <div className="galeri-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {artikelAktif.konten.map((paragraf, i) => (
                <p key={i} style={{ color: 'var(--mpl-text-dim)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1rem', textAlign: 'justify' }}>
                  {paragraf}
                </p>
              ))}
            </div>
          </>
        )}
      </dialog>
    </>
  );
}