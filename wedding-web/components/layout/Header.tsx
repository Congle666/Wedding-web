'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/lib/store/auth.store';
import { getInitials, cn } from '@/lib/utils/helpers';
import Button from '@/components/ui/Button';
import MobileMenu from './MobileMenu';

const NAV_LINKS = [
  { href: '/mau-thiep', label: 'Mẫu thiệp' },
  { href: '/huong-dan', label: 'Hướng dẫn' },
  { href: '/lien-he', label: 'Liên hệ' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const hydrated = useAuthStore((s) => s.hydrated);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHomepage = pathname === '/';
  const isTransparent = isHomepage && scrollY <= 80;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <>
      <header
        className={cn(
          'header',
          isTransparent ? 'header--transparent' : 'header--solid'
        )}
      >
        <div className="header__inner">
          {/* Logo */}
          <Link href="/" className="header__logo-link">
            <span
              className="header__logo"
              style={{
                color: isTransparent ? '#FFFFFF' : '#8B1A1A',
              }}
            >
              JunTech
            </span>
            <span
              className="header__tagline"
              style={{
                color: isTransparent
                  ? 'rgba(255,255,255,0.7)'
                  : '#9CA3AF',
              }}
            >
              Thiệp cưới online
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="header__nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'header__nav-link',
                  isTransparent
                    ? 'header__nav-link--light'
                    : 'header__nav-link--dark',
                  pathname === link.href && 'header__nav-link--active'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions - only show after hydration to avoid mismatch */}
          <div className="header__actions">
            {!hydrated ? (
              <span style={{ width: 120 }} />
            ) : isAuthenticated && user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    'header__manage-link',
                    isTransparent
                      ? 'header__manage-link--light'
                      : 'header__manage-link--dark'
                  )}
                >
                  Quản lý thiệp
                </Link>
                <div className="header__dropdown" ref={dropdownRef}>
                  <button
                    className="header__avatar"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="Menu tài khoản"
                  >
                    {getInitials(user.full_name || user.email || 'U')}
                  </button>
                  {dropdownOpen && (
                    <div className="header__dropdown-menu">
                      <Link
                        href="/dashboard"
                        className="header__dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Tài khoản
                      </Link>
                      <Link
                        href="/dashboard/don-hang"
                        className="header__dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Đơn hàng
                      </Link>
                      <button
                        className="header__dropdown-item header__dropdown-item--logout"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/dang-nhap">
                  <Button variant="outline">Đăng nhập</Button>
                </Link>
                <Link href="/dang-ky">
                  <Button variant="primary">Bắt đầu ngay</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              'header__mobile-btn',
              isTransparent
                ? 'header__mobile-btn--light'
                : 'header__mobile-btn--dark'
            )}
            onClick={() => setMobileMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

    </>
  );
}
