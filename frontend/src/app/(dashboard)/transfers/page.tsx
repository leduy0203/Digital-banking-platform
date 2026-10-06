import { Suspense } from 'react';
import Link from "next/link";
import { 
  Settings, 
  Globe, 
  Power, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRightLeft, 
  Wifi, 
  Smartphone, 
  BookUser, 
  SlidersHorizontal,
  Loader2
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CustomerTopbar } from "@/components/layout/CustomerTopbar";
import { TransferForm } from "@/components/TransferForm";

export default function TransfersPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0D1527] text-slate-100 flex font-sans selection:bg-[#A3E635] selection:text-slate-950">
      {/* Fixed Sticky Sidebar Navigation */}
      <Sidebar />

      {/* Main Viewport Column (Fixed Header + Scrollable Body) */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Dynamic Connected Topbar */}
        <CustomerTopbar />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 p-8 space-y-6 overflow-y-auto">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span>Chuyển tiền</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold">Chuyển tiền trong nước</span>
          </div>

          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Chuyển tiền trong nước</h1>
            <p className="text-xs text-slate-400 mt-1">Chuyển tiền nhanh Napas 24/7 tức thì trong & ngoài hệ thống</p>
          </div>

          {/* 2-Column Content Layout: Transfer Form (Left) + Quick Services Rail (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start pb-12">
            {/* Left 3 Columns: Main Transfer Form */}
            <div className="lg:col-span-3">
              <Suspense fallback={
                <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A3E635] mx-auto" />
                </div>
              }>
                <TransferForm />
              </Suspense>
            </div>

            {/* Right 1 Column: Floating Quick Services Rail */}
            <div className="space-y-4 hidden lg:block sticky top-6">
              <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Lối tắt dịch vụ</h4>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                </div>

                <div className="space-y-3">
                  <Link 
                    href="/transfers"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A253D] border border-[#A3E635]/40 text-white hover:border-[#A3E635] transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 flex items-center justify-center text-[#A3E635]">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs group-hover:text-[#A3E635] transition-colors">Chuyển tiền trong nước</div>
                      <div className="text-[10px] text-slate-400">Napas 24/7 tức thì</div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A253D]/60 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Nạp Data 4G/5G</div>
                      <div className="text-[10px] text-slate-400">Ưu đãi đến 20%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A253D]/60 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Nạp tiền điện thoại</div>
                      <div className="text-[10px] text-slate-400">Chiết khấu tức thì</div>
                    </div>
                  </div>

                  <Link 
                    href="/beneficiaries"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#1A253D]/60 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                      <BookUser className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs group-hover:text-[#A3E635] transition-colors">Danh bạ thụ hưởng</div>
                      <div className="text-[10px] text-slate-400">Quản lý người nhận</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
