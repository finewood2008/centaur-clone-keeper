/**
 * Auth - 登录 / 注册页
 * Premium Dark Glassmorphism, 与全局风格保持一致
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

type Mode = "signin" | "signup";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 已登录则直接跳转
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("请输入邮箱和密码");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("登录成功");
        navigate("/", { replace: true });
      } else {
        await signUp(email, password, fullName || undefined);
        toast.success("注册成功，正在登录…");
        // 自动登录（若已开启 auto-confirm 或 email 已验证）
        try {
          await signIn(email, password);
          navigate("/", { replace: true });
        } catch {
          toast.info("请前往邮箱完成验证后再登录");
          setMode("signin");
        }
      }
    } catch (err: any) {
      const msg = err?.message || "操作失败";
      if (msg.toLowerCase().includes("invalid login")) {
        toast.error("邮箱或密码错误");
      } else if (msg.toLowerCase().includes("already registered")) {
        toast.error("该邮箱已注册，请直接登录");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-brand-orange/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="relative w-full max-w-[420px]"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="absolute inset-0 brand-glow opacity-80" />
            <img src={logoImg} alt="半人马AI" className="relative w-14 h-14 object-contain" />
          </div>
          <h1 className="font-display font-semibold text-xl text-foreground">半人马AI（DEMO）</h1>
          <p className="text-xs text-muted-foreground mt-1">外贸 OPC 超级工作台</p>
        </div>

        {/* Card */}
        <div className="glass-panel-strong rounded-2xl p-6 border border-white/[0.06] shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] mb-5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-primary/15 text-primary"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {m === "signin" ? "登录账户" : "注册新账户"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === "signin" ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signin" ? 8 : -8 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              {mode === "signup" && (
                <Field
                  icon={<UserIcon className="w-3.5 h-3.5" />}
                  type="text"
                  placeholder="姓名（可选）"
                  value={fullName}
                  onChange={setFullName}
                  autoComplete="name"
                />
              )}
              <Field
                icon={<Mail className="w-3.5 h-3.5" />}
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
              />
              <Field
                icon={<Lock className="w-3.5 h-3.5" />}
                type="password"
                placeholder={mode === "signup" ? "密码（至少 6 位）" : "密码"}
                value={password}
                onChange={setPassword}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity glow-primary"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "登录" : "创建账户"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-5 pt-4 border-t border-white/[0.06] text-[11px] text-white/40 text-center">
            演示账户：<span className="font-mono text-white/60">demo@centaur.ai</span> /{" "}
            <span className="font-mono text-white/60">demo123456</span>
          </div>
        </div>

        <p className="text-[10px] text-white/30 text-center mt-4">
          继续即表示同意《服务条款》和《隐私政策》
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-9 pr-3 text-sm text-foreground placeholder:text-white/30 outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-colors"
      />
    </div>
  );
}
