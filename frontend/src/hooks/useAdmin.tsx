import { useAuth } from '@/hooks/useAuth';

const ADMIN_EMAILS = ['admin@almuadhin.com'];

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);
  return { isAdmin, loading: authLoading };
}
