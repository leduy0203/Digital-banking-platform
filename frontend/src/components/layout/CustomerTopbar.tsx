'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Globe, 
  Power, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  User, 
  Bell 
} from "lucide-react";
import { customerApi, CustomerProfile } from "@/lib/api/customerApi";
import { notificationApi } from "@/lib/api/notificationApi";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export function CustomerTopbar() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Initialize global STOMP WebSocket connection
  useNotificationSocket(() => {
    // When a new notification arrives via socket, increment badge count
    setUnreadCount((prev) => prev + 1);
  });

  const fetchUnreadCount = () => {
    notificationApi.getUnreadCount()
      .then((res) => {
        if (res?.success && typeof res.data === 'number') {
          setUnreadCount(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    // 1. Try to load initial profile from localStorage
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        if (u.fullName) {
          setProfile({
            id: u.userId || '',
            customerCode: u.customerCode || '',
            fullName: u.fullName,
            nationalId: '',
            dateOfBirth: '',
            address: '',
            avatarUrl: '',
            kycStatus: u.kycStatus || 'PENDING',
            createdAt: ''
          });
        }
      } catch {
        // ignore
      }
    }

    // 2. Fetch fresh profile from API
    customerApi.getMyProfile()
      .then((res) => {
        if (res?.success && res.data) {
          setProfile(res.data);
          if (cachedUser) {
            try {
              const u = JSON.parse(cachedUser);
              u.fullName = res.data.fullName;
              u.kycStatus = res.data.kycStatus;
              localStorage.setItem('user', JSON.stringify(u));
            } catch {
              // ignore
            }
          }
        }
      })
      .catch(() => {});

    // 3. Fetch initial unread notifications count
    fetchUnreadCount();

    // Listen to custom DOM events
    const handleNotificationEvent = () => {
      fetchUnreadCount();
    };
    window.addEventListener('notification-received', handleNotificationEvent);

    return () => {
      window.removeEventListener('notification-received', handleNotificationEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = profile?.fullName || "KHÁCH HÀNG";
  const initials = getInitials(profile?.fullName);

  const renderKycBadge = () => {
    if (profile?.kycStatus === 'VERIFIED') {
      return (
        <span className="text-[10px] text-[#A3E635] font-semibold flex items-center gap-0.5">
          <ShieldCheck className="w-3 h-3 text-[#A3E635]" /> Đã xác thực eKYC
        </span>
      );
    }
    if (profile?.kycStatus === 'REJECTED') {
      return (
        <span className="text-[10px] text-red-400 font-semibold flex items-center gap-0.5">
          <AlertTriangle className="w-3 h-3 text-red-400" /> eKYC bị từ chối
        </span>
      );
    }
    return (
      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
        <Clock className="w-3 h-3 text-amber-400" /> Chờ duyệt eKYC
      </span>
    );
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800/80 bg-[#0D1527]/95 backdrop-blur-md shrink-0 z-30 shadow-md">
      {/* User Profile Capsule Link to /profile */}
      <Link 
        href="/profile" 
        className="flex items-center gap-3 bg-[#141C2E] hover:bg-[#1A253D] border border-slate-800/80 hover:border-[#A3E635]/50 px-4 py-2 rounded-full transition-all group shadow-md"
        title="Xem và chỉnh sửa thông tin cá nhân"
      >
        {profile?.avatarUrl ? (
          <img 
            src={profile.avatarUrl} 
            alt="Avatar" 
            className="w-9 h-9 rounded-full object-cover border border-emerald-500/50 shadow-md group-hover:scale-105 transition-transform" 
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md group-hover:scale-105 transition-transform">
            {initials}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-extrabold text-white text-sm tracking-wide group-hover:text-[#A3E635] transition-colors">
            {displayName}
          </span>
          {renderKycBadge()}
        </div>
      </Link>

      {/* Action links */}
      <div className="flex items-center gap-6 text-sm">
        {/* Notification Bell */}
        <Link 
          href="/notifications" 
          className="relative p-2 rounded-full bg-[#141C2E] hover:bg-[#1E293B] border border-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
          title="Thông báo"
        >
          <Bell className="w-4 h-4 text-[#A3E635]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <Link href="/profile" className="flex items-center gap-2 hover:text-white transition-colors text-slate-400">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Hồ sơ cá nhân</span>
        </Link>

        <Link href="/settings" className="flex items-center gap-2 hover:text-white transition-colors text-slate-400">
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Cài đặt</span>
        </Link>

        <button className="flex items-center gap-2 hover:text-white transition-colors">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Tiếng Việt</span>
        </button>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <Power className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}

