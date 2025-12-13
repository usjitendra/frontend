"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSelector } from "react-redux";
import { Loader2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchLatestCalendarApi } from "@/network/Api";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

const IntegrationsPage = () => {
  const router = useRouter();
  const userProfileData: any = useSelector<any>(
    (state) => state?.account?.profileData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [calendarList, setCalendarList] = useState<any>([]);
  const { toggleSidebar, open } = useSidebar();

  const handleGoogleCalendarConnect = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/integrations/success`,
      response_type: "code",
      scope:
        "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar openid email profile",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state: userProfileData?.id,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const fetchLatestCalendar = async () => {
    setIsLoading(true);
    fetchLatestCalendarApi()
      .then((res) => {
        if (res.data) {
          console.log("latest calendar", res.data);
          setCalendarList(res.data?.data?.calendars);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!open) {
      toggleSidebar();
    }
  }, [open, toggleSidebar]);

  useEffect(() => {
    fetchLatestCalendar();
  }, []);

  // Check if user has any connected Google calendars
  const hasConnectedCalendars = Object.keys(calendarList).length > 0;

  return (
    <div className="max-w-7xl mx-auto h-full">
      <div className="w-full flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect your favorite tools and services to enhance your workflow.
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-100 h-full">
        {/* Google Calendar Integration Tile */}
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 flex flex-col 
        h-[250px]"
        >
          <div className="flex items-center space-x-4">
            <div className="p-1 rounded-lg">
              <Image
                src="/google_calendar_logo.png"
                alt="Google Calendar"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Google Calendar</h3>
              <p className="text-sm text-gray-500">Sync your calendar events</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col flex-1">
            <p className="text-sm text-gray-600 mb-4">
              Connect your Google Calendar to automatically sync your events and
              manage your schedule.
            </p>
            <div className="mt-auto">
              {isLoading ? (
                <Button
                  disabled
                  className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </Button>
              ) : hasConnectedCalendars ? (
                <div className="flex flex-col space-y-3">
                  <Button
                    onClick={() =>
                      router.push("/integrations/calendars?type=google")
                    }
                    className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Calendar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleGoogleCalendarConnect}
                  className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Connect Calendar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder for future integrations */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex items-center justify-center h-[250px]">
          <p className="text-gray-500">More integrations coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
