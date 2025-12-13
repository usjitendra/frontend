"use client";
import {
  BotIcon,
  Logs,
  PhoneIcon,
  Settings,
  Settings2,
  Sparkles,
  Workflow,
  Crown,
  Clock,
  ChevronRight,
  Users,
  Home,
  Calendar,
  FileBox,
  Telescope,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSelector } from "react-redux";

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@eccentric.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Call Logs",
      url: "/call-logs",
      icon: Logs,
    },
    {
      title: "Agents",
      url: "/agents",
      icon: BotIcon,
    },
    {
      title: "Campaign",
      url: "/campaign",
      icon: Telescope,
    },
    {
      title: "Phone Numbers",
      url: "/phone-numbers",
      icon: PhoneIcon,
    },
    {
      title: "Providers",
      url: "/providers",
      icon: Settings2,
    },
    {
      title: "Services",
      url: "/services",
      icon: Settings,
    },
    {
      title: "Knowledge Base",
      url: "/knowledgebase",
      icon: FileBox,
    },
    {
      title: "Integrations",
      url: "/integrations",
      icon: Settings2,
    },
    {
      title: "Actions",
      url: "/actions-all/realtime-booking",
      icon: Workflow,
    },
    // {
    //   title: "Admin Users",
    //   url: "/admin-users",
    //   icon: Users,
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  navBottom: [
    {
      title: "Subscription",
      url: "/billing",
      icon: Sparkles,
    },
  ],
};

// Subscription component
function SubscriptionStatus({
  isSubscribed = false,
  plan = "Free",
  minutesUsed = 0,
  totalMinutes = 100,
}) {
  const percentUsed = (minutesUsed / totalMinutes) * 100;

  if (!isSubscribed) {
    return (
      <Link href="/billing" className="block">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-3 mb-3 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-300" />
              <span className="font-medium text-white">Select a plan</span>
            </div>
            <ChevronRight className="h-4 w-4 text-white/70" />
          </div>
          <p className="text-xs text-white/80 mt-1">Plan starts at $0/month</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/billing" className="block">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-3 mb-3 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-300" />
            <span className="font-medium text-white">{plan}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-white/70" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/90 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Call Minutes
            </span>
            <span>
              {minutesUsed.toFixed(2)} / {totalMinutes.toFixed(2)}
            </span>
          </div>
          <Progress
            value={percentUsed}
            className="h-1.5 bg-white/20"
            color="white"
          />
        </div>
      </div>
    </Link>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, open, setOpen } = useSidebar();
  const companyData = useSelector((state: any) => state.account.companyData);
  const currentSubscriptionData = useSelector(
    (state: any) => state.account.currentSubscriptionData
  );
  const isSubscribed =
    currentSubscriptionData?.status == "active" ||
    currentSubscriptionData?.plan?.name;
  const subscriptionPlan = currentSubscriptionData?.plan?.name || "Free";
  const billingUsageData = useSelector(
    (state: any) => state.account.billingUsageData
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        {/* <TeamSwitcher teams={data.teams} /> */}
        {/* <Link href="/" className="!cursor-pointer ms-[6px]"> */}
        <div
          className={`${
            open ? "flex items-center justify-between" : "flex flex-col-reverse"
          } gap-2`}
        >
          {!isMobile && open ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-sm bg-[#4F46E5] text-white content-center text-center font-bold">
                EA
              </div>
              <h1 className="font-bold text-2xl">Eccentric AI</h1>
            </div>
          ) : (
            <Link href="/" className="!cursor-pointer">
              <h1 className="font-bold text-lg">EA</h1>
            </Link>
          )}
          <SidebarTrigger className="-ml-1" />
        </div>
        {/* </Link> */}
      </SidebarHeader>
      <SidebarContent>
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {open && !isMobile ? (
          <SubscriptionStatus
            isSubscribed={isSubscribed}
            plan={currentSubscriptionData?.plan?.name}
            minutesUsed={billingUsageData?.minutes}
            totalMinutes={
              currentSubscriptionData?.plan?.features?.minutes_included
            }
          />
        ) : (
          <Link href="/billing" className="block">
            <div className="flex justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors duration-200">
              <Crown className="h-5 w-5 text-white hover:text-white/50" />
            </div>
          </Link>
        )}
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
