"use client";

import { CalendarDays, Bell, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const ActionsAllPage = () => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 w-full">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Actions Setup
          </h1>
          <p className="text-gray-600">
            Choose an action type from the sidebar to get started
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors cursor-pointer"
            onClick={() => handleNavigation("/actions-all/realtime-booking")}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Realtime Booking</h3>
                <p className="text-sm text-gray-500">Schedule appointments</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-amber-200 transition-colors cursor-pointer"
            onClick={() => handleNavigation("/actions-all/send-notification")}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Send Notification</h3>
                <p className="text-sm text-gray-500">Alert users & teams</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            onClick={() => handleNavigation("/actions-all/global-variables")}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gray-500 flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Global Variables</h3>
                <p className="text-sm text-gray-500">Manage shared variables</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionsAllPage;
