interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  danger?: boolean;
  loading?: boolean;
}

export default function StatCard({ label, value, trend, trendUp, danger, loading }: StatCardProps) {
  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 80, height: 28, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 100, height: 12 }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 8 }}>{label}</p>
      <p className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: danger ? '#991B1B' : '#1A1A1A', fontFamily: "'Be Vietnam Pro', sans-serif", marginBottom: 4 }}>
        {value}
      </p>
      {trend && (
        <p style={{ fontSize: 13, color: trendUp ? '#065F46' : '#991B1B' }}>
          {trend}
        </p>
      )}
    </div>
  );
}
