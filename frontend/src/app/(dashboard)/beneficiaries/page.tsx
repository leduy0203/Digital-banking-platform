'use client';

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CustomerTopbar } from "@/components/layout/CustomerTopbar";
import { BeneficiaryList } from "@/components/BeneficiaryList";

export default function BeneficiariesPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0D1527] text-slate-100 flex font-sans selection:bg-[#A3E635] selection:text-slate-950">
      {/* Fixed Sticky Sidebar Navigation */}
      <Sidebar />

      {/* Main Viewport Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <CustomerTopbar />

        {/* Scrollable Main Content Area (Spacious Full Width) */}
        <main className="flex-1 px-8 md:px-12 py-8 space-y-6 overflow-y-auto w-full">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#A3E635] font-bold">Danh bạ thụ hưởng</span>
          </div>

          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Danh bạ người thụ hưởng</h1>
            <p className="text-xs text-slate-400 mt-1">Quản lý danh sách tài khoản thụ hưởng để thực hiện giao dịch chuyển tiền nhanh chóng</p>
          </div>

          {/* Beneficiary List Component Container */}
          <div className="pb-12">
            <BeneficiaryList />
          </div>
        </main>
      </div>
    </div>
  );
}
