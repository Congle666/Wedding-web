import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../../api/review.api';
import toast from 'react-hot-toast';
import type { Review } from '../../../types';

interface PendingReviewsProps {
  reviews: Review[];
}

export default function PendingReviews({ reviews }: PendingReviewsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewApi.approve(id),
    onSuccess: () => {
      toast.success('Đã duyệt đánh giá', { className: 'toast-success' });
      queryClient.invalidateQueries({ queryKey: ['dashboard-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-pending-reviews'] });
    },
  });

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: 16, fontWeight: 500, fontFamily: "'Be Vietnam Pro', sans-serif" }}>Chờ duyệt</p>
        <span onClick={() => navigate('/reviews')} style={{ fontSize: 13, color: '#8B1A1A', cursor: 'pointer', fontWeight: 500 }}>
          Xem tất cả
        </span>
      </div>

      {reviews.length === 0 ? (
        <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: 24 }}>Không có đánh giá chờ duyệt</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{review.user?.full_name || '\u2014'}</span>
                  <span style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 8 }}>{review.rating}/5 sao</span>
                </div>
                <button
                  onClick={() => approveMutation.mutate(review.id)}
                  disabled={approveMutation.isPending}
                  style={{ background: 'none', border: 'none', color: '#065F46', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Duyệt
                </button>
              </div>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }} className="truncate">
                {review.comment || 'Không có nội dung'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
