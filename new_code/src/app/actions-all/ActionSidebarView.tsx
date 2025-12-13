import { CalendarDays, Bell, Settings, PhoneForwarded } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const ActionSidebarView = () => {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveView = () => {
    if (pathname.includes("/realtime-booking")) return "realtime-booking";
    if (pathname.includes("/send-notification")) return "send-notification";
    if (pathname.includes("/global-variables")) return "global-variables";
    if (pathname.includes("/call-transfer")) return "call-transfer";
    return "realtime-booking"; // default
  };

  const activeView = getActiveView();

  const handleNavigation = (view: string) => {
    switch (view) {
      case "realtime-booking":
        router.push("/actions-all/realtime-booking");
        break;
      case "send-notification":
        router.push("/actions-all/send-notification");
        break;
      case "global-variables":
        router.push("/actions-all/global-variables");
        break;
      case "call-transfer":
        router.push("/actions-all/call-transfer");
        break;
      default:
        router.push("/actions-all/realtime-booking");
    }
  };

  return (
    <div className="px-3 py-2">
      <div
        className={`p-3 rounded-lg mb-3 cursor-pointer transition-all duration-200 ${
          activeView === "realtime-booking"
            ? "bg-indigo-50 border-l-4 border-indigo-500"
            : "hover:bg-gray-50"
        }`}
        onClick={() => handleNavigation("realtime-booking")}
      >
        <div className="flex items-start gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${
              activeView === "realtime-booking"
                ? "bg-indigo-500"
                : "bg-gray-100"
            }`}
          >
            <CalendarDays
              className={`h-4 w-4 ${
                activeView === "realtime-booking"
                  ? "text-white"
                  : "text-gray-500"
              }`}
            />
          </div>
          <div>
            <h3
              className={`text-sm font-medium ${
                activeView === "realtime-booking"
                  ? "text-indigo-600"
                  : "text-gray-700"
              }`}
            >
              Realtime Booking
            </h3>
            <p className="text-xs text-gray-500">Schedule appointments</p>
          </div>
        </div>
      </div>

      <div
        className={`p-3 rounded-lg mb-3 cursor-pointer transition-all duration-200 ${
          activeView === "send-notification"
            ? "bg-amber-50 border-l-4 border-amber-500"
            : "hover:bg-gray-50"
        }`}
        onClick={() => handleNavigation("send-notification")}
      >
        <div className="flex items-start gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              activeView === "send-notification"
                ? "bg-amber-500"
                : "bg-gray-100"
            }`}
          >
            <Bell
              className={`h-4 w-4 ${
                activeView === "send-notification"
                  ? "text-white"
                  : "text-gray-500"
              }`}
            />
          </div>
          <div>
            <h3
              className={`text-sm font-medium ${
                activeView === "send-notification"
                  ? "text-amber-600"
                  : "text-gray-700"
              }`}
            >
              Send Notification
            </h3>
            <p className="text-xs text-gray-500">Alert users & teams</p>
          </div>
        </div>
      </div>

      <div
        className={`p-3 rounded-lg mb-3 cursor-pointer transition-all duration-200 ${
          activeView === "call-transfer"
            ? "bg-amber-50 border-l-4 border-amber-500"
            : "hover:bg-gray-50"
        }`}
        onClick={() => handleNavigation("call-transfer")}
      >
        <div className="flex items-start gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              activeView === "call-transfer" ? "bg-amber-500" : "bg-gray-100"
            }`}
          >
            <PhoneForwarded
              className={`h-4 w-4 ${
                activeView === "call-transfer" ? "text-white" : "text-gray-500"
              }`}
            />
          </div>
          <div>
            <h3
              className={`text-sm font-medium ${
                activeView === "call-transfer"
                  ? "text-amber-600"
                  : "text-gray-700"
              }`}
            >
              Call Transfer
            </h3>
            <p className="text-xs text-gray-500">Transfers call to real user</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      <div
        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          activeView === "global-variables"
            ? "bg-gray-50 border-l-4 border-gray-500"
            : "hover:bg-gray-50"
        }`}
        onClick={() => handleNavigation("global-variables")}
      >
        <div className="flex items-start gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              activeView === "global-variables" ? "bg-gray-500" : "bg-gray-100"
            }`}
          >
            <Settings
              className={`h-4 w-4 ${
                activeView === "global-variables"
                  ? "text-white"
                  : "text-gray-500"
              }`}
            />
          </div>
          <div>
            <h3
              className={`text-sm font-medium ${
                activeView === "global-variables"
                  ? "text-gray-600"
                  : "text-gray-700"
              }`}
            >
              Global Variables
            </h3>
            <p className="text-xs text-gray-500">Manage shared variables</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionSidebarView;
