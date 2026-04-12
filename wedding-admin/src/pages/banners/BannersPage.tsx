import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bannerApi } from '../../api/banner.api';
import PageHeader from '../../components/ui/PageHeader';
import BannerTable from './components/BannerTable';

export default function BannersPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerApi.list(),
  });

  const banners = data?.data || [];

  return (
    <>
      <PageHeader
        title="Banner"
        onAdd={() => navigate('/banners/new')}
        addText="Thêm banner"
      />
      <BannerTable banners={banners} loading={isLoading} />
    </>
  );
}
