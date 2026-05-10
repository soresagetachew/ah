import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useSessionTimeout = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // session_timeout_minutes from GET /api/auth/me (stored in user object)
  const timeoutMinutes = user?.session_timeout_minutes || 30;
  const warningThresholdMs = (timeoutMinutes * 60 * 1000) - (60 * 1000); // 60s before expiry

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setCountdown(60);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    timerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, warningThresholdMs);
  }, [warningThresholdMs]);

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    logout();
    navigate('/login');
    toast.error('Session expired due to inactivity');
  }, [logout, navigate]);

  const keepAlive = async () => {
    try {
      await client.get('/auth/ping');
      resetTimer();
    } catch (error) {
      handleLogout();
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const activities = ['mousemove', 'keydown', 'click', 'scroll'];
    const handleActivity = () => {
      // Avoid excessive resets, only reset if we aren't already in warning state
      if (!showWarning && Date.now() - lastActivityRef.current > 5000) {
        resetTimer();
      }
    };

    activities.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      activities.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimer, showWarning]);

  // Handle 401 globally
  useEffect(() => {
    const interceptor = client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );
    return () => client.interceptors.response.eject(interceptor);
  }, [handleLogout]);

  return { showWarning, countdown, keepAlive, handleLogout };
};
