import { useState, useEffect, useRef } from "react";
import { Hotel, Bell, Printer, CreditCard, Shield, LayoutDashboard, Clock, Type, PaintBucket, Trash2, Network, Copy, Check, Users, Unplug, Server, Power, PowerOff, Lock, MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePOS } from "@/context/POSContext";
import { StaffManagement } from "@/components/staff/StaffManagement";
import { AVAILABLE_FONTS } from "@/components/common/FontManager";
import { toast } from "@/hooks/use-toast";
import { compressImage } from "@/utils/imageUtils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const {
    staff, tables, addStaff, assignStaffToTable, clockSettings, setClockSettings, settings, setSettings,
    hostSession, joinSession, leaveSession, disconnectPeers, peerId, isHost, connections, isConnected, sendMessage, transferData
  } = usePOS();

  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection State
  const [targetPeerId, setTargetPeerId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Multi-select disconnect
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    setSettings(formData);
    toast({
      title: "Settings Saved",
      description: "Company branding settings have been updated.",
    });
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedImage = await compressImage(file);
      setFormData(prev => ({ ...prev, logo: compressedImage }));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleHostSession = async () => {
    setIsConnecting(true);
    try {
      await hostSession();
      toast({ title: "Server Started", description: "This device is now hosting the session." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to start server", variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStopServer = () => {
    leaveSession();
    toast({ title: "Server Stopped", description: "Session ended. All peers disconnected." });
  };

  const handleJoinSession = async () => {
    if (!targetPeerId.trim()) {
      toast({ title: "Input Required", description: "Please enter a Server ID", variant: "destructive" });
      return;
    }

    setIsConnecting(true);
    try {
      console.log("Attempting to join:", targetPeerId);
      await joinSession(targetPeerId);
    } catch (err) {
      console.error("Join error:", err);
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to join session. Please check the ID.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveSession = () => {
    leaveSession();
    setTargetPeerId("");
  };

  const handleDisconnectSelected = () => {
    disconnectPeers(selectedPeers);
    setSelectedPeers([]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(peerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "ID copied to clipboard" });
  };

  const togglePeerSelection = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPeers(prev => [...prev, id]);
    } else {
      setSelectedPeers(prev => prev.filter(p => p !== id));
    }
  };

  const [messageText, setMessageText] = useState("");
  // sendMessage is already destructured at top level

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessage(selectedPeers, messageText);
    setMessageText("");
  };

  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem("settings_unlocked") !== "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUnlock = () => {
    // Default password check if not set in settings (shouldn't happen with my Context fix, but for safety)
    const currentPass = settings.password || "123";
    if (passwordInput === currentPass) {
      setIsLocked(false);
      sessionStorage.setItem("settings_unlocked", "true");
      setPasswordInput("");
    } else {
      toast({ title: "Access Denied", description: "Incorrect Password", variant: "destructive" });
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    sessionStorage.removeItem("settings_unlocked");
    toast({ title: "Locked", description: "Settings page is now locked." });
  };

  /* Lock Screen Logic including Recovery */
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");

  const handleRecovery = () => {
    if (!settings.securityAnswer) {
      toast({ title: "No Recovery Set", description: "Security question hasn't been set up yet.", variant: "destructive" });
      return;
    }
    if (recoveryAnswer.toLowerCase() === settings.securityAnswer?.toLowerCase()) {
      setShowRecovery(false);
      setRecoveryAnswer("");
      setIsLocked(false);
      sessionStorage.setItem("settings_unlocked", "true");
      toast({ title: "Access Granted", description: "Identity verified." });
    } else {
      toast({ title: "Incorrect Answer", description: "Please try again.", variant: "destructive" });
    }
  };

  /* Settings Page State */
  const [newSecurityQuestion, setNewSecurityQuestion] = useState("");
  const [newSecurityAnswer, setNewSecurityAnswer] = useState("");

  // Global Login State
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  const handleUpdateGlobalLogin = () => {
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) return;
    setSettings(prev => ({
      ...prev,
      adminUsername: newAdminUsername,
      adminPassword: newAdminPassword
    }));
    setNewAdminUsername("");
    setNewAdminPassword("");
    toast({ title: "Success", description: "Global login credentials updated. Please use new credentials next time." });
  };

  const handlePasswordChange = () => {
    if (!newPassword.trim()) return;
    setSettings(prev => ({ ...prev, password: newPassword }));
    setFormData(prev => ({ ...prev, password: newPassword }));
    setNewPassword("");
    toast({ title: "Success", description: "Password updated successfully" });
  };

  const handleUpdateSecurity = () => {
    if (!newSecurityQuestion.trim() || !newSecurityAnswer.trim()) return;
    setSettings(prev => ({ ...prev, securityQuestion: newSecurityQuestion, securityAnswer: newSecurityAnswer }));
    setNewSecurityQuestion("");
    setNewSecurityAnswer("");
    toast({ title: "Updated", description: "Security question set successfully." });
  };

  if (isLocked) {
    if (showRecovery) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)] animate-fade-in">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Account Recovery</CardTitle>
              <CardDescription className="text-center">Answer your security question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.securityQuestion ? (
                <div className="text-center font-medium mb-2">{settings.securityQuestion}</div>
              ) : (
                <div className="text-center text-red-500 mb-2">No security question set. Contact admin.</div>
              )}
              <Input
                placeholder="Your Answer"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
              />
              <Button className="w-full" onClick={handleRecovery}>Verify & Unlock</Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowRecovery(false)}>Back to Login</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] animate-fade-in">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 justify-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Settings Locked</CardTitle>
            <CardDescription className="text-center">Enter administrative password to access settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="text-center text-lg tracking-widest"
            />
            <Button className="w-full" onClick={handleUnlock}>Unlock</Button>
            <Button variant="link" className="w-full text-xs text-muted-foreground" onClick={() => setShowRecovery(true)}>
              Forgot Password?
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your POS system preferences
          </p>
        </div>
        <Button variant="outline" onClick={handleLock} className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
          <Lock className="h-4 w-4" /> Lock Settings
        </Button>
      </div>

      {/* Password & Security Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage passwords and recovery options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 items-end border-b pb-6">
            <div className="flex-1 space-y-2">
              <Label>Change Settings Lock Password</Label>
              <Input
                type="password"
                placeholder="New Lock Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={!newPassword}>Update Lock</Button>
          </div>

          <div className="space-y-4 border-b pb-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <Label className="text-base">Global Login Credentials</Label>
            </div>
            <p className="text-sm text-muted-foreground">Update the username and password used to access the application.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>New Username</Label>
                <Input
                  placeholder="New Username"
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Current: {settings.adminUsername || "admin"}</p>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleUpdateGlobalLogin} disabled={!newAdminUsername || !newAdminPassword}>Update Login Credentials</Button>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Password Recovery Setup</Label>
            <p className="text-sm text-muted-foreground">Set a security question to recover your password if forgotten.</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Security Question</Label>
                <Input
                  placeholder="e.g., What is your pet's name?"
                  value={newSecurityQuestion}
                  onChange={(e) => setNewSecurityQuestion(e.target.value)}
                />
                {settings.securityQuestion && <p className="text-xs text-green-600">Current: {settings.securityQuestion}</p>}
              </div>
              <div className="space-y-2">
                <Label>Security Answer</Label>
                <Input
                  placeholder="Your Answer"
                  value={newSecurityAnswer}
                  onChange={(e) => setNewSecurityAnswer(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleUpdateSecurity} disabled={!newSecurityQuestion || !newSecurityAnswer}>Save Security Question</Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Connection Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>Server & Devices</CardTitle>
          </div>
          <CardDescription>
            Manage Server status and connected devices.
          </CardDescription>
        </CardHeader>
        <CardContent>

          {!isConnected && !isHost ? (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded-full border">
                    <Power className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Start Server</h3>
                    <p className="text-sm text-muted-foreground">Enable server mode on this device.</p>
                  </div>
                </div>
                <Button onClick={handleHostSession} disabled={isConnecting} className="w-full bg-green-600 hover:bg-green-700">
                  {isConnecting ? "Starting..." : "Start Server"}
                </Button>
              </div>

              <div className="hidden md:block w-px h-32 bg-border" />

              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-background rounded-full border">
                    <Network className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Join Server</h3>
                    <p className="text-sm text-muted-foreground">Connect to an existing server.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Server ID"
                    value={targetPeerId}
                    onChange={(e) => setTargetPeerId(e.target.value)}
                  />
                  <Button variant="secondary" onClick={handleJoinSession} disabled={isConnecting}>
                    {isConnecting ? "Connecting..." : "Connect"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border shadow-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Status</Label>
                  <div className="flex items-center gap-2 font-medium text-lg">
                    <div className={`w-3 h-3 rounded-full ${isConnected || isHost ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                    {isHost ? "Server Running" : "Connected to Server"}
                  </div>
                </div>

                {isHost ? (
                  <div className="flex items-center gap-4">
                    <div className="space-y-1 text-right mr-4">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Devices</Label>
                      <div className="font-mono text-xl font-bold">{connections.length}</div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <PowerOff className="h-4 w-4 mr-2" /> Stop Server
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Stop Server?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disconnect all {connections.length} connected devices. Are you sure you want to stop the server?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleStopServer} className="bg-destructive hover:bg-destructive/90">
                            Stop Server
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Button variant="outline" onClick={handleLeaveSession} className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Unplug className="h-4 w-4 mr-2" /> Disconnect
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>{isHost ? "Server ID" : "Device ID"}</Label>
                <div className="flex gap-2">
                  <Input value={peerId} readOnly className="font-mono bg-muted" />
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this ID to connect devices.</p>
              </div>

              {/* Connected Devices List */}
              {connections.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Connected Devices
                    </Label>
                    {isHost && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={selectedPeers.length === 0}
                        onClick={handleDisconnectSelected}
                      >
                        Disconnect Selected ({selectedPeers.length})
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-background/50">
                    <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded transition-colors">
                      <Checkbox
                        id="select-all"
                        checked={selectedPeers.length === connections.length && connections.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedPeers(connections.map(c => c.peer));
                          else setSelectedPeers([]);
                        }}
                      />
                      <Label htmlFor="select-all" className="font-bold flex-1 cursor-pointer">Select All / Everyone</Label>
                    </div>
                    {connections.map((conn) => (
                      <div key={conn.peer} className="flex items-center space-x-2 p-2 hover:bg-muted rounded transition-colors">
                        <Checkbox
                          id={`peer-${conn.peer}`}
                          checked={selectedPeers.includes(conn.peer)}
                          onCheckedChange={(checked) => togglePeerSelection(conn.peer, checked as boolean)}
                        />
                        <label
                          htmlFor={`peer-${conn.peer}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 truncate font-mono"
                        >
                          {(conn.metadata as any)?.name ? `${(conn.metadata as any).name} (${conn.peer})` : conn.peer}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Messaging Section */}
                  <div className="pt-4 border-t space-y-3">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Send Message
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Message ${selectedPeers.length > 0 ? selectedPeers.length + " selected" : "Everyone"}`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedPeers.length > 0
                        ? `Sending to: ${selectedPeers.length} selected device(s)`
                        : "Sending to: Everyone (Broadcast)"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <StaffManagement
          staff={staff}
          tables={tables}
          onAddStaff={addStaff}
          onAssignTable={assignStaffToTable}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5 text-primary" />
              <CardTitle>Company Branding</CardTitle>
            </div>
            <CardDescription>
              Customize your hotel identity and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotelName">Restaurant Name</Label>
              <Input
                id="hotelName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameColor" className="flex items-center gap-2">
                <PaintBucket className="h-4 w-4" />
                Restaurant Name Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="nameColor"
                  type="color"
                  value={formData.nameColor || "#ef4444"}
                  className="w-12 h-10 p-1 cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, nameColor: e.target.value })}
                />
                <Input
                  value={formData.nameColor || "#ef4444"}
                  onChange={(e) => setFormData({ ...formData, nameColor: e.target.value })}
                  className="flex-1 font-mono"
                  placeholder="#ef4444"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst">GST No.</Label>
                <Input
                  id="gst"
                  value={formData.gstNo}
                  onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>

              <div className="flex flex-col gap-3">
                {formData.logo && (
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                    <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => {
                        setFormData({ ...formData, logo: "" });
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <Input
                    ref={fileInputRef}
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">OR use URL</span>
                </div>

                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo.startsWith("data:") ? "" : formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  disabled={formData.logo.startsWith("data:")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Type className="h-4 w-4" /> App Font</Label>
              <Select
                value={formData.font}
                onValueChange={(value) => setFormData({ ...formData, font: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map((font) => (
                    <SelectItem key={font.name} value={font.name} style={{ fontFamily: font.family }}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="themeColor" className="flex items-center gap-2">
                <PaintBucket className="h-4 w-4" />
                Theme Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="themeColor"
                  type="color"
                  value={formData.themeColor || "#f97316"}
                  className="w-12 h-10 p-1 cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                />
                <Input
                  value={formData.themeColor || "#f97316"}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="flex-1 font-mono"
                  placeholder="#f97316"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  '#f97316', // Orange (Default)
                  '#ea580c', // Dark Orange
                  '#ef4444', // Red
                  '#dc2626', // Dark Red
                  '#22c55e', // Green
                  '#16a34a', // Dark Green
                  '#3b82f6', // Blue
                  '#2563eb', // Dark Blue
                  '#8b5cf6', // Violet
                  '#7c3aed', // Dark Violet
                  '#ec4899', // Pink
                  '#db2777', // Dark Pink
                  '#06b6d4', // Cyan
                  '#0891b2', // Dark Cyan
                  '#eab308', // Yellow
                  '#ca8a04', // Dark Yellow
                  '#6366f1', // Indigo
                  '#4f46e5', // Dark Indigo
                  '#14b8a6', // Teal
                  '#0d9488', // Dark Teal
                  '#84cc16', // Lime
                  '#65a30d', // Dark Lime
                ].map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-transparent hover:border-border shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, themeColor: color })}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleSaveSettings}>Save Branding Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard Settings</CardTitle>
            </div>
            <CardDescription>
              Customize dashboard widgets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Enable Clock
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show clock on dashboard
                </p>
              </div>
              <Switch
                checked={clockSettings.enabled}
                onCheckedChange={(checked) => setClockSettings(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            {clockSettings.enabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Clock Style</Label>
                  <Select
                    value={clockSettings.type}
                    onValueChange={(value: 'analog' | 'digital' | 'flip') => setClockSettings(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analog">Analog</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="flip">Flip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-primary" />
              <CardTitle>Receipt Settings</CardTitle>
            </div>
            <CardDescription>
              Configure receipt printing options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Print Receipts</Label>
                <p className="text-sm text-muted-foreground">
                  Print automatically on payment
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Logo</Label>
                <p className="text-sm text-muted-foreground">
                  Show hotel logo on receipts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Print Item Details</Label>
                <p className="text-sm text-muted-foreground">
                  Show detailed item breakdown
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <CardDescription>
              Enable or disable payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cash Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Accept cash payments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Card Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Accept credit/debit cards
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Room Charge</Label>
                <p className="text-sm text-muted-foreground">
                  Charge to guest room
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
