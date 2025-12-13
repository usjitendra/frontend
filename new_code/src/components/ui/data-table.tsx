"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowDownAZ } from "lucide-react"

interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (row: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    className?: string;
}

export function DataTable<T>({ columns, data, onRowClick, className = "" }: DataTableProps<T>) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm ${className}`}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="text-sm text-gray-500 border-b border-gray-100">
                            {columns.map((column) => (
                                <TableHead key={column.header as string} className="whitespace-nowrap px-6 py-4 text-left font-medium">
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && (
                                            <ArrowDownAZ className="h-3 w-3 text-gray-400" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-sm">
                        {data.length > 0 ? (
                            data.map((row, index) => (
                                <TableRow
                                    key={index}
                                    className="border-b border-gray-100 hover:bg-gray-50/50"
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.header as string} className="px-6 py-4">
                                            {column.cell ? column.cell(row) : String(row[column.accessorKey])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
