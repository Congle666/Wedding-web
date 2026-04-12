import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setLoading(true);
    try {
      const ok = await login({ email, password });
      if (!ok) setError('Email hoặc mật khẩu không chính xác');
    } catch {
      setError('Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #E8E3DC',
    fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s',
  };

  return (
    <>
      <style>{`
        .login-wrapper { min-height: 100vh; display: flex; }
        .login-left { display: none; width: 45%; background: #8B1A1A; padding: 60px 48px; flex-direction: column; justify-content: center; color: #fff; }
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: #fff; }
        .login-mobile-logo { display: block; text-align: center; margin-bottom: 32px; }
        @media (min-width: 1024px) {
          .login-left { display: flex; }
          .login-mobile-logo { display: none; }
        }
      `}</style>
      <div className="login-wrapper">
        {/* Left panel */}
        <div className="login-left">
          <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            Wedding Admin
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 40, lineHeight: 1.6 }}>
            Nền tảng quản lý thiệp cưới chuyên nghiệp
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'Quản lý hàng trăm mẫu thiệp',
              'Theo dõi đơn hàng real-time',
              'Thống kê doanh thu chi tiết',
            ].map((text) => (
              <p key={text} style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)' }}>
                {'\u2014 '}{text}
              </p>
            ))}
          </div>
          <p style={{ marginTop: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            2026 Wedding Platform. All rights reserved.
          </p>
        </div>

        {/* Right panel */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div className="login-mobile-logo">
              <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 20, fontWeight: 700, color: '#8B1A1A' }}>
                Wedding Admin
              </p>
            </div>

            <h1 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 24, fontWeight: 600, marginBottom: 4 }}>
              Đăng nhập
            </h1>
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 32 }}>
              Nhập thông tin để truy cập hệ thống
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#1A1A1A' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#8B1A1A'}
                  onBlur={(e) => e.target.style.borderColor = '#E8E3DC'}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#1A1A1A' }}>
                  Mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    style={{ ...inputStyle, paddingRight: 60 }}
                    onFocus={(e) => e.target.style.borderColor = '#8B1A1A'}
                    onBlur={(e) => e.target.style.borderColor = '#E8E3DC'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', fontSize: 13, color: '#6B6B6B', cursor: 'pointer',
                    }}
                  >
                    {showPass ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#991B1B', marginBottom: 16 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 44, background: loading ? '#B08080' : '#8B1A1A',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
