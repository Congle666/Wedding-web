'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 60_000 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        {children}
      </AuthHydrator>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000, style: { borderRadius: 8, fontSize: 14 } }}
      />
    </QueryClientProvider>
  );
}
