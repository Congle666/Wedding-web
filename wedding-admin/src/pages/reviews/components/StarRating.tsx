interface StarRatingProps {
  rating: number;
}

export default function StarRating({ rating }: StarRatingProps) {
  return (
    <span style={{ fontSize: 14, fontWeight: 500, color: '#92400E' }}>
      {rating} / 5 sao
    </span>
  );
}
