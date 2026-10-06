'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ArrowRightLeft, 
  FileText, 
  CreditCard, 
  Wallet,
  QrCode,
  Bell,
  Landmark, 
  PiggyBank, 
  Receipt,
  History,
  PhoneCall,
  MapPin,
  HelpCircle,
  Search,
  Headphones
} from "lucide-react";

const MENU_ITEMS = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/transfers", label: "Chuyển tiền", icon: ArrowRightLeft },
  { href: "/cards", label: "Quản lý Thẻ", icon: Wallet },
  { href: "/accounts", label: "Tài khoản thanh toán", icon: CreditCard },
  { href: "/transactions", label: "Lịch sử giao dịch", icon: History },
  { href: "/beneficiaries", label: "Danh bạ thụ hưởng", icon: FileText },
  { href: "/notifications", label: "Trung tâm Thông báo", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0B1120] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800/80 shrink-0 z-40 selection:bg-[#A3E635] selection:text-slate-950">
      {/* Brand Header */}
      <div className="p-6 pb-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-[#A3E635] flex items-center justify-center text-slate-950 font-black shadow-md">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#A3E635] font-sans">
            Digital <span className="font-light text-slate-300">Bank</span>
          </span>
        </Link>
      </div>

      {/* Quick Feature Search (Balanced spacing between logo and Trang chủ) */}
      <div className="px-4 mt-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm chức năng"
            className="w-full bg-[#162035] text-xs text-slate-200 placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#A3E635] border border-slate-800 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Navigation Menu List */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-[#25324D] text-white shadow-sm font-semibold border-l-4 border-[#A3E635]" 
                  : "text-slate-300 hover:bg-[#162035] hover:text-white"
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? "text-[#A3E635]" : "text-emerald-400"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Prominent & Spacious Support Hotline Footer Card */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0B1120]">
        <div className="p-4 rounded-2xl bg-[#141C2E] border border-slate-800/80 shadow-xl space-y-3">
          {/* Hotline Highlight Card */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-[#1A253D] to-[#141C2E] border border-emerald-500/40 flex items-center gap-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/80 border border-emerald-500/50 flex items-center justify-center text-[#A3E635] shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hotline 24/7</span>
              <span className="font-mono font-black text-sm text-[#A3E635] tracking-wide">1900 888 999</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-[#1A253D] cursor-pointer transition-all">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>ATM / Chi nhánh</span>
            </div>
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-[#1A253D] cursor-pointer transition-all">
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span>Yêu cầu hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
