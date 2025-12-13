"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Settings,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { removeIsOnboardingDone, removeIsVerified, removeToken } from "@/_utils/cookies"
import { useSelector } from "react-redux"
import { getInitials } from "@/_utils/general"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const handleLogout = () => {
    removeToken()
    removeIsOnboardingDone()
    removeIsVerified()
    router.push("/login")
  }

  const userProfileData: any = useSelector<any>((state) => state?.account?.profileData)
  console.log("userProfileData", userProfileData);

  return (
    <SidebarMenu className="border rounded-sm">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={process.env.NEXT_PUBLIC_IMAGE_URL + userProfileData?.profile_picture} alt={userProfileData?.first_name} className="object-cover" />
                <AvatarFallback className="rounded-lg bg-primary text-white font-semibold">{getInitials(userProfileData?.first_name ,userProfileData?.last_name)||"ES"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{userProfileData?.first_name + " " + userProfileData?.last_name}</span>
                <span className="truncate text-xs">{userProfileData?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userProfileData?.avatar} alt={userProfileData?.first_name} />
                  <AvatarFallback className="rounded-lg">{getInitials(userProfileData?.first_name ,userProfileData?.last_name)||"ES"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userProfileData?.first_name + " " + userProfileData?.last_name}</span>
                  <span className="truncate text-xs">{userProfileData?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />            
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/accounts")}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/billings")}>
                <CreditCard />
                Billing
              </DropdownMenuItem>            
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
