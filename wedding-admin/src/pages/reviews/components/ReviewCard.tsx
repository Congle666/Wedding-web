import type { Review } from '../../../types';
import { formatShortDate } from '../../../utils/format';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: Review;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

export default function ReviewCard({ review, onApprove, onReject, showActions = false }: ReviewCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        border: '1px solid #E8E3DC',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>
          {review.user?.full_name || 'Không rõ'}
        </span>
        <span style={{ color: '#9CA3AF', fontSize: 13, margin: '0 8px' }}>·</span>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>
          {review.user?.email || ''}
        </span>
        <span style={{ color: '#9CA3AF', fontSize: 13, margin: '0 8px' }}>·</span>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>
          {formatShortDate(review.created_at)}
        </span>
      </div>

      <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 6 }}>
        Mẫu thiệp: {review.template?.name || 'Không rõ'}
      </div>

      <div style={{ marginBottom: 8 }}>
        <StarRating rating={review.rating} />
      </div>

      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
        {review.comment || 'Không có nội dung'}
      </p>

      {showActions && (
        <div className="flex items-center gap-4" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
          <button
            onClick={() => onApprove?.(review.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#065F46',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Duyệt
          </button>
          <button
            onClick={() => onReject?.(review.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#991B1B',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
}
