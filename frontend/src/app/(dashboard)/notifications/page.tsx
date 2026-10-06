'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { CustomerTopbar } from '@/components/layout/CustomerTopbar';
import { notificationApi, NotificationItem } from '@/lib/api/notificationApi';
import {
  Bell,
  CheckCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Server,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  LockKeyhole,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = () => {
    notificationApi.getMyNotifications(0, 50)
      .then((res) => {
        if (res?.success && res.data?.content) {
          setNotifications(res.data.content);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch notifications:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = () => {
      fetchNotifications();
    };

    window.addEventListener('notification-received', handleNewNotification);
    return () => {
      window.removeEventListener('notification-received', handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    notificationApi.markAsRead(id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        window.dispatchEvent(new CustomEvent('notification-received'));
      })
      .catch((err) => {
        console.error('Failed to mark as read:', err);
      });
  };

  const handleMarkAllAsRead = () => {
    notificationApi.markAllAsRead()
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success('Đã đánh dấu tất cả thông báo là đã đọc.');
        window.dispatchEvent(new CustomEvent('notification-received'));
      })
      .catch((err) => {
        toast.error('Không thể đánh dấu đọc tất cả.');
      });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'ALL') return true;
    return n.notificationType === activeCategory;
  });

  const getCategoryBadge = (type: string) => {
    if (type === 'TRANSACTION') {
      return (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'SECURITY') {
      return (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'ACCOUNT') {
      return (
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <LockKeyhole className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
        <Server className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0D1527] text-slate-100 flex font-sans selection:bg-[#A3E635] selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <CustomerTopbar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 relative shadow-md">
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    Trung tâm Thông báo
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Biến động số dư tức thì, thông báo bảo mật và thông tin tài khoản của bạn.
                  </p>
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#141C2E] border border-slate-700 hover:border-[#A3E635] text-slate-200 hover:text-[#A3E635] font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4 text-[#A3E635]" />
                  <span>Đọc Tất Cả ({unreadCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
            {[
              { key: 'ALL', label: 'Tất cả thông báo' },
              { key: 'TRANSACTION', label: 'Biến động số dư' },
              { key: 'SECURITY', label: 'Bảo mật' },
              { key: 'ACCOUNT', label: 'Tài khoản & eKYC' },
              { key: 'SYSTEM', label: 'Hệ thống' },
            ].map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#A3E635] text-slate-950 shadow-md shadow-[#A3E635]/20'
                      : 'bg-[#141C2E] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="space-y-3 pb-12">
            {isLoading ? (
              <div className="p-16 text-center bg-[#141C2E]/60 border border-slate-800 rounded-3xl space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#A3E635] mx-auto" />
                <div className="text-slate-400 text-xs font-mono">Đang tải thông báo...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-16 text-center bg-[#141C2E]/40 border border-slate-800/80 rounded-3xl space-y-3">
                <Bell className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="text-slate-400 text-sm font-medium">Không có thông báo nào trong danh mục này.</div>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.read && handleMarkAsRead(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 shadow-md ${
                    item.read
                      ? 'bg-[#121A2D]/40 border-slate-800/60 text-slate-400 hover:bg-[#141C2E]'
                      : 'bg-[#141C2E] border-emerald-500/40 text-white shadow-emerald-500/5 hover:border-emerald-500/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Category Badge Icon */}
                    {getCategoryBadge(item.notificationType)}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{item.title}</span>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-[#A3E635] inline-block shadow-sm shadow-[#A3E635]" />
                          )}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">{item.message}</p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </span>
                        {item.referenceId && (
                          <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-400">
                            Mã GD: {item.referenceId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.read ? (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5 text-slate-500" /> Đã đọc
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#A3E635] bg-[#A3E635]/10 border border-[#A3E635]/30 rounded-lg hover:bg-[#A3E635]/20 transition-all cursor-pointer"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
