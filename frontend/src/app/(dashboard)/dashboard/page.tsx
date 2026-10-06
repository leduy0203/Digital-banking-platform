'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Globe, 
  Power, 
  ShieldCheck, 
  Copy, 
  Eye, 
  EyeOff, 
  History, 
  CreditCard, 
  Plus, 
  ArrowRightLeft, 
  Wallet, 
  Wifi, 
  Smartphone, 
  TrendingUp, 
  FileSearch, 
  SlidersHorizontal,
  Sparkles,
  Camera,
  Clock,
  AlertTriangle,
  User,
  Loader2,
  KeyRound,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CustomerTopbar } from "@/components/layout/CustomerTopbar";
import { customerApi, CustomerProfile } from "@/lib/api/customerApi";
import { accountApi, AccountResponseData } from "@/lib/api/accountApi";
import { transactionApi, TransactionSummaryData } from "@/lib/api";
import { TransactionPinModal } from "@/components/TransactionPinModal";
import { TransactionReceiptModal } from "@/components/TransactionReceiptModal";

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [accounts, setAccounts] = useState<AccountResponseData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionSummaryData[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedTxCode, setSelectedTxCode] = useState<string | null>(null);

  const fetchProfile = () => {
    customerApi.getMyProfile()
      .then((res) => {
        if (res?.success && res.data) {
          setProfile(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchAccounts = () => {
    accountApi.getMyAccounts()
      .then((res) => {
        if (res?.success && res.data) {
          setAccounts(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingAccounts(false);
      });
  };

  const fetchRecentTransactions = () => {
    transactionApi.getMyHistory({ page: 0, size: 3 })
      .then((res) => {
        if (res?.success && res.data) {
          setRecentTransactions(res.data.content || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingTx(false);
      });
  };

  useEffect(() => {
    fetchProfile();
    fetchAccounts();
    fetchRecentTransactions();

    // Listen to real-time WebSocket balance change events
    const handleBalanceChanged = () => {
      fetchAccounts();
      fetchRecentTransactions();
    };

    window.addEventListener('balance-changed', handleBalanceChanged);

    return () => {
      window.removeEventListener('balance-changed', handleBalanceChanged);
    };
  }, []);

  const copyAccountNumber = (accNumber: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Default Account calculation
  const defaultAccount = accounts.find((a) => a.isDefault || a.accountType === "CHECKING") || accounts[0];
  const defaultAccountNumber = defaultAccount?.accountNumber || "9333436513";
  const defaultBalance = defaultAccount?.availableBalance ?? defaultAccount?.balance ?? 0;
  const defaultBalanceFormatted = defaultBalance.toLocaleString("vi-VN");

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0D1527] text-slate-100 flex font-sans selection:bg-[#A3E635] selection:text-slate-950">
      {/* Fixed Sticky Sidebar Navigation */}
      <Sidebar />

      {/* Main Viewport Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Dynamic Connected Topbar */}
        <CustomerTopbar />

        {/* Scrollable Main Content Body */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Smart PIN Reminder Banner if NOT set yet */}
          {profile && !profile.hasTransactionPin && (
            <div className="bg-gradient-to-r from-amber-950/80 via-[#1A253D] to-amber-950/80 border border-amber-500/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Chưa thiết lập Smart PIN giao dịch</span>
                    <span className="text-[10px] font-bold bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700 uppercase">
                      Bảo mật cấp 2
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Để thực hiện chuyển tiền an toàn, bạn cần tạo mã Smart PIN 6 chữ số.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPinModal(true)}
                className="bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-[#A3E635]/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Thiết lập Smart PIN ngay</span>
              </button>
            </div>
          )}

          {/* Hero Premium Dark Gradient Card */}
          <div className="bg-gradient-to-br from-[#1A253D] via-[#141C2E] to-[#0D1527] border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            {/* Ambient Background Circles */}
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Profile Overview Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 z-10 relative">
              <Link href="/profile" className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-[#A3E635] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg border-2 border-emerald-400 group-hover:scale-105 transition-transform">
                  {profile?.fullName ? profile.fullName.charAt(0) : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-2xl text-white tracking-wide group-hover:text-[#A3E635] transition-colors">
                      {profile?.fullName || "KHÁCH HÀNG DIGITAL BANK"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>
                      Mã KH: <span className="font-mono font-bold text-slate-200">{profile?.customerCode || "CUS-888999"}</span>
                    </span>
                    <span>•</span>
                    {profile?.kycStatus === "VERIFIED" ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> eKYC Đã xác thực &gt;
                      </span>
                    ) : profile?.kycStatus === "REJECTED" ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> eKYC Bị từ chối &gt;
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> eKYC Chờ xét duyệt &gt;
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <Link 
                href="/profile"
                className="bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-md"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Xem hồ sơ chi tiết</span>
              </Link>
            </div>

            {/* Favorite Actions Section */}
            <div className="z-10 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base text-white tracking-wide">Chức năng ưa thích</h3>
                <button className="text-xs text-[#A3E635] flex items-center gap-1.5 hover:underline font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Tùy chỉnh</span>
                </button>
              </div>

              {/* 6 Quick Action Buttons */}
              <div className="grid grid-cols-6 gap-4 text-center">
                <Link href="/transfers" className="group flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-full bg-[#162238]/90 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-[#A3E635] group-hover:text-[#A3E635] transition-all shadow-lg">
                    <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium max-w-[100px] leading-tight">
                    Chuyển tiền trong nước
                  </span>
                </Link>

                <div className="group flex flex-col items-center gap-2.5 cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-[#162238]/90 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-[#A3E635] group-hover:text-[#A3E635] transition-all shadow-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium max-w-[100px] leading-tight">
                    Nạp tiền ví điện tử
                  </span>
                </div>

                <div className="group flex flex-col items-center gap-2.5 cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-[#162238]/90 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-[#A3E635] group-hover:text-[#A3E635] transition-all shadow-lg">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium max-w-[100px] leading-tight">
                    Nạp Data 4G/5G
                  </span>
                </div>

                <div className="group flex flex-col items-center gap-2.5 cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-[#162238]/90 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-[#A3E635] group-hover:text-[#A3E635] transition-all shadow-lg">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium max-w-[100px] leading-tight">
                    Nạp tiền điện thoại
                  </span>
                </div>

                <div className="group flex flex-col items-center gap-2.5 cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-[#162238]/90 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-[#A3E635] group-hover:text-[#A3E635] transition-all shadow-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium max-w-[100px] leading-tight">
                    Mở tài khoản chứng khoán
                  </span>
                </div>

                <div className="group flex flex-col items-center gap-2.5 cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-[#162238]/90 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:border-[#A3E635] group-hover:text-[#A3E635] transition-all shadow-lg">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-medium max-w-[100px] leading-tight">
                    Tra soát trực tuyến
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Main Bottom Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
            {/* Card 1: Payment Account */}
            <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <h4 className="font-bold text-base text-white mb-4">Tài khoản thanh toán</h4>

                <div className="bg-[#1A253D] border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                  <span className="text-[10px] font-semibold tracking-wide bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded-full uppercase">
                    Tài khoản mặc định
                  </span>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Số tài khoản</span>
                      <button 
                        onClick={() => copyAccountNumber(defaultAccountNumber)}
                        className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        <span className="font-mono font-bold text-white text-sm">{defaultAccountNumber}</span>
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                        {copied && <span className="text-[10px] text-[#A3E635] font-bold">Đã chép!</span>}
                      </button>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
                      <span>Số dư khả dụng</span>
                      <div className="flex items-center gap-2">
                        {isLoadingAccounts ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#A3E635]" />
                        ) : (
                          <span className="font-mono font-bold text-[#A3E635] text-base">
                            {showBalance ? `${defaultBalanceFormatted} VND` : "•••••••• VND"}
                          </span>
                        )}
                        <button 
                          onClick={() => setShowBalance(!showBalance)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                    <Link href="/transactions" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                      <History className="w-3.5 h-3.5" />
                      <span>Lịch sử giao dịch</span>
                    </Link>
                    <Link href="/accounts" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tài khoản & Thẻ</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Neon Lime Action Button */}
              <Link href="/transfers" className="w-full mt-6 block">
                <button className="w-full bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#A3E635]/20 transition-all cursor-pointer">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Chuyển tiền ngay</span>
                </button>
              </Link>
            </div>

            {/* Card 2: Recent Transactions Activity */}
            <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-base text-white">Giao dịch gần đây</h4>
                  <Link href="/transactions" className="text-xs text-[#A3E635] hover:underline font-semibold flex items-center gap-0.5">
                    <span>Tất cả</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {isLoadingTx && (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-[#A3E635]" />
                    <span className="text-[11px]">Đang tải...</span>
                  </div>
                )}

                {!isLoadingTx && recentTransactions.length === 0 && (
                  <div className="py-8 text-center space-y-2">
                    <History className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Chưa có giao dịch gần đây</p>
                  </div>
                )}

                {!isLoadingTx && recentTransactions.length > 0 && (
                  <div className="space-y-2.5">
                    {recentTransactions.map((tx) => {
                      const isIncome = tx.direction === 'IN';
                      return (
                        <div
                          key={tx.id || tx.transactionCode}
                          onClick={() => setSelectedTxCode(tx.transactionCode)}
                          className="bg-[#1A253D] hover:bg-[#25324D] border border-slate-700/50 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                              isIncome ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-300'
                            }`}>
                              {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate group-hover:text-[#A3E635] transition-colors">
                                {tx.counterpartName || tx.counterpartAccountNumber || (isIncome ? 'Nhận tiền' : 'Chuyển tiền')}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {tx.transactionCode}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`font-mono font-bold text-xs ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
                              {isIncome ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link href="/transactions" className="w-full mt-4 block">
                <button className="w-full border border-slate-700 bg-[#1A253D] hover:bg-[#253554] text-slate-200 font-bold text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all">
                  <History className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tra cứu lịch sử chi tiết</span>
                </button>
              </Link>
            </div>

            {/* Card 3: Digital Loyalty Rewards */}
            <div className="bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-900 border border-fuchsia-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 text-4xl">💰</div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-extrabold text-xl">Digital Loyalty</h4>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <p className="text-xs text-fuchsia-100 leading-relaxed font-medium">
                  Tích điểm thưởng đổi quà không giới hạn cho mọi giao dịch chuyển tiền.
                </p>
              </div>

              <Link href="/transfers" className="w-full mt-6 block">
                <button className="w-full bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#A3E635]/20 transition-all cursor-pointer">
                  <span>Trải nghiệm ngay</span>
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Transaction PIN Setup Modal */}
      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        mode="SETUP"
        onSuccess={() => {
          fetchProfile();
        }}
      />

      {/* Transaction Receipt Popover Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedTxCode}
        onClose={() => setSelectedTxCode(null)}
        transactionCode={selectedTxCode}
      />
    </div>
  );
}
