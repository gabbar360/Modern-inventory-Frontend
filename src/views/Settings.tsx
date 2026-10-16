"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectCurrentUser, selectCurrentOrg, setCredentials } from "@/store/slices/authSlice";
import { useUpdateProfileMutation, useUpdateOrganizationMutation, useChangePasswordMutation } from "@/store/api/profileApi";
import { PageHeader } from "@/components/Bits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const org = useAppSelector(selectCurrentOrg);

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [updateOrganization, { isLoading: savingOrg }] = useUpdateOrganizationMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [orgForm, setOrgForm] = useState({
    name: "", legal_name: "", display_name: "", email: "", phone: "", website: "",
    address: "", city: "", state: "", state_code: "", country: "India", pin: "",
    gstin: "", pan: "", cin: "", tan: "",
    bank_name: "", account_holder: "", account_number: "", ifsc: "", swift: "", branch: "", upi_id: "",
  });
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "", phone: (user as any).phone || "" });
  }, [user]);

  useEffect(() => {
    if (org) setOrgForm((s) => ({ ...s, ...org }));
  }, [org]);

  const updProfile = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((s) => ({ ...s, [k]: e.target.value }));
  const updOrg = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOrgForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSaveProfile = async () => {
    try {
      const res = await updateProfile(profile).unwrap();
      dispatch(setCredentials({ user: res.user }));
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e?.data?.detail || "Failed to update profile");
    }
  };

  const handleSaveOrg = async () => {
    try {
      const res = await updateOrganization(orgForm).unwrap();
      dispatch(setCredentials({ organization: res.organization }));
      toast.success("Organization updated successfully");
    } catch (e: any) {
      toast.error(e?.data?.detail || "Failed to update organization");
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current_password || !passwords.new_password)
      return toast.error("All password fields are required");
    if (passwords.new_password !== passwords.confirm_password)
      return toast.error("New passwords do not match");
    try {
      await changePassword({ current_password: passwords.current_password, new_password: passwords.new_password }).unwrap();
      toast.success("Password changed successfully");
      setPasswords({ current_password: "", new_password: "", confirm_password: "" });
    } catch (e: any) {
      toast.error(e?.data?.detail || "Failed to change password");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Manage your profile and organization details." />

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ── PROFILE TAB ── */}
        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6 space-y-4 max-w-lg">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Personal Information</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input className="mt-1" value={profile.name} onChange={updProfile("name")} />
                </div>
                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input className="mt-1" type="email" value={profile.email} onChange={updProfile("email")} />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input className="mt-1" value={profile.phone} onChange={updProfile("phone")} placeholder="+91 98200 12345" />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <Input className="mt-1 capitalize" value={user?.role?.replace("_", " ") || ""} disabled />
                </div>
              </div>
              <Button className="h-9" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ORGANIZATION TAB ── */}
        <TabsContent value="organization">
          <div className="space-y-4">
            {/* Identity */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Identity</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><Label className="text-xs">Company Name</Label><Input className="mt-1" value={orgForm.name} onChange={updOrg("name")} /></div>
                  <div><Label className="text-xs">Legal Name</Label><Input className="mt-1" value={orgForm.legal_name} onChange={updOrg("legal_name")} /></div>
                  <div><Label className="text-xs">Display Name</Label><Input className="mt-1" value={orgForm.display_name} onChange={updOrg("display_name")} /></div>
                  <div><Label className="text-xs">Website</Label><Input className="mt-1" value={orgForm.website} onChange={updOrg("website")} placeholder="https://vegnar.com" /></div>
                  <div><Label className="text-xs">Email</Label><Input className="mt-1" type="email" value={orgForm.email} onChange={updOrg("email")} /></div>
                  <div><Label className="text-xs">Phone</Label><Input className="mt-1" value={orgForm.phone} onChange={updOrg("phone")} /></div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Address</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="md:col-span-2"><Label className="text-xs">Street Address</Label><Input className="mt-1" value={orgForm.address} onChange={updOrg("address")} /></div>
                  <div><Label className="text-xs">City</Label><Input className="mt-1" value={orgForm.city} onChange={updOrg("city")} /></div>
                  <div><Label className="text-xs">State</Label><Input className="mt-1" value={orgForm.state} onChange={updOrg("state")} /></div>
                  <div><Label className="text-xs">State Code</Label><Input className="mt-1" value={orgForm.state_code} onChange={updOrg("state_code")} placeholder="24" /></div>
                  <div><Label className="text-xs">PIN Code</Label><Input className="mt-1" value={orgForm.pin} onChange={updOrg("pin")} /></div>
                  <div><Label className="text-xs">Country</Label><Input className="mt-1" value={orgForm.country} onChange={updOrg("country")} /></div>
                </div>
              </CardContent>
            </Card>

            {/* Tax */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tax Information</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><Label className="text-xs">GSTIN</Label><Input className="mt-1 font-mono" value={orgForm.gstin} onChange={updOrg("gstin")} placeholder="24ABCDE1234F1Z5" /></div>
                  <div><Label className="text-xs">PAN</Label><Input className="mt-1 font-mono" value={orgForm.pan} onChange={updOrg("pan")} /></div>
                  <div><Label className="text-xs">CIN</Label><Input className="mt-1 font-mono" value={orgForm.cin} onChange={updOrg("cin")} /></div>
                  <div><Label className="text-xs">TAN</Label><Input className="mt-1 font-mono" value={orgForm.tan} onChange={updOrg("tan")} /></div>
                </div>
              </CardContent>
            </Card>

            {/* Bank */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Bank Details</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><Label className="text-xs">Bank Name</Label><Input className="mt-1" value={orgForm.bank_name} onChange={updOrg("bank_name")} /></div>
                  <div><Label className="text-xs">Account Holder</Label><Input className="mt-1" value={orgForm.account_holder} onChange={updOrg("account_holder")} /></div>
                  <div><Label className="text-xs">Account Number</Label><Input className="mt-1 font-mono" value={orgForm.account_number} onChange={updOrg("account_number")} /></div>
                  <div><Label className="text-xs">IFSC Code</Label><Input className="mt-1 font-mono" value={orgForm.ifsc} onChange={updOrg("ifsc")} /></div>
                  <div><Label className="text-xs">Branch</Label><Input className="mt-1" value={orgForm.branch} onChange={updOrg("branch")} /></div>
                  <div><Label className="text-xs">SWIFT Code</Label><Input className="mt-1 font-mono" value={orgForm.swift} onChange={updOrg("swift")} /></div>
                  <div><Label className="text-xs">UPI ID</Label><Input className="mt-1 font-mono" value={orgForm.upi_id} onChange={updOrg("upi_id")} placeholder="vegnar@axisbank" /></div>
                </div>
              </CardContent>
            </Card>

            <Button className="h-9" onClick={handleSaveOrg} disabled={savingOrg}>
              {savingOrg ? "Saving…" : "Save Organization"}
            </Button>
          </div>
        </TabsContent>

        {/* ── SECURITY TAB ── */}
        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 space-y-4 max-w-lg">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Change Password</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Current Password</Label>
                  <Input className="mt-1" type="password" value={passwords.current_password}
                    onChange={(e) => setPasswords((s) => ({ ...s, current_password: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">New Password</Label>
                  <Input className="mt-1" type="password" value={passwords.new_password}
                    onChange={(e) => setPasswords((s) => ({ ...s, new_password: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Confirm New Password</Label>
                  <Input className="mt-1" type="password" value={passwords.confirm_password}
                    onChange={(e) => setPasswords((s) => ({ ...s, confirm_password: e.target.value }))} />
                </div>
              </div>
              <Button className="h-9" onClick={handleChangePassword} disabled={savingPassword}>
                {savingPassword ? "Saving…" : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
