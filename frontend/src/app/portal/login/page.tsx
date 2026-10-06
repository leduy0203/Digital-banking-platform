'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  LockKeyhole,
  Loader2,
  AlertCircle,
  Mail,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api';

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.roles?.includes('ROLE_ADMIN')) {
            router.replace('/admin/dashboard');
          } else if (user.roles?.includes('ROLE_TELLER')) {
            router.replace('/employee/dashboard');
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
      setErrorMessage('Vui lòng nhập đầy đủ tài khoản công vụ và mật khẩu.');
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

        // Check if user has staff/admin permissions
        const isStaff = user.roles?.includes('ROLE_TELLER') || user.roles?.includes('ROLE_ADMIN');
        if (!isStaff) {
          setErrorMessage('Tài khoản của bạn không có quyền truy cập hệ thống nội bộ.');
          setIsLoading(false);
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Role-based redirection
        if (user.roles?.includes('ROLE_ADMIN')) {
          router.push('/admin/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
      } else {
        setErrorMessage(res?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      const errorText =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#090D16] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* LEFT SHOWCASE PANEL (Enterprise Internal Portal) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#151E33] p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
        {/* Ambient Lights */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
              Core<span className="font-light text-slate-400">Portal</span>
            </span>
            <span className="block text-[10px] text-indigo-400 font-mono font-semibold tracking-wider uppercase">
              Hệ Thống Quản Trị & Vận Hành Ngân Hàng
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="z-10 my-auto space-y-6 max-w-lg">
          <div className="space-y-3">
            <Badge variant="outline" className="border-indigo-800 text-indigo-400 bg-indigo-950/60 text-xs px-3.5 py-1 rounded-full">
              <Fingerprint className="w-3.5 h-3.5 mr-1.5" /> Back-Office Internal Gateway
            </Badge>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Cổng Quản Trị Vận Hành & Thẩm Định Nghiệp Vụ
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hệ thống xử lý giao dịch tại quầy, thẩm định hồ sơ eKYC, quản trị luồng tiền và giám sát an toàn thông tin theo thời gian thực.
            </p>
          </div>

          {/* Security Notice Card */}
          <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Quy định bảo mật nội bộ</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mọi hành vi truy cập và thao tác trên hệ thống đều được ghi lại trong nhật ký hệ thống (Audit Logs) kèm địa chỉ IP và định danh nhân viên. Tuyệt đối không chia sẻ thông tin đăng nhập.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Mã hóa TLS 1.3 / IP Guard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>RBAC Permission Control</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-slate-500 font-mono">
          © 2026 Digital Bank Enterprise Platform. Internal Access Only.
        </div>
      </div>

      {/* RIGHT LOGIN FORM PANEL */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 md:p-14 flex flex-col justify-between items-center overflow-y-auto">
        <div className="w-full max-w-md my-auto space-y-6">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Core<span className="text-indigo-400">Portal</span>
              </span>
            </div>
          </div>

          {/* Title Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-white tracking-tight">Đăng Nhập Cán Bộ & Quản Trị</h2>
            <p className="text-xs text-slate-400">Vui lòng sử dụng tài khoản email công vụ (@bank.com) được cấp.</p>
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
            {/* Input 1: Email / Username */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Tài khoản Email công vụ</label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  placeholder="admin@bank.com hoặc teller@bank.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#111827] border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white font-medium rounded-xl h-12 text-xs pl-10 placeholder:text-slate-500 transition-all font-mono"
                />
                <Mail className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold">Mật khẩu xác thực</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu nội bộ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#111827] border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white font-mono rounded-xl h-12 text-xs pl-10 pr-10 placeholder:text-slate-500 transition-all"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-4 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-all h-12 flex items-center justify-center gap-2 cursor-pointer mt-4 bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Kiểm Tra Quyền Hạn...</span>
                </>
              ) : (
                <>
                  <LockKeyhole className="w-4 h-4" />
                  <span>Đăng Nhập Cổng Nội Bộ</span>
                </>
              )}
            </Button>
          </form>

          {/* Warning Footer */}
          <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-800/80 leading-relaxed">
            Hệ thống được bảo vệ nghiêm ngặt. Chỉ nhân viên được ủy quyền mới có quyền truy cập. Cần hỗ trợ cấp quyền xin liên hệ bộ phận IT Helpdesk.
          </div>
        </div>
      </div>
    </div>
  );
}
