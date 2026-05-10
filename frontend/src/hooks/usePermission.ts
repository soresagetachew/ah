import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export const usePermission = (permission: string): boolean => {
  const { user, isAuthenticated } = useAuthStore();
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAllowed(false);
      return;
    }

    // System Admin bypass
    if (user.role === 'System Admin') {
      setAllowed(true);
      return;
    }

    const check = async () => {
      try {
        // We can either fetch ALL permissions once or check specific ones
        // For efficiency, checking all once per session/period is better
        // but for "real enforcement" we might poll or check on mount
        const res = await client.get('/settings/roles/permissions');
        const rolePerms = res.data[user.role] || {};
        setAllowed(!!rolePerms[permission]);
      } catch (error) {
        setAllowed(false);
      }
    };

    check();
  }, [permission, user?.role, isAuthenticated]);

  return allowed;
};
