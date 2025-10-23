
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { IMAGES } from "../../assets/IMAGES";
import toast, { Toaster } from "react-hot-toast";
import {login} from '../../api/authApi';
import { Navigate, useLocation } from 'react-router-dom';

// import { useAuth } from "../../api/AuthContext";
export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
   const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

    const location = useLocation();
   const from = location.state?.from?.pathname || '/';
  const storedUser = JSON.parse(localStorage.getItem("user_details") || "null");
if (storedUser) {
  // Only allow admin or manager
  if (storedUser.role === 'admin' || storedUser.role === 'manager') {
    const redirectPath = storedUser.role === 'admin' ? '/dashboard' : '/manager';
    return <Navigate to={from === '/dashboard' ? redirectPath : from} replace />;
  } else {
    // For any other role, redirect to login (or show an error)
    return <Navigate to="/login" replace />;
  }
}



  const navigate = useNavigate();
  
const handleSubmit111 = async (e) => {
  e.preventDefault();
  // setError('');
  // setLoading(true);
 
  try {
    const res = await login(credentials);
    console.log("Login response:", res);

    if (res.data.status) {
      const user = res.data.user; // assuming API returns user object with role
      
      console.log("ssss",user);
      // ✅ Allow only admin or manager
      if (user.role === 'admin' || user.role === 'manager') {
        // Save token + user details
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("user_details", JSON.stringify(user));

        const redirectPath =
          user.role === 'admin' ? '/dashboard' : '/manager';

        // Redirect
        window.location.href = from === '/' ? redirectPath : from;
      } else {
        // ❌ Any other role: show error or send back to login
        setError("Only admin or manager accounts are allowed.");
      }
    } else {
      toast.error(res.data.message || "Login failed");
      setError(res.data.message || "Invalid credentials");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError(err.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await login(credentials);
    console.log("Login response:", res);

    if (res.data.status) {
      const user = res.data.user; // assuming API returns user object with role
      console.log("User:", user);

      // ✅ Allow only admin or manager
      if (user.role === "admin" || user.role === "po" || user.role === "tsm") {
        // Save token + user details
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("user_details", JSON.stringify(user));

        // ✅ Get last visited route before login (from ProtectedRoute)
        const lastVisited = localStorage.getItem("lastVisited");

        // ✅ Choose redirect path:
        // 1. Go back to last visited page (if exists and not /login)
        // 2. Else go to /dashboard or /manager depending on role
        const redirectPath =
          lastVisited && lastVisited !== "/login"
            ? lastVisited
            : user.role === "admin"
            ? "/dashboard"
            : "/dashboard";

        // ✅ Redirect to appropriate page
        window.location.href = redirectPath;
      } else {
        // ❌ Any other role: show error
        setError("Only admin or manager accounts are allowed.");
        toast.error("Access restricted to admin/po/TSM only");
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
        className="min-h-screen flex items-center justify-end bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${IMAGES.Bg_Image || "/images/retail-bg.jpg"})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-lg h-screen flex items-center p-6">
          <Card className="w-full h-[700px] shadow-2xl backdrop-blur-md bg-white/90 flex flex-col justify-center">
            <CardHeader className="text-center space-y-6">
              <img src={IMAGES.logo} alt="Retail Logo" className="mx-auto w-20 h-20" style={{ borderRadius: "50%" }} />
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">BLK BUSINESS SOLUTIONS Pvt Ltd</CardTitle>
                <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email"
                   value={credentials.username}
                     onChange={(e) => setCredentials({...credentials, username: e.target.value})} />
                    {/* onChange={(e) => setEmail(e.target.value)} required className="h-11" />  */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                     value={credentials.password} 
                       onChange={(e) => setCredentials({...credentials, password: e.target.value})} />
                     {/* onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" /> */}
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="default" className="w-full h-11" disabled={isLoadingLocal}>
                  {isLoadingLocal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ color: "black" }} />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <p className="text-sm text-center mt-2">
                <Link to="/forgot-password" className="text-primary hover:underline">Forgot Password</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};



