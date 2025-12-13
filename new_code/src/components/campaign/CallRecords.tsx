"use client"

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTable } from "../ui/data-table";
import { useState } from "react";

type CallStatus = "completed" | "failed" | "busy" | "no-answer" | "pending";

interface CallRecord {
    id: string;
    phoneNumber: string;
    contactName: string;
    callDuration: string;
    status: CallStatus;
    timestamp: string;
    notes: string;
}

const CallRecords = ({ campaign }: { campaign: any }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const statusStyles = {
        active: "bg-green-100 text-green-700",
        paused: "bg-orange-100 text-orange-700",
        scheduled: "bg-blue-100 text-blue-700",
        completed: "bg-gray-200 text-gray-500"
    };

    const callStatusStyles: Record<CallStatus, string> = {
        completed: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
        busy: "bg-yellow-100 text-yellow-700",
        "no-answer": "bg-gray-100 text-gray-700",
        pending: "bg-blue-100 text-blue-700"
    };

    const callData: CallRecord[] = [
        {
            id: "1",
            phoneNumber: "+1 (555) 123-4567",
            contactName: "John Smith",
            callDuration: "3m 45s",
            status: "completed",
            timestamp: "Apr 20, 2024 2:30 PM",
            notes: "Interested in spring promotion, requested callback"
        },
        {
            id: "2",
            phoneNumber: "+1 (555) 987-6543",
            contactName: "Sarah Johnson",
            callDuration: "1m 12s",
            status: "busy",
            timestamp: "Apr 20, 2024 2:25 PM",
            notes: "Line was busy, will retry later"
        },
        {
            id: "3",
            phoneNumber: "+1 (555) 456-7890",
            contactName: "Mike Davis",
            callDuration: "4m 22s",
            status: "completed",
            timestamp: "Apr 20, 2024 2:20 PM",
            notes: "Successful sale conversion, $299 order placed"
        },
        {
            id: "4",
            phoneNumber: "+1 (555) 321-0987",
            contactName: "Emily Wilson",
            callDuration: "0m 00s",
            status: "no-answer",
            timestamp: "Apr 20, 2024 2:15 PM",
            notes: "No answer, voicemail left"
        },
        {
            id: "5",
            phoneNumber: "+1 (555) 654-3210",
            contactName: "Robert Brown",
            callDuration: "2m 18s",
            status: "failed",
            timestamp: "Apr 20, 2024 2:10 PM",
            notes: "Call dropped due to technical issue"
        }
    ];

    const columns = [
        {
            header: "Contact",
            accessorKey: "contactName" as keyof CallRecord,
            cell: (row: CallRecord) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{row.contactName}</span>
                    <span className="text-xs text-gray-500">{row.phoneNumber}</span>
                </div>
            ),
        },
        {
            header: "Call Duration",
            accessorKey: "callDuration" as keyof CallRecord,
            cell: (row: CallRecord) => (
                <span className="text-gray-700 text-sm">{row.callDuration}</span>
            ),
        },
        {
            header: "Status",
            accessorKey: "status" as keyof CallRecord,
            cell: (row: CallRecord) => (
                <Badge variant="secondary" className={`${callStatusStyles[row.status]} hover:${callStatusStyles[row.status]}`}>
                    {row.status === "no-answer" ? "No Answer" : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </Badge>
            ),
        },
        {
            header: "Timestamp",
            accessorKey: "timestamp" as keyof CallRecord,
            cell: (row: CallRecord) => (
                <span className="text-gray-700 text-sm">{row.timestamp}</span>
            ),
        },
        {
            header: "Notes",
            accessorKey: "notes" as keyof CallRecord,
            cell: (row: CallRecord) => (
                <span className="text-gray-600 text-sm truncate max-w-[200px]">{row.notes}</span>
            ),
        },
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Call Records</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>{campaign.successfulCalls} Successful</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span>{campaign.failedCalls} Failed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <span>{campaign.phoneCount - campaign.completedCalls} Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <DataTable
                    columns={columns}
                    data={callData}
                    className="rounded-lg"
                />
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                        Showing {callData.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, callData.length)} of ${callData.length}` : '0'} call records
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="ghost"
                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
                            disabled={currentPage === Math.ceil(callData.length / pageSize)}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CallRecords;