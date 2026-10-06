'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const isProfileCompleted = Boolean(
            user.isProfileCompleted ?? (user as any).profileCompleted
          );

          if (!isProfileCompleted && user.roles?.includes('ROLE_CUSTOMER')) {
            router.replace('/register?step=3');
          } else if (user.roles?.includes('ROLE_ADMIN')) {
            router.replace('/admin/dashboard');
          } else if (user.roles?.includes('ROLE_TELLER')) {
            router.replace('/employee/dashboard');
          } else {
            router.replace('/dashboard');
          }
          return;
        } catch {
          localStorage.clear();
        }
      }
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0D1527] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#A3E635]" />
    </div>
  );
}

