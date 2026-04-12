export default function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8F7F5' }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#8B1A1A', fontFamily: "'Be Vietnam Pro', sans-serif" }}>Wedding Admin</p>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Đang tải...</p>
      </div>
    </div>
  );
}
