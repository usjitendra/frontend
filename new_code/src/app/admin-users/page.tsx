"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Download, Store, Utensils, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const AdminUsersPage = () => {
    const router = useRouter();
  return (
    <div className="flex min-h-screen bg-background">

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-card shadow-sm px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Users Management</h2>
              <p className="text-sm text-muted-foreground mt-1">View and manage platform users</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search users..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="name">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Account Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Business Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          SC
                        </div>
                        <div>
                          <div className="font-medium">Sarah Connor</div>
                          <div className="text-sm text-muted-foreground">sarah@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Apr 15, 2025</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Retail</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" onClick={() => router.push("/admin-users/details")}>View Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                          JD
                        </div>
                        <div>
                          <div className="font-medium">John Doe</div>
                          <div className="text-sm text-muted-foreground">john@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Apr 12, 2025</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-purple-500" />
                        <span className="text-muted-foreground">Restaurant</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" onClick={() => router.push("/admin-users/details")}>View Details</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-medium">
                          EW
                        </div>
                        <div>
                          <div className="font-medium">Emma Wilson</div>
                          <div className="text-sm text-muted-foreground">emma@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Apr 10, 2025</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Inactive</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-pink-500" />
                        <span className="text-muted-foreground">Services</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" onClick={() => router.push("/admin-users/details")}>View Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing 1 to 3 of 50 results
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;