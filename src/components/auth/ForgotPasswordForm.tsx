import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import {sendOtp} from '../../api/authApi';
export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit111 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // navigate("/verify-otp", { state: { email } });
      const res=await sendOtp({ email })
      console.log(res);
     
      if(res.status){

          navigate("/verify-otp", { state: { email } });

         toast({
         
           title: "Reset link sent",
           description:res.message ,
        });

         
      
      }else{
         toast({
           title: 'Error',
           description:res.message ,
             variant: "destructive",
        });
      }
    
     
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send reset link. Try again.",
        variant: "destructive",
      });
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("handleSubmit called, email:", email);

  try {
    const res = await sendOtp({ email });
    console.log("sendOtp response:", res);

  
    const ok =
      res?.status === true ||
      res?.status === "true" ||
      res?.status === "success" ||
      res?.status === "ok" ||
      res?.status === 1 ||
      (res?.status === undefined && res?.message && res?.message.toLowerCase().includes("sent"));

    if (ok) {
      toast({
        title: "Reset link sent",
        description: res.message || "OTP sent.",
      });

     
      console.log("Navigating to verify-otp with email:", email);
      sessionStorage.setItem('reset_session_token', res.token);
      sessionStorage.setItem('reset_email', email);
     
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      return;
    }

 
    toast({
      title: "Error",
      description: res?.message || "Unknown error",
      variant: "destructive",
    });
    console.warn("OTP not sent — server returned non-ok:", res);
  } catch (err) {
    console.error("sendOtp threw:", err);
    toast({
      title: "Error",
      description: "Could not send reset link. Try again.",
      variant: "destructive",
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11">
              Send Otp
            </Button>
            <p className="text-sm text-center mt-2">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
