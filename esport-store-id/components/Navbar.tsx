'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const totalItem = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">Esport Store</Link>
      <ul className="nav-menu">
        <li><Link href="/">Beranda</Link></li>
        <li>
          <Link href="/keranjang">
            Keranjang
            {totalItem > 0 && <span className="cart-badge">{totalItem}</span>}
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                Hai, {user.nama}
              </span>
            </li>
            {user.role === 'admin' || user.role === 'superadmin' ? (
              <li><Link href="/admin/dashboard">Dashboard</Link></li>
            ) : null}
            <li><button onClick={handleLogout} className="nav-logout">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/register">Daftar</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}