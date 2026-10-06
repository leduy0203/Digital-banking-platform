'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Landmark,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CreditCard,
  CheckCircle2,
  LockKeyhole,
  Loader2,
  AlertCircle,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          const isProfileCompleted = Boolean(
            user.isProfileCompleted ?? (user as any).profileCompleted
          );

          if (!isProfileCompleted && user.roles?.includes('ROLE_CUSTOMER')) {
            router.replace('/register?step=3');
          } else if (user.roles?.includes('ROLE_ADMIN')) {
            router.replace('/admin/dashboard');
          } else if (user.roles?.includes('ROLE_TELLER')) {
            router.replace('/employee/dashboard');
          } else {
            router.replace('/dashboard');
          }
        } catch {
          localStorage.clear();
        }
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.login({
        username: username.trim(),
        password: password,
      });

      if (res && res.success && res.data) {
        const { accessToken, refreshToken, user } = res.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }

        const isProfileCompleted = Boolean(
          user.isProfileCompleted ?? (user as any).profileCompleted
        );

        // Check if customer has completed eKYC onboarding
        if (!isProfileCompleted && user.roles?.includes('ROLE_CUSTOMER')) {
          router.push('/register?step=3');
        } else {
          // Check user role for proper dashboard redirection
          if (user.roles?.includes('ROLE_ADMIN')) {
            router.push('/admin/dashboard');
          } else if (user.roles?.includes('ROLE_TELLER')) {
            router.push('/employee/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setErrorMessage(res?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      const errorText = err.response?.data?.detail || err.response?.data?.message || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-screen bg-[#0D1527] text-slate-100 flex font-sans selection:bg-[#A3E635] selection:text-slate-950 overflow-hidden">
      {/* LEFT HERO PANEL (Visual Showcase) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B1120] via-[#141C2E] to-[#162238] p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
        {/* Background Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#A3E635] flex items-center justify-center text-slate-950 font-black shadow-lg shadow-[#A3E635]/20">
            <Landmark className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
            Digital <span className="font-light text-slate-300">Bank</span>
          </span>
        </div>

        {/* 3D Glassmorphism Banking Card Preview Showcase */}
        <div className="z-10 my-auto space-y-6 max-w-lg">
          <div className="space-y-3">
            <Badge variant="outline" className="border-emerald-800 text-emerald-400 bg-emerald-950/60 text-xs px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Kỷ Nguyên Ngân Hàng Số 4.0
            </Badge>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Trải nghiệm tài chính thông minh, bảo mật tuyệt đối.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Giải pháp ngân hàng trực tuyến thế hệ mới, thanh toán tức thì và quản lý tài chính cá nhân an toàn chuẩn quốc tế.
            </p>
          </div>

          {/* 3D Metallic Premium Card Floating Preview */}
          <div className="relative w-full h-52 rounded-3xl p-6 bg-gradient-to-tr from-[#0F2027] via-[#203A43] to-[#2C5364] border border-slate-600/50 shadow-2xl flex flex-col justify-between transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-base tracking-wider">Visa Platinum Signature</span>
              <CreditCard className="w-6 h-6 text-[#A3E635]" />
            </div>

            <div className="w-10 h-7 bg-gradient-to-tr from-amber-300 to-yellow-500 rounded-md border border-amber-600/60 shadow-sm my-2"></div>

            <div className="space-y-1">
              <div className="font-mono text-lg tracking-widest text-white font-bold drop-shadow-md">
                4129 •••• •••• 8899
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/80 font-mono">
                <span>NGUYEN VAN A</span>
                <span>EXP: 12/30</span>
              </div>
            </div>
          </div>

          {/* Trust Badges Row */}
          <div className="flex items-center gap-6 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mã hóa TLS/SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bảo mật 2FA OTP</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-slate-500 font-mono">
          © 2026 Digital Bank Platform. An toàn & Bảo mật.
        </div>
      </div>

      {/* RIGHT LOGIN FORM PANEL */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 md:p-14 flex flex-col justify-between items-center overflow-y-auto">
        <div className="w-full max-w-md my-auto space-y-6">
          {/* Mobile Logo View Header */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-[#A3E635] flex items-center justify-center text-slate-950 font-black">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#A3E635]">
              Digital <span className="font-light text-slate-300">Bank</span>
            </span>
          </div>

          {/* Title Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Ngân Hàng Số</h2>
            <p className="text-xs text-slate-400">Chào mừng bạn quay trở lại. Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="w-full bg-rose-950/80 border border-rose-600/60 p-4 rounded-2xl flex items-start gap-3 text-rose-200 text-xs shadow-lg animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input 1: Phone number */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Số điện thoại</label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  placeholder="09xx xxx xxx"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#141C2E] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white font-medium rounded-xl h-12 text-xs pl-10 placeholder:text-slate-500 transition-all font-mono"
                />
                <Phone className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Mật khẩu</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#141C2E] border-slate-700 focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/30 text-white font-mono rounded-xl h-12 text-xs pl-10 pr-10 placeholder:text-slate-500 transition-all"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-[#141C2E] text-[#A3E635] focus:ring-0 accent-[#A3E635]"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <Link href="/settings/change-password" className="text-xs text-[#A3E635] hover:underline font-semibold">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-all h-12 flex items-center justify-center gap-2 cursor-pointer mt-2 bg-[#A3E635] hover:bg-[#86efac] text-slate-950 shadow-[#A3E635]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <LockKeyhole className="w-4 h-4" />
                  <span>Đăng Nhập Ngân Hàng Số</span>
                </>
              )}
            </Button>
          </form>

          {/* Bottom Register Redirect Link */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            Chưa có tài khoản ngân hàng số?{' '}
            <Link href="/register" className="text-[#A3E635] font-extrabold hover:underline">
              Mở tài khoản số chọn eKYC ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

