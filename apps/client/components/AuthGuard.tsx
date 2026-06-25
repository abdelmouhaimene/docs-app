'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      // Check if token exists in cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const publicRoutes = ['/', '/login', '/forgot-password', '/documents'];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!token && !isPublicRoute) {
        // No token and trying to access protected route
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (token && pathname === '/login') {
        // Has token and trying to access login
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [pathname, router, isMounted]);

  // Prevent hydration mismatch by rendering same content on server and client initially
  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
