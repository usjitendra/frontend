"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { 
  Search, 
  Plus, 
  Bot, 
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
  RotateCw
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

type CampaignStatus = "active" | "paused" | "scheduled" | "completed";

interface Campaign {
  id: string;
  name: string;
  createdAt: string;
  assistant: string;
  phoneCount: string;
  status: CampaignStatus;
}

const CampaignPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const columns = [
    {
      header: "Campaign Name",
      accessorKey: "name" as keyof Campaign,
      cell: (row: Campaign) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-400">Created {row.createdAt}</span>
        </div>
      ),
    },
    {
      header: "Connected Assistant",
      accessorKey: "assistant" as keyof Campaign,
      cell: (row: Campaign) => (
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <span className="text-gray-800 text-sm">{row.assistant}</span>
        </div>
      ),
    },
    {
      header: "Phone Number Count",
      accessorKey: "phoneCount" as keyof Campaign,
      cell: (row: Campaign) => (
        <span className="text-gray-700 text-sm">{row.phoneCount}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Campaign,
      cell: (row: Campaign) => {
        const statusStyles: Record<CampaignStatus, string> = {
          active: "bg-green-100 text-green-700",
          paused: "bg-orange-100 text-orange-700",
          scheduled: "bg-blue-100 text-blue-700",
          completed: "bg-gray-200 text-gray-500"
        };
        return (
          <Badge variant="secondary" className={`${statusStyles[row.status]} hover:${statusStyles[row.status]}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "actions" as keyof Campaign,
      cell: (row: Campaign) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.push(`/campaign/${row.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={row.status === "completed"}>
            <Pencil className="h-4 w-4" />
          </Button>
          {row.status === "active" ? (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-500">
              <Pause className="h-4 w-4" />
            </Button>
          ) : row.status === "paused" ? (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-500">
              <Play className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const data: Campaign[] = [
    {
      id: "1",
      name: "Spring Sale Outreach",
      createdAt: "Apr 18, 2024",
      assistant: "Emma AI",
      phoneCount: "1,250",
      status: "active"
    },
    {
      id: "2",
      name: "Customer Feedback Survey",
      createdAt: "Mar 31, 2024",
      assistant: "Survey Genie",
      phoneCount: "980",
      status: "scheduled"
    },
    {
      id: "3",
      name: "Winter Reminder Calls",
      createdAt: "Feb 20, 2024",
      assistant: "Emma AI",
      phoneCount: "2,000",
      status: "paused"
    },
    {
      id: "4",
      name: "Flash Promo Blast",
      createdAt: "Feb 1, 2024",
      assistant: "SalesBot",
      phoneCount: "1,400",
      status: "completed"
    },
    {
      id: "5",
      name: "VIP Client Outreach",
      createdAt: "Jan 15, 2024",
      assistant: "Survey Genie",
      phoneCount: "340",
      status: "active"
    }
  ];

  return (
    <div id="main-content" className="flex-1 overflow-auto">
      <div className="w-full flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Outbound Call Campaigns</h2>
          <p className="text-sm text-gray-500 mt-1">Manage, launch, and monitor your outbound call campaigns</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search campaigns..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 text-sm rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3.5 top-3 text-gray-400 h-4 w-4" />
          </div>
          <Button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <div id="campaign-content" className="p-8 bg-gray-100 h-full">
        <div id="campaign-filters" className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-assistants">
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="All Assistants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-assistants">All Assistants</SelectItem>
                <SelectItem value="emma">Emma AI</SelectItem>
                <SelectItem value="salesbot">SalesBot</SelectItem>
                <SelectItem value="survey">Survey Genie</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl">
              <RotateCw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div id="campaign-table">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">All Campaigns</h3>
              <p className="text-sm text-gray-500">
                Showing {data.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, data.length)} of ${data.length}` : '0'} campaigns
              </p>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={data}
            className="rounded-2xl shadow-sm"
          />
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, Math.ceil(data.length / pageSize)) }, (_, i) => {
                  let pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      className={`px-3 py-1.5 text-sm ${currentPage === pageNum ? "text-white bg-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"} rounded-lg`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={currentPage === Math.ceil(data.length / pageSize)}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
              <Select
                defaultValue={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder={`${pageSize} per page`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

export default CampaignPage;