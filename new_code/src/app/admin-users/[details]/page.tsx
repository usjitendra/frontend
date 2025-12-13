"use client";
export const runtime = 'edge';

import React from "react";
import { ArrowLeft, Ban, CheckCircle, Copy, Eye, PenSquare, Phone, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const AdminUserDetailsPage = () => {
  return (
    <div className="flex min-h-screen bg-background">

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-card shadow-sm px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold">User Details</h2>
                <p className="text-sm text-muted-foreground mt-1">View and manage user information</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="destructive" className="gap-2">
                <Ban className="h-4 w-4" />
                Suspend Account
              </Button>
              <Button className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve Login
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* User Profile Card */}
            <div className="w-full md:w-1/3">
              <Card className="sticky top-28">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-28 w-28 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <AvatarFallback className="text-3xl font-medium">JD</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-6 text-2xl font-bold">John Doe</h3>
                    <p className="text-sm text-muted-foreground">john@example.com</p>
                    <Badge variant="outline" className="mt-3 bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending Approval
                    </Badge>
                    
                    <div className="w-full mt-8 space-y-4">
                      <div className="flex items-center gap-4 text-muted-foreground p-3 rounded-xl hover:bg-accent hover:bg-opacity-10 transition-colors">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground p-3 rounded-xl hover:bg-accent hover:bg-opacity-10 transition-colors">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Joined Apr 12, 2025</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground p-3 rounded-xl hover:bg-accent hover:bg-opacity-10 transition-colors">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Last active 2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Details */}
            <div className="w-full md:w-2/3 space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <PenSquare className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">First Name</Label>
                      <p className="font-medium">John</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Last Name</Label>
                      <p className="font-medium">Doe</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Date of Birth</Label>
                      <p className="font-medium">March 15, 1990</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Gender</Label>
                      <p className="font-medium">Male</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Business Information</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <PenSquare className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Business Name</Label>
                      <p className="font-medium">HealthCare Plus Business</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Business Category</Label>
                      <p className="font-medium">Healthcare Services</p>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <Label className="text-muted-foreground">Business Address</Label>
                      <p className="font-medium">123 Medical Center Drive, Suite 100, Sacramento, CA 95825</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VAPi Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>VAPi Configuration</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2 text-primary">
                      <PenSquare className="h-4 w-4" />
                      Edit Configuration
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-accent bg-opacity-5 space-y-2">
                      <Label className="text-muted-foreground">Organization ID</Label>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">org_7dh3k2j1l9</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-accent bg-opacity-5 space-y-2">
                      <Label className="text-muted-foreground">Private Key</Label>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">••••••••••••••••</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-accent bg-opacity-5 space-y-2">
                      <Label className="text-muted-foreground">API Status</Label>
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <p className="text-sm text-green-600 font-medium">Connected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;