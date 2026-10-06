'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookUser, 
  Search, 
  Trash2, 
  Copy, 
  ArrowRightLeft, 
  UserPlus, 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { beneficiaryApi, BeneficiaryItem } from '@/lib/api/beneficiaryApi';
import { accountApi } from '@/lib/api/accountApi';
import { toast } from 'sonner';

export function BeneficiaryList() {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // New beneficiary form state
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [newNickName, setNewNickName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBeneficiaries = () => {
    setIsLoading(true);
    beneficiaryApi.getMyBeneficiaries()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setBeneficiaries(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch beneficiaries:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Auto lookup account name when account number is typed (length >= 6)
  useEffect(() => {
    const cleanNumber = newAccNumber.trim();
    if (cleanNumber.length >= 6) {
      setIsLookingUp(true);
      setLookupError(null);
      const timer = setTimeout(() => {
        accountApi.lookupAccount(cleanNumber)
          .then((res) => {
            if (res?.success && res.data?.accountName) {
              setNewName(res.data.accountName);
              setLookupError(null);
            } else {
              setNewName('');
              setLookupError('Không tìm thấy tài khoản trong hệ thống Digital Bank.');
            }
          })
          .catch(() => {
            setNewName('');
            setLookupError('Số tài khoản không hợp lệ hoặc không tồn tại.');
          })
          .finally(() => {
            setIsLookingUp(false);
          });
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setNewName('');
      setLookupError(null);
    }
  }, [newAccNumber]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    toast.success(`Đã sao chép số tài khoản: ${text}`);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleCreateBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccNumber.trim() || !newName.trim()) {
      toast.error('Vui lòng nhập đầy đủ số tài khoản hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await beneficiaryApi.createBeneficiary({
        accountNumber: newAccNumber.trim(),
        beneficiaryName: newName.trim(),
        aliasName: newNickName.trim() || undefined,
      });

      if (res?.success) {
        toast.success('Đã thêm người thụ hưởng vào danh bạ thành công!');
        fetchBeneficiaries();
        setShowAddModal(false);
        setNewAccNumber('');
        setNewName('');
        setNewNickName('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Không thể thêm người thụ hưởng.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBeneficiary = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi danh bạ thụ hưởng?`)) return;

    try {
      await beneficiaryApi.deleteBeneficiary(id);
      toast.success('Đã xóa người thụ hưởng khỏi danh bạ');
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Không thể xóa người thụ hưởng.';
      toast.error(msg);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.beneficiaryName?.toLowerCase().includes(q) ||
      b.accountNumber?.includes(q) ||
      (b.aliasName && b.aliasName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Search & Actions Bar */}
      <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo tên, số tài khoản hoặc tên gợi nhớ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A253D] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white rounded-2xl pl-11 h-12 text-xs transition-all"
            />
          </div>

          {/* Add Beneficiary Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold text-xs px-5 py-3 rounded-full shadow-lg shadow-[#A3E635]/20 flex items-center justify-center gap-2 h-12 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Người Thụ Hưởng Mới</span>
          </Button>
        </div>
      </div>

      {/* Beneficiaries Cards Grid */}
      {isLoading ? (
        <div className="bg-[#141C2E]/60 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#A3E635] mx-auto" />
          <div className="text-slate-400 text-xs font-mono">Đang tải danh bạ thụ hưởng...</div>
        </div>
      ) : filteredBeneficiaries.length === 0 ? (
        <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <BookUser className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="font-bold text-white text-base">Chưa có người thụ hưởng nào</h4>
          <p className="text-xs">Bấm nút "Thêm Người Thụ Hưởng Mới" để lưu thông tin tài khoản hay giao dịch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeneficiaries.map((b) => (
            <div 
              key={b.id}
              className="bg-[#141C2E] border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Avatar Initial Capsule */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                      {b.beneficiaryName?.substring(0, 2).toUpperCase() || 'TK'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-[#A3E635] transition-colors">
                        {b.beneficiaryName}
                      </h4>
                      {b.aliasName && (
                        <span className="text-[11px] text-emerald-400 font-medium">({b.aliasName})</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBeneficiary(b.id, b.beneficiaryName)}
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Xóa thụ hưởng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#1A253D] border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Số tài khoản:</span>
                    <button
                      onClick={() => copyToClipboard(b.accountNumber)}
                      className="font-mono font-bold text-white flex items-center gap-1 hover:text-[#A3E635] cursor-pointer"
                      title="Sao chép"
                    >
                      <span>{b.accountNumber}</span>
                      <Copy className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-[#A3E635] truncate max-w-[160px]">
                      Digital Bank Core (Nội bộ)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Transfer Button */}
              <Link href={`/transfers?to=${b.accountNumber}`} className="w-full">
                <Button className="w-full bg-[#1A253D] hover:bg-[#253554] border border-slate-700 hover:border-[#A3E635] text-slate-100 hover:text-white font-extrabold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>Chuyển Tiền Cho Người Này</span>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Beneficiary Modal Popover */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateBeneficiary} className="bg-[#141C2E] border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Thêm Người Thụ Hưởng Mới</span>
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Ngân hàng thụ hưởng</label>
                <div className="w-full bg-[#1A253D] border border-slate-700 text-white font-bold rounded-2xl p-3.5">
                  Digital Bank (Cùng hệ thống nội bộ)
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Số tài khoản thụ hưởng</label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    placeholder="Nhập số tài khoản (VD: 9333436513)"
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    className="bg-[#1A253D] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white font-mono font-bold rounded-2xl h-12 transition-all"
                  />
                  {isLookingUp && (
                    <div className="absolute right-3.5 top-3.5">
                      <Loader2 className="w-5 h-5 animate-spin text-[#A3E635]" />
                    </div>
                  )}
                </div>
                {lookupError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{lookupError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Tên người nhận (Tự động tra cứu)</label>
                <Input
                  type="text"
                  required
                  readOnly
                  placeholder="Tự động hiển thị tên tài khoản..."
                  value={newName}
                  className="bg-[#101726] border-slate-800 text-[#A3E635] font-bold rounded-2xl h-12 uppercase cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Tên gợi nhớ (Tùy chọn)</label>
                <Input
                  type="text"
                  placeholder="VD: Anh Nam phòng Marketing, Mẹ yêu..."
                  value={newNickName}
                  onChange={(e) => setNewNickName(e.target.value)}
                  className="bg-[#1A253D] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white rounded-2xl h-12 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 border-slate-700 bg-[#1A253D] text-slate-300 font-bold h-12 rounded-full cursor-pointer">
                Hủy Bỏ
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !newName}
                className="flex-1 bg-[#A3E635] hover:bg-[#86efac] disabled:opacity-50 text-slate-950 font-extrabold h-12 rounded-full shadow-lg shadow-[#A3E635]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Lưu Thụ Hưởng</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
