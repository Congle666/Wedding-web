'use client';

import { CSSProperties } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/mau-thiep', label: 'Mẫu thiệp' },
  { href: '/huong-dan', label: 'Hướng dẫn' },
  { href: '/lien-he', label: 'Liên hệ' },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'tween', duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
  exit: {
    x: '100%',
    transition: { type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] },
  },
};

const linkContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/* ── Inline styles ── */

const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 480,
    background: '#ffffff',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EDE8E1',
  },
  logo: {
    fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
    fontSize: 26,
    fontWeight: 600,
    color: '#8B1A1A',
    textDecoration: 'none',
  },
  closeBtn: {
    fontFamily: "var(--font-body), 'Be Vietnam Pro', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: '#6B6B6B',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  link: {
    display: 'block',
    fontFamily: "var(--font-display), 'Cormorant Garamond', serif",
    fontSize: 36,
    fontWeight: 500,
    color: '#1A1A1A',
    textDecoration: 'none',
    padding: '20px 0',
    transition: 'color 0.2s ease',
  },
  divider: {
    height: 1,
    background: '#EDE8E1',
  },
  footer: {
    padding: '24px 32px',
    borderTop: '1px solid #EDE8E1',
  },
  footerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  footerLink: {
    display: 'block',
  },
  logoutBtn: {
    fontFamily: "var(--font-body), 'Be Vietnam Pro', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: '#8B1A1A',
    background: 'none',
    border: '1px solid #EDE8E1',
    borderRadius: 8,
    padding: 12,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
    transition: 'background-color 0.2s ease',
  },
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            style={styles.backdrop}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            style={styles.panel}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top bar */}
            <div style={styles.header}>
              <Link href="/" style={styles.logo} onClick={onClose}>
                JunTech
              </Link>
              <button style={styles.closeBtn} onClick={onClose}>
                Đóng
              </button>
            </div>

            {/* Nav links */}
            <motion.nav
              style={styles.nav}
              variants={linkContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {NAV_LINKS.map((link, index) => (
                <motion.div key={link.href} variants={linkVariants}>
                  {index > 0 && <div style={styles.divider} />}
                  <Link
                    href={link.href}
                    style={styles.link}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Bottom actions */}
            <div style={styles.footer}>
              {isAuthenticated && user ? (
                <div style={styles.footerActions}>
                  <Link href="/dashboard" style={styles.footerLink} onClick={onClose}>
                    <Button variant="primary">Quản lý thiệp</Button>
                  </Link>
                  <button style={styles.logoutBtn} onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div style={styles.footerActions}>
                  <Link href="/dang-nhap" style={styles.footerLink} onClick={onClose}>
                    <Button variant="outline">Đăng nhập</Button>
                  </Link>
                  <Link href="/dang-ky" style={styles.footerLink} onClick={onClose}>
                    <Button variant="primary">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
