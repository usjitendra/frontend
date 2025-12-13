"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import ActionSidebarView from "./ActionSidebarView";

export default function ActionsAllLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { toggleSidebar, open } = useSidebar();

    useEffect(() => {
        if (open) {
            toggleSidebar();
        }
    }, [open, toggleSidebar]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 w-full">
            {/* Actions Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto" style={{ maxWidth: '255px', width: '100%' }}>
                <div className="p-5">
                    <h1 className="text-xl font-bold text-gray-900">Actions Setup</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure automated actions</p>
                </div>

                {/* Action Types Sidebar */}
                <ActionSidebarView />
            </div>

            {/* Main Content Area */}
            {children}
        </div>
    );
} 