'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Image from 'next/image';
import { authService } from '@/services/auth.service';
import { validateFields, CommonRules } from '@/utils/validation';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const rules: Record<string, any> = isLogin
      ? {
          email: CommonRules.email,
          password: { required: true, minLength: 1 },
        }
      : {
          name: CommonRules.name,
          email: CommonRules.email,
          password: CommonRules.password,
        };

    const validation = validateFields(
      { name, email, password },
      rules as any
    );

    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      Object.entries(validation.errors).forEach(([field, messages]) => {
        errors[field] = messages[0];
      });
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Sanitize only email and name (not password - special chars are required)
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedName = name.trim();

      const res = isLogin
        ? await authService.login({ email: sanitizedEmail, password })
        : await authService.register({
            email: sanitizedEmail,
            password,
            name: sanitizedName,
          });

      if (isLogin) {
        const tokens = res.tokens;
        const user = res.user;
        if (!tokens?.accessToken) throw new Error('Login failed. Please try again.');
        localStorage.setItem('auth_token', tokens.accessToken);
        if (tokens.refreshToken) localStorage.setItem('refresh_token', tokens.refreshToken);
        onLogin({ ...user, role: user?.role?.toLowerCase() ?? 'user' });
      } else {
        // Signup successful - show success popup
        setSuccessEmail(sanitizedEmail);
        setShowSuccessPopup(true);
        setLoading(false);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        (typeof err === 'string' ? err : null) ||
        (isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Clear form and switch to login
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setFieldErrors({});
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-card">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4 sm:mb-6"
            >
              <Activity className="size-6 sm:size-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold text-foreground">SmartCare</span>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome back' : 'Create Account'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {isLogin ? 'Sign in to access your dashboard' : 'Sign up to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors({ ...fieldErrors, name: '' });
                      }
                    }}
                    placeholder="Enter your name"
                    className={`pl-10 h-10 sm:h-12 text-sm sm:text-base ${
                      fieldErrors.name ? 'border-destructive' : ''
                    }`}
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                  }}
                  placeholder="Enter your email"
                  className={`pl-10 h-10 sm:h-12 text-sm sm:text-base ${
                    fieldErrors.email ? 'border-destructive' : ''
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: '' });
                    }
                  }}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base ${
                    fieldErrors.password ? 'border-destructive' : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg text-sm flex items-start gap-3 shadow-md"
              >
                <AlertCircle className="size-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 bg-black hover:bg-black/90 text-card-foreground text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setFieldErrors({}); }}
              className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden lg:block lg:w-1/2 relative min-h-[300px] lg:min-h-0"
      >
        <Image
          src="/login.png"
          alt="Hospital Management"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 sm:p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Account Created!</h2>
              <p className="text-muted-foreground mb-2">
                Your account has been successfully created.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Email: <span className="font-semibold text-foreground">{successEmail}</span>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You can now log in with your credentials.
              </p>
              <Button
                onClick={handleSuccessPopupClose}
                className="w-full bg-black hover:bg-black/90 text-card-foreground"
              >
                Continue to Login
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
