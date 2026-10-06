'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowRightLeft, 
  ShieldCheck, 
  CheckCircle2, 
  BookUser, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  Wallet, 
  Building, 
  Eye, 
  EyeOff, 
  Check,
  History,
  Copy,
  AlertCircle,
  UserPlus,
  Loader2,
  Bookmark
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTransfer } from '@/hooks/useTransfer';
import { PinVerificationModal } from './PinVerificationModal';
import { 
  accountApi, 
  beneficiaryApi,
  BeneficiaryItem,
  AccountResponseData, 
  TransferInitiateResponseData, 
  TransactionResponseData 
} from '@/lib/api';
import { toast } from 'sonner';

// Supported Banks List
const BANKS_LIST = [
  { code: 'DBC', name: 'Digital Bank', desc: 'Cùng hệ thống - Miễn phí 24/7', icon: '🏛️' },
  { code: 'VCB', name: 'Vietcombank', desc: 'Ngân hàng TMCP Ngoại Thương (Napas 24/7)', icon: '🟢' },
  { code: 'TCB', name: 'Techcombank', desc: 'Ngân hàng Kỹ Thương (Napas 24/7)', icon: '🔴' },
  { code: 'MB', name: 'MBBank', desc: 'Ngân hàng Quân Đội (Napas 24/7)', icon: '🔵' },
  { code: 'BIDV', name: 'BIDV', desc: 'Ngân hàng Đầu tư và Phát triển (Napas 24/7)', icon: '🔷' },
  { code: 'CTG', name: 'VietinBank', desc: 'Ngân hàng Công Thương (Napas 24/7)', icon: '🔴' },
  { code: 'VPB', name: 'VPBank', desc: 'Ngân hàng Việt Nam Thịnh Vượng (Napas 24/7)', icon: '🟢' },
  { code: 'ACB', name: 'ACB', desc: 'Ngân hàng Á Châu (Napas 24/7)', icon: '🔵' },
];

function formatNumberWithDots(val: string | number): string {
  if (val === '' || val === null || val === undefined) return '';
  const cleanNum = val.toString().replace(/\D/g, '');
  if (!cleanNum) return '';
  return parseInt(cleanNum, 10).toLocaleString('vi-VN');
}

const transferSchema = z
  .object({
    sourceAccountNumber: z.string().min(1, 'Vui lòng chọn tài khoản nguồn'),
    bankCode: z.string().min(1, 'Vui lòng chọn ngân hàng nhận'),
    targetAccountNumber: z
      .string()
      .min(1, 'Vui lòng nhập số tài khoản thụ hưởng')
      .length(10, 'Số tài khoản thụ hưởng phải đúng 10 chữ số')
      .regex(/^\d+$/, 'Số tài khoản chỉ bao gồm chữ số'),
    formattedAmount: z.string().min(1, 'Vui lòng nhập số tiền chuyển'),
    description: z.string().max(255, 'Nội dung giao dịch tối đa 255 ký tự').optional(),
  })
  .refine((data) => data.sourceAccountNumber !== data.targetAccountNumber, {
    message: 'Tài khoản thụ hưởng không được trùng với tài khoản nguồn',
    path: ['targetAccountNumber'],
  });

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransferForm() {
  const searchParams = useSearchParams();
  const toAccountParam = searchParams.get('to');

  const { initiateTransfer, isInitiating, confirmTransfer, isConfirming } = useTransfer();
  
  // Step State: 1 = Form Input, 2 = Confirmation Review, 3 = Completed Receipt
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  const [showBalance, setShowBalance] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showBeneficiaryPicker, setShowBeneficiaryPicker] = useState(false);
  const [openBankDropdown, setOpenBankDropdown] = useState(false);
  const [openAccountDropdown, setOpenAccountDropdown] = useState(false);
  const [initiateError, setInitiateError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Beneficiary quick-save state
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<BeneficiaryItem[]>([]);
  const [isSavingBeneficiary, setIsSavingBeneficiary] = useState(false);
  const [isBeneficiarySaved, setIsBeneficiarySaved] = useState(false);

  // Transfer States
  const [initiatedData, setInitiatedData] = useState<TransferInitiateResponseData | null>(null);
  const [completedReceipt, setCompletedReceipt] = useState<TransactionResponseData | null>(null);

  // Available source accounts state
  const [userAccounts, setUserAccounts] = useState<AccountResponseData[]>([]);

  // Recipient Auto-Lookup State
  const [lookupName, setLookupName] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountNumber: '',
      bankCode: 'DBC',
      targetAccountNumber: '',
      formattedAmount: '500.000',
      description: 'Chuyen tien',
    },
  });

  useEffect(() => {
    if (toAccountParam) {
      setValue('targetAccountNumber', toAccountParam);
      setValue('bankCode', 'DBC');
    }

    beneficiaryApi.getMyBeneficiaries()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setSavedBeneficiaries(res.data);
        }
      })
      .catch(() => {});
  }, [toAccountParam, setValue]);

  const selectedSourceAccount = watch('sourceAccountNumber');
  const selectedBankCode = watch('bankCode');
  const targetAccountNumber = watch('targetAccountNumber');
  const rawFormattedAmount = watch('formattedAmount');

  // Debounce Auto-Lookup for DBC (Digital Bank)
  useEffect(() => {
    if (!targetAccountNumber || targetAccountNumber.trim().length !== 10) {
      setLookupName(null);
      setLookupError(null);
      return;
    }

    if (selectedBankCode === 'DBC') {
      setIsLookingUp(true);
      setLookupError(null);
      const timer = setTimeout(async () => {
        try {
          const res = await accountApi.lookupAccount(targetAccountNumber.trim());
          if (res?.success && res.data) {
            setLookupName(res.data.accountName);
            setLookupError(null);
          } else {
            setLookupName(null);
            setLookupError('Không tìm thấy tài khoản thụ hưởng.');
          }
        } catch (err: any) {
          setLookupName(null);
          setLookupError(err.response?.data?.detail || err.response?.data?.message || 'Tài khoản thụ hưởng không tồn tại hoặc đã bị khóa.');
        } finally {
          setIsLookingUp(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setLookupName(null);
      setLookupError(null);
    }
  }, [targetAccountNumber, selectedBankCode]);

  useEffect(() => {
    accountApi.getMyAccounts()
      .then((res) => {
        if (res?.success && res.data && res.data.length > 0) {
          setUserAccounts(res.data);
          setValue('sourceAccountNumber', res.data[0].accountNumber);
        }
      })
      .catch(() => {});
  }, [setValue]);

  const accounts = userAccounts.length > 0 
    ? userAccounts.map(a => ({
        number: a.accountNumber,
        name: a.accountType === 'CHECKING' ? 'Tài khoản thanh toán mặc định' : 'Tài khoản tiết kiệm',
        balance: a.availableBalance ?? a.balance ?? 0,
        currency: a.currency
      }))
    : [
        { number: '9333436513', name: 'Tài khoản thanh toán mặc định', balance: 0, currency: 'VND' },
      ];

  const numericAmount = parseInt((rawFormattedAmount || '').replace(/\D/g, ''), 10) || 0;
  const activeAccountObj = accounts.find((acc) => acc.number === selectedSourceAccount) || accounts[0];
  const activeBankObj = BANKS_LIST.find((b) => b.code === selectedBankCode) || BANKS_LIST[0];

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setValue('formattedAmount', '');
      return;
    }
    const formatted = formatNumberWithDots(rawVal);
    setValue('formattedAmount', formatted);
  };

  const handleQuickAmount = (addAmount: number | 'ALL') => {
    if (addAmount === 'ALL') {
      setValue('formattedAmount', formatNumberWithDots(activeAccountObj.balance));
    } else {
      const current = numericAmount;
      const total = current + addAmount;
      setValue('formattedAmount', formatNumberWithDots(total));
    }
  };

  // Step 1 -> Call POST /api/v1/transfers/internal/initiate
  const handleProceedToInitiate = async (values: TransferFormValues) => {
    if (numericAmount < 1000) return;
    setInitiateError(null);

    try {
      const res = await initiateTransfer({
        sourceAccountNumber: values.sourceAccountNumber,
        targetAccountNumber: values.targetAccountNumber,
        amount: numericAmount,
        description: values.description || 'Chuyen tien',
      });

      if (res?.success && res.data) {
        setInitiatedData(res.data);
        setCurrentStep(2);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Không thể khởi tạo giao dịch. Vui lòng kiểm tra lại số dư hoặc tài khoản nhận.';
      setInitiateError(msg);
    }
  };

  // Step 2 -> Open PIN Modal
  const handleOpenPinVerification = () => {
    setPinError(null);
    setShowPinModal(true);
  };

  // Submit Smart PIN -> Call POST /api/v1/transfers/internal/confirm
  const handleConfirmWithPin = async (pin: string) => {
    if (!initiatedData) return;
    setPinError(null);

    try {
      const res = await confirmTransfer({
        transactionCode: initiatedData.transactionCode,
        otpCode: pin,
      });

      if (res?.success && res.data) {
        setCompletedReceipt(res.data);
        setShowPinModal(false);
        setCurrentStep(3);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Mã Smart PIN không chính xác hoặc giao dịch đã hết hạn.';
      setPinError(msg);
    }
  };

  const handleCopyTxCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 3-Step Progress Indicator Bar */}
      <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-slate-300">
            Bước: <span className="text-[#A3E635] font-extrabold">{currentStep}/3</span> - {' '}
            {currentStep === 1 && 'Khởi tạo giao dịch'}
            {currentStep === 2 && 'Xác nhận thông tin & Smart PIN'}
            {currentStep === 3 && 'Biên lai giao dịch thành công'}
          </span>
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Hệ thống bảo mật 2 lớp Smart PIN
          </span>
        </div>

        <div className="h-2 w-full bg-[#1A253D] rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-[#A3E635] to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: TRANSACTION CREATION FORM */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit(handleProceedToInitiate)} className="space-y-6">
          {/* SECTION 1: TÀI KHOẢN NGUỒN */}
          <div className="bg-[#141C2E] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Tài khoản trích tiền</span>
              </h3>
              <Badge variant="outline" className="border-emerald-800 text-emerald-400 bg-emerald-950/60 text-[11px] px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Hoạt động
              </Badge>
            </div>

            {/* Source Account Selector */}
            <div className="bg-gradient-to-r from-[#1A253D] via-[#162238] to-[#1A253D] border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="space-y-1.5 relative">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Chọn tài khoản thanh toán</label>
                
                <button
                  type="button"
                  onClick={() => setOpenAccountDropdown(!openAccountDropdown)}
                  className="w-full bg-[#0D1527] border border-slate-700 hover:border-[#A3E635] focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 rounded-2xl px-5 py-3.5 text-sm text-white font-mono font-bold flex items-center justify-between transition-all duration-200 cursor-pointer text-left"
                >
                  <span className="truncate">{activeAccountObj.number} - {activeAccountObj.name}</span>
                  <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${openAccountDropdown ? 'rotate-180' : ''}`} />
                </button>

                {openAccountDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#141C2E] border border-emerald-500/40 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    {accounts.map((acc) => (
                      <button
                        key={acc.number}
                        type="button"
                        onClick={() => {
                          setValue('sourceAccountNumber', acc.number);
                          setOpenAccountDropdown(false);
                        }}
                        className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                          selectedSourceAccount === acc.number 
                            ? 'bg-[#25324D] border border-[#A3E635]/50 text-white' 
                            : 'hover:bg-[#1A253D] text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold text-sm text-white">{acc.number}</div>
                          <div className="text-xs text-slate-400">{acc.name}</div>
                        </div>
                        {selectedSourceAccount === acc.number && <Check className="w-4 h-4 text-[#A3E635]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Balance Display Row */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Số dư khả dụng:</span>
                  <button
                    type="button"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
                <div className="font-mono font-black text-xl text-[#A3E635] tracking-wide flex items-center gap-1.5">
                  <span>{showBalance ? activeAccountObj.balance.toLocaleString('vi-VN') : '••••••••'}</span>
                  <span className="text-xs text-emerald-400 font-bold">{activeAccountObj.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: THÔNG TIN NGƯỜI NHẬN */}
          <div className="bg-[#141C2E] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>Thông tin người nhận</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBeneficiaryPicker(!showBeneficiaryPicker)}
                className="text-xs text-[#A3E635] flex items-center gap-1.5 hover:underline font-semibold"
              >
                <BookUser className="w-4 h-4" />
                <span>Mẫu chuyển tiền / Danh bạ</span>
              </button>
            </div>

            {/* Quick Beneficiary Picker Popup */}
            {showBeneficiaryPicker && (
              <div className="bg-[#1A253D] border border-emerald-500/40 p-4 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-bold">Chọn từ danh bạ thụ hưởng đã lưu:</span>
                  <Link href="/beneficiaries" className="text-[11px] text-[#A3E635] hover:underline">
                    Quản lý danh bạ &rarr;
                  </Link>
                </div>
                {savedBeneficiaries.length === 0 ? (
                  <div className="text-xs text-slate-400 p-3 text-center bg-[#141C2E] rounded-xl">
                    Chưa có người thụ hưởng nào được lưu trong danh bạ.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {savedBeneficiaries.map((ben) => (
                      <button
                        key={ben.id || ben.accountNumber}
                        type="button"
                        onClick={() => {
                          setValue('targetAccountNumber', ben.accountNumber);
                          setValue('bankCode', 'DBC');
                          setShowBeneficiaryPicker(false);
                        }}
                        className="p-2.5 rounded-xl bg-[#141C2E] border border-slate-700 hover:border-[#A3E635] text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-xs text-white truncate">{ben.aliasName || ben.beneficiaryName}</div>
                        <div className="font-mono text-[11px] text-[#A3E635]">{ben.accountNumber}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {/* Bank Selector */}
              <div className="space-y-1.5 relative">
                <label className="text-xs text-slate-400 font-medium">Ngân hàng nhận</label>
                
                <button
                  type="button"
                  onClick={() => setOpenBankDropdown(!openBankDropdown)}
                  className="w-full bg-[#1A253D] border border-slate-700 hover:border-[#A3E635] focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 rounded-2xl px-5 py-3.5 text-sm text-slate-100 font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span>{activeBankObj.icon}</span>
                    <span className="font-bold text-white">{activeBankObj.name}</span>
                    <span className="text-xs text-slate-400 font-normal">({activeBankObj.desc})</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${openBankDropdown ? 'rotate-180' : ''}`} />
                </button>

                {openBankDropdown && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#141C2E] border border-emerald-500/40 rounded-2xl p-2 shadow-2xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    {BANKS_LIST.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => {
                          setValue('bankCode', b.code);
                          setOpenBankDropdown(false);
                        }}
                        className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                          selectedBankCode === b.code 
                            ? 'bg-[#25324D] border border-[#A3E635]/50 text-white' 
                            : 'hover:bg-[#1A253D] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{b.icon}</span>
                          <div>
                            <div className="font-bold text-sm text-white">{b.name}</div>
                            <div className="text-xs text-slate-400">{b.desc}</div>
                          </div>
                        </div>
                        {selectedBankCode === b.code && <Check className="w-4 h-4 text-[#A3E635]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Account Input */}
              <div className="space-y-1.5">
                {/* Saved Beneficiaries Quick Pick */}
                {savedBeneficiaries.length > 0 && (
                  <div className="space-y-1.5 pb-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Bookmark className="w-3.5 h-3.5 text-[#A3E635]" /> Danh bạ thụ hưởng đã lưu:
                      </span>
                      <Link href="/beneficiaries" className="text-emerald-400 hover:underline">
                        Quản lý ({savedBeneficiaries.length})
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {savedBeneficiaries.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setValue('targetAccountNumber', b.accountNumber);
                            setValue('bankCode', 'DBC');
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all flex items-center gap-2 cursor-pointer ${
                            targetAccountNumber === b.accountNumber
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md'
                              : 'bg-[#1A253D] border-slate-700 text-slate-300 hover:border-[#A3E635] hover:text-white'
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#A3E635] font-black text-[10px] flex items-center justify-center">
                            {b.beneficiaryName?.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-[11px] truncate max-w-[120px]">{b.aliasName || b.beneficiaryName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{b.accountNumber}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <label className="text-xs text-slate-400 font-medium">Số tài khoản thụ hưởng (10 số)</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Nhập 10 chữ số tài khoản nhận"
                    {...register('targetAccountNumber')}
                    className="bg-[#1A253D] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white font-mono rounded-2xl h-13 text-base font-bold placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm transition-all pr-10"
                  />
                  {isLookingUp && (
                    <div className="absolute right-4 top-4 text-xs text-slate-400 animate-pulse font-medium">
                      Đang tra cứu tên...
                    </div>
                  )}
                </div>

                {lookupName && (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                      <span className="text-xs text-slate-300 font-medium">Chủ tài khoản:</span>
                      <span className="text-xs font-black text-[#A3E635] tracking-wide uppercase">{lookupName}</span>
                    </div>
                    <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-[10px]">
                      Hợp lệ
                    </Badge>
                  </div>
                )}

                {lookupError && (
                  <p className="text-xs text-red-400 font-medium animate-in fade-in">{lookupError}</p>
                )}

                {errors.targetAccountNumber && !lookupError && (
                  <p className="text-xs text-red-400 font-medium">{errors.targetAccountNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: THÔNG TIN GIAO DỊCH */}
          <div className="bg-[#141C2E] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <span>Số tiền & Nội dung</span>
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-400" /> Tối thiểu 1.000 VND
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Số tiền chuyển</label>
                
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0"
                    value={rawFormattedAmount}
                    onChange={handleAmountInputChange}
                    className="bg-[#1A253D] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-[#A3E635] font-black text-2xl pl-5 pr-16 h-14 rounded-2xl font-mono tracking-wide transition-all"
                  />
                  <span className="absolute right-5 top-4 font-bold text-slate-400 text-sm">VND</span>
                </div>
                {errors.formattedAmount && (
                  <p className="text-xs text-red-400 font-medium">{errors.formattedAmount.message}</p>
                )}

                {/* Quick Amount Selector Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs text-slate-400 font-medium self-center mr-1">Chọn nhanh:</span>
                  {[
                    { label: '+500.000', val: 500000 },
                    { label: '+1.000.000', val: 1000000 },
                    { label: '+5.000.000', val: 5000000 },
                    { label: '+10.000.000', val: 10000000 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleQuickAmount(chip.val)}
                      className="bg-[#1A253D] hover:bg-[#253554] border border-slate-700 text-slate-200 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all hover:border-[#A3E635]"
                    >
                      {chip.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount('ALL')}
                    className="bg-emerald-950 border border-emerald-700 text-emerald-400 text-xs px-3.5 py-1.5 rounded-full font-bold transition-all hover:bg-emerald-900"
                  >
                    Tất cả số dư
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-slate-400 font-medium">Nội dung chuyển tiền</label>
                <Input
                  type="text"
                  placeholder="LE CONG DUY chuyen tien..."
                  {...register('description')}
                  className="bg-[#1A253D] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white rounded-2xl h-12 text-sm placeholder:text-slate-500 transition-all"
                />
                {errors.description && (
                  <p className="text-xs text-red-400 font-medium">{errors.description.message}</p>
                )}
              </div>
            </div>

            {initiateError && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-2xl flex items-center gap-2 mt-3 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{initiateError}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isInitiating}
              className="w-full mt-4 bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold text-base py-4 rounded-full shadow-lg shadow-[#A3E635]/20 transition-all h-14 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isInitiating ? 'Đang Khởi Tạo Giao Dịch...' : 'Tiếp Tục Xác Nhận'}</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: TRANSACTION REVIEW & SUMMARY */}
      {currentStep === 2 && initiatedData && (
        <div className="bg-[#141C2E] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <Badge variant="outline" className="border-emerald-800 text-emerald-400 bg-emerald-950/60 font-semibold px-3 py-1 rounded-full">
              Bước 2: Kiểm Tra & Nhập Smart PIN
            </Badge>
            <h3 className="text-2xl font-black text-white">Xác Nhận Chi Tiết Chuyển Tiền</h3>
            <p className="text-xs text-slate-400">
              Mã giao dịch tạm tính: <span className="font-mono text-[#A3E635] font-bold">{initiatedData.transactionCode}</span>
            </p>
          </div>

          <div className="bg-[#1A253D] border border-slate-700/80 rounded-2xl p-6 space-y-4 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Tài khoản nguồn:</span>
              <span className="font-mono font-bold text-white">{initiatedData.sourceAccountNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Ngân hàng nhận:</span>
              <span className="font-bold text-emerald-400">Digital Bank (Cùng hệ thống)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Tài khoản thụ hưởng:</span>
              <span className="font-mono font-bold text-[#A3E635] text-base">{initiatedData.targetAccountNumber}</span>
            </div>
            {initiatedData.targetAccountName && (
              <div className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400">Người thụ hưởng:</span>
                <span className="font-bold text-white uppercase">{initiatedData.targetAccountName}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Số tiền chuyển:</span>
              <span className="font-mono font-black text-2xl text-[#A3E635]">
                {initiatedData.amount.toLocaleString('vi-VN')} VND
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Phí giao dịch:</span>
              <span className="text-emerald-400 font-bold">
                {initiatedData.feeAmount > 0 ? `${initiatedData.feeAmount.toLocaleString('vi-VN')} VND` : 'Miễn phí'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nội dung chuyển tiền:</span>
              <span className="font-medium text-slate-200">{initiatedData.description || 'Chuyển tiền'}</span>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1 border-slate-700 bg-[#1A253D] hover:bg-[#253554] text-slate-200 font-bold h-12 rounded-full"
            >
              Quay Lại
            </Button>
            <Button
              type="button"
              onClick={handleOpenPinVerification}
              className="flex-1 bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold h-12 rounded-full shadow-lg shadow-[#A3E635]/20 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Nhập Smart PIN để Chuyển</span>
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: DIGITAL TRANSACTION RECEIPT */}
      {currentStep === 3 && completedReceipt && (
        <Card className="bg-[#141C2E] border-emerald-500/50 text-center p-8 shadow-2xl rounded-3xl w-full text-slate-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-[#A3E635] shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 animate-in zoom-in-50 duration-300" />
            </div>
            <h3 className="text-2xl font-black text-white">Chuyển Tiền Thành Công!</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Mã giao dịch:</span>
              <span className="font-mono font-bold text-[#A3E635] text-base">{completedReceipt.transactionCode}</span>
              <button 
                onClick={() => handleCopyTxCode(completedReceipt.transactionCode)}
                className="text-slate-400 hover:text-white p-1"
                title="Sao chép mã giao dịch"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              {copiedCode && <span className="text-[10px] text-[#A3E635] font-bold">Đã chép!</span>}
            </div>
          </div>

          <CardContent className="space-y-6 pt-6">
            <div className="bg-[#1A253D] p-6 rounded-2xl border border-slate-700/60 space-y-3 text-sm text-left">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tiền trích:</span>
                <span className="font-mono font-black text-[#A3E635] text-2xl">
                  {completedReceipt.amount.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3">
                <span className="text-slate-400">Tài khoản nguồn:</span>
                <span className="font-mono text-white font-bold">{completedReceipt.sourceAccountNumber}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3">
                <span className="text-slate-400">Tài khoản thụ hưởng:</span>
                <span className="font-mono text-white font-bold">{completedReceipt.targetAccountNumber}</span>
              </div>
              {completedReceipt.targetAccountName && (
                <div className="flex justify-between border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Tên người nhận:</span>
                  <span className="font-bold text-emerald-400 uppercase">{completedReceipt.targetAccountName}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-3">
                <span className="text-slate-400">Nội dung chuyển tiền:</span>
                <span className="font-medium text-slate-200">{completedReceipt.description}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3">
                <span className="text-slate-400">Thời gian thực hiện:</span>
                <span className="text-slate-300 text-xs font-mono">
                  {completedReceipt.completedAt 
                    ? new Date(completedReceipt.completedAt).toLocaleString('vi-VN') 
                    : new Date(completedReceipt.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Quick Save Beneficiary Button */}
            {!isBeneficiarySaved && (
              <div className="bg-[#1A253D]/70 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="text-left">
                  <div className="font-bold text-xs text-white">Lưu người nhận này vào danh bạ?</div>
                  <div className="text-[11px] text-slate-400">Lần sau chuyển tiền chỉ cần 1 chạm mà không cần nhập lại STK.</div>
                </div>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!completedReceipt) return;
                    setIsSavingBeneficiary(true);
                    try {
                      await beneficiaryApi.createBeneficiary({
                        accountNumber: completedReceipt.targetAccountNumber,
                        beneficiaryName: completedReceipt.targetAccountName || 'NGƯỜI THỤ HƯỞNG',
                      });
                      setIsBeneficiarySaved(true);
                      toast.success('Đã lưu người thụ hưởng vào danh bạ thành công!');
                    } catch (err: any) {
                      const msg = err.response?.data?.detail || err.response?.data?.message || 'Không thể lưu người thụ hưởng';
                      toast.error(msg);
                    } finally {
                      setIsSavingBeneficiary(false);
                    }
                  }}
                  disabled={isSavingBeneficiary}
                  className="bg-[#141C2E] hover:bg-[#1E293B] border border-slate-700 hover:border-[#A3E635] text-[#A3E635] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isSavingBeneficiary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Lưu Thụ Hưởng</span>
                </Button>
              </div>
            )}

            {isBeneficiarySaved && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-[#A3E635]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Người thụ hưởng đã được lưu vào danh bạ!</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/transactions" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-700 bg-[#1A253D] hover:bg-[#253554] text-slate-200 font-bold text-sm h-12 rounded-full flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4 text-emerald-400" />
                  <span>Xem Lịch Sử Giao Dịch</span>
                </Button>
              </Link>
              <Button
                type="button"
                onClick={() => {
                  setCompletedReceipt(null);
                  setInitiatedData(null);
                  setCurrentStep(1);
                  reset();
                }}
                className="flex-1 bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-extrabold text-sm h-12 rounded-full shadow-lg shadow-[#A3E635]/20"
              >
                Thực Hiện Giao Dịch Mới
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMART PIN VERIFICATION MODAL */}
      {initiatedData && (
        <PinVerificationModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleConfirmWithPin}
          amount={initiatedData.amount}
          targetAccountName={initiatedData.targetAccountName}
          targetAccountNumber={initiatedData.targetAccountNumber}
          transactionCode={initiatedData.transactionCode}
          expiresInSeconds={initiatedData.expiresInSeconds || 300}
          isLoading={isConfirming}
          errorMessage={pinError}
        />
      )}
    </div>
  );
}
