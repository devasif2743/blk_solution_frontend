// src/components/auth/VerifyOtpForm.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

import {resetpassword} from '../../api/authApi';

export const VerifyOtpForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
    const verify=  await resetpassword(email, otp,password);

    console.log(verify);
    if(verify.status){
         toast({
            title: "Success",
            description: verify.message,
      });
    }else{
             toast({
            title: "Error",
            description: verify.message,
      });
    }
     
   
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "Invalid OTP.");
      toast({
        title: "OTP error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold text-primary">Verify OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} readOnly className="h-11 bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                className="h-11"
              />
            </div>


             <div className="space-y-2">
              <Label htmlFor="Password">Password</Label>
              <Input
                id="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <p className="text-sm text-center mt-2">
              Didn’t receive email?{" "}
              <Link to="/auth/forgot-password" className="text-primary hover:underline">
                Resend
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
