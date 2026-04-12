import { Card, Tag } from 'antd';
import type { WeddingInfo } from '../../../types';
import { formatShortDate } from '../../../utils/format';

interface WeddingInfoCardProps {
  weddingInfo: WeddingInfo | null | undefined;
  loading?: boolean;
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '10px 0',
        borderBottom: '1px solid #F3F4F6',
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 160,
          flexShrink: 0,
          color: '#6B7280',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, color: '#1A1A1A', fontWeight: 500 }}>{value || '--'}</div>
    </div>
  );
}

export default function WeddingInfoCard({ weddingInfo, loading }: WeddingInfoCardProps) {
  if (loading) {
    return (
      <Card title={<span style={{ fontWeight: 600 }}>Thông tin thiệp cưới</span>}>
        <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF' }}>Đang tải...</div>
      </Card>
    );
  }

  if (!weddingInfo) {
    return (
      <Card title={<span style={{ fontWeight: 600 }}>Thông tin thiệp cưới</span>}>
        <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 14 }}>
          Chưa nhập thông tin thiệp
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={<span style={{ fontWeight: 600 }}>Thông tin thiệp cưới</span>}
      extra={
        weddingInfo.view_count > 0 ? (
          <Tag color="blue">{weddingInfo.view_count} lượt xem</Tag>
        ) : null
      }
      style={{ borderRadius: 8 }}
    >
      {/* Cặp đôi */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginBottom: 4, textTransform: 'uppercase' }}>
        Cặp đôi
      </div>
      <InfoRow label="Chú rể" value={weddingInfo.groom_name} />
      <InfoRow label="Cô dâu" value={weddingInfo.bride_name} />
      <InfoRow label="Ảnh chú rể" value={weddingInfo.groom_photo_url ? <a href={weddingInfo.groom_photo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B1A1A' }}>Xem ảnh</a> : null} />
      <InfoRow label="Ảnh cô dâu" value={weddingInfo.bride_photo_url ? <a href={weddingInfo.bride_photo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B1A1A' }}>Xem ảnh</a> : null} />

      {/* Gia đình */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>
        Gia đình
      </div>
      <InfoRow label="Nhà trai" value={weddingInfo.groom_parent} />
      <InfoRow label="Địa chỉ nhà trai" value={weddingInfo.groom_address} />
      <InfoRow label="Nhà gái" value={weddingInfo.bride_parent} />
      <InfoRow label="Địa chỉ nhà gái" value={weddingInfo.bride_address} />

      {/* Ngày cưới */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>
        Ngày cưới
      </div>
      <InfoRow label="Ngày dương lịch" value={formatShortDate(weddingInfo.wedding_date)} />
      <InfoRow label="Ngày âm lịch" value={weddingInfo.lunar_date} />

      {/* Lễ gia tiên */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>
        Lễ Gia Tiên
      </div>
      <InfoRow label="Giờ" value={weddingInfo.ceremony_time || weddingInfo.wedding_time} />
      <InfoRow label="Địa điểm" value={weddingInfo.ceremony_venue} />
      <InfoRow label="Địa chỉ" value={weddingInfo.ceremony_address} />

      {/* Tiệc cưới */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>
        Tiệc Cưới
      </div>
      <InfoRow label="Giờ" value={weddingInfo.reception_time || weddingInfo.wedding_time} />
      <InfoRow label="Địa điểm" value={weddingInfo.reception_venue} />
      <InfoRow label="Địa chỉ" value={weddingInfo.reception_address || weddingInfo.venue_address} />
      <InfoRow
        label="Google Maps"
        value={
          (weddingInfo.reception_maps_url || weddingInfo.maps_embed_url) ? (
            <a href={weddingInfo.reception_maps_url || weddingInfo.maps_embed_url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B1A1A' }}>
              Xem bản đồ
            </a>
          ) : null
        }
      />

      {/* Nhạc nền */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>
        Khác
      </div>
      <InfoRow label="Nhạc nền" value={weddingInfo.music_url ? <a href={weddingInfo.music_url} target="_blank" rel="noopener noreferrer" style={{ color: '#8B1A1A' }}>Nghe thử</a> : 'Mặc định'} />

      {/* Tài khoản ngân hàng */}
      {weddingInfo.bank_accounts && weddingInfo.bank_accounts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginBottom: 8, textTransform: 'uppercase' }}>
            Tài khoản ngân hàng
          </div>
          {weddingInfo.bank_accounts.map((account, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                background: '#F9FAFB',
                borderRadius: 6,
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 500, color: '#1A1A1A' }}>{account.bank}</div>
              <div style={{ color: '#6B7280', marginTop: 2 }}>
                {account.account} - {account.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section visibility */}
      {weddingInfo.visible_sections && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#8B1A1A', marginBottom: 8, textTransform: 'uppercase' }}>
            Hiển thị section
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(weddingInfo.visible_sections).map(([key, visible]) => (
              <Tag key={key} color={visible ? 'green' : 'default'}>
                {key}: {visible ? 'Hiện' : 'Ẩn'}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
