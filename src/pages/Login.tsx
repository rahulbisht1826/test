import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePOS } from "@/context/POSContext";

const Login = () => {
    const { settings } = usePOS();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [recoveryAnswer, setRecoveryAnswer] = useState("");

    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === (settings.adminUsername || "admin") && password === (settings.adminPassword || "admin")) {
            localStorage.setItem("isAuthenticated", "true");
            toast({
                title: "Login Successful",
                description: "Welcome back!",
            });
            navigate("/");
        } else {
            toast({
                title: "Login Failed",
                description: "Invalid credentials",
                variant: "destructive",
            });
        }
    };

    const handleRecovery = (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings.securityAnswer) {
            toast({ title: "Setup Required", description: "Security question not set. Contact support (manual reset required).", variant: "destructive" });
            return;
        }

        if (recoveryAnswer.toLowerCase() === settings.securityAnswer.toLowerCase()) {
            toast({
                title: "Verified",
                description: `Your password is: ${settings.adminPassword || "admin"}`,
                duration: 10000
            });
            setIsForgotPassword(false);
        } else {
            toast({ title: "Incorrect Answer", description: "Please try again.", variant: "destructive" });
        }
    };

    if (isForgotPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col animate-fade-in">
                <Card className="w-full max-w-sm shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Recover Password</CardTitle>
                        <CardDescription className="text-center">
                            {settings.securityQuestion ? settings.securityQuestion : "No security question set."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRecovery} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Security Answer</Label>
                                <Input
                                    placeholder="Enter answer"
                                    value={recoveryAnswer}
                                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" type="submit" disabled={!settings.securityAnswer}>
                                Recover Password
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col animate-fade-in">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">POS System</h1>
                <p className="text-muted-foreground">Please sign in to continue</p>
            </div>

            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Sign In</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder="Enter username"
                                    className="pl-10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button variant="link" size="sm" type="button" onClick={() => setIsForgotPassword(true)}>
                                    Forgot Password?
                                </Button>
                            </div>
                        </div>
                        <Button className="w-full" type="submit">
                            Sign In
                        </Button>
                    </form>
                </CardContent>

            </Card>
        </div>
    );
};

export default Login;
