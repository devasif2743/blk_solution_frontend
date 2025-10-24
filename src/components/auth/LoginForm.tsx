import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link, Navigate, useLocation } from "react-router-dom";
import { IMAGES } from "../../assets/IMAGES";
import toast, { Toaster } from "react-hot-toast";
import { login } from "../../api/authApi";
import { Mail, Lock, ArrowRight } from "lucide-react";

export const LoginForm = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const navigate = useNavigate();

  // Check if user already logged in
  const storedUser = JSON.parse(localStorage.getItem("user_details") || "null");
  if (storedUser) {
    if (["admin", "manager"].includes(storedUser.role)) {
      const redirectPath = storedUser.role === "admin" ? "/dashboard" : "/manager";
      return <Navigate to={from === "/dashboard" ? redirectPath : from} replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(credentials);
      if (res.data.status) {
        const user = res.data.user;

        if (["admin", "po", "tsm"].includes(user.role)) {
          localStorage.setItem("access_token", res.data.access_token);
          localStorage.setItem("user_details", JSON.stringify(user));

          const lastVisited = localStorage.getItem("lastVisited");
          const redirectPath =
            lastVisited && lastVisited !== "/login"
              ? lastVisited
              : "/dashboard";

          window.location.href = redirectPath;
        } else {
          setError("Only admin or manager accounts are allowed.");
          toast.error("Access restricted to admin/PO/TSM only");
        }
      } else {
        toast.error(res.data.message || "Login failed");
        setError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Something went wrong");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
    <div
  className="min-h-screen relative bg-center bg-cover"
  style={{ backgroundImage: `url(${IMAGES.Bg_Image || "/images/retail-bg.jpg"})` }}
>
  {/* overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />

  {/* layout: center on mobile, right on lg */}
  <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
    <div className="w-full lg:ml-auto lg:max-w-md">
      <Card className="w-full rounded-3xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.35)]">
        <CardHeader className="text-center p-6 pb-3">
          <img
            src={IMAGES.logo}
            alt="BLK Logo"
            className="mx-auto w-16 h-16 mb-2 rounded-full ring-2 ring-white/60 shadow"
          />
          <CardTitle className="text-2xl font-extrabold tracking-tight leading-tight">
            BLK BUSINESS SOLUTIONS Pvt Ltd
          </CardTitle>
          <p className="text-sm text-muted-foreground -mt-0.5">Welcome Back</p>
        </CardHeader>

        {/* thin divider */}
        <div className="px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        <CardContent className="p-6 pt-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 opacity-60" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="pl-9 h-11 rounded-xl border-black/10 focus-visible:ring-2 focus-visible:ring-cyan-500"
                />
              </div>
            </div>

            {/* password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 opacity-60" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-9 pr-10 h-11 rounded-xl border-black/10 focus-visible:ring-2 focus-visible:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold transition
                         bg-gradient-to-r from-teal-400 to-cyan-500 hover:opacity-90
                         focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* helper row */}
            <div className="flex items-center justify-center">
              <Link to="/forgot-password" className="text-sm text-cyan-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </form>

          {/* bottom subtle divider */}
          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          {/* footer note */}
          <p className="mt-4 text-xs text-center text-muted-foreground">
            By continuing you agree to our{" "}
            <span className="underline decoration-dotted underline-offset-2">Terms</span> &{" "}
            <span className="underline decoration-dotted underline-offset-2">Privacy Policy</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

    </>
  );
};
