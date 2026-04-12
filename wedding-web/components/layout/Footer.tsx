import Link from 'next/link';

const templateLinks = [
  { href: '/mau-thiep?style=hien-dai', label: 'Hiện đại' },
  { href: '/mau-thiep?style=co-dien', label: 'Cổ điển' },
  { href: '/mau-thiep?style=toi-gian', label: 'Tối giản' },
  { href: '/mau-thiep?style=vintage', label: 'Vintage' },
  { href: '/mau-thiep', label: 'Xem tất cả' },
];

const supportLinks = [
  { href: '/huong-dan', label: 'Hướng dẫn sử dụng' },
  { href: '/cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' },
  { href: '/lien-he', label: 'Liên hệ' },
  { href: '/chinh-sach', label: 'Chính sách' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Column 1: Brand */}
          <div className="footer__col footer__col--brand">
            <Link href="/" className="footer__logo">
              JunTech
            </Link>
            <p className="footer__tagline">
              Nền tảng thiệp cưới online hàng đầu Việt Nam
            </p>
            <p className="footer__copyright">
              &copy; 2026 JunTech. Tất cả quyền được bảo lưu.
            </p>
          </div>

          {/* Column 2: Templates */}
          <div className="footer__col">
            <h4 className="footer__col-title">Mẫu thiệp</h4>
            <ul className="footer__links">
              {templateLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="footer__col">
            <h4 className="footer__col-title">Hỗ trợ</h4>
            <ul className="footer__links">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Liên hệ</h4>
            <ul className="footer__links">
              <li>
                <span className="footer__contact-label">Email:</span>{' '}
                <a href="mailto:hello@juntech.vn" className="footer__link">
                  hello@juntech.vn
                </a>
              </li>
              <li>
                <span className="footer__contact-label">Hotline:</span>{' '}
                <a href="tel:1900xxxx" className="footer__link">
                  1900 xxxx
                </a>
              </li>
              <li className="footer__hours">
                Thứ 2 &mdash; Thứ 7, 8:00 &mdash; 17:30
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__bottom-text">
          Thiết kế và phát triển bởi JunTech
        </p>
      </div>

    </footer>
  );
}
