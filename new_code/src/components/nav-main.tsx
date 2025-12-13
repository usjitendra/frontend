"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()  
  const { isMobile, open, toggleSidebar } = useSidebar()
  
  const handleNavClick = (url: string) => {
    // If sidebar is closed and the clicked item is not the current page, open the sidebar
    if (!open && pathname !== url) {
      toggleSidebar()
    }
  }
  
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items?.map((item) => {
          const isActive = item.url === "/" 
            ? pathname === "/" 
            : pathname?.includes(item.url) && item.url !== "/"
          const hasSubItems = item.items && item.items.length > 0

          return hasSubItems ? (
            // Render Collapsible for items with sub-items
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item?.title} 
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-lg my-1"
                    onClick={() => handleNavClick(item.url)}
                  >
                    {item?.icon && (
                      <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                    {open && (
                      <span className="text-base font-medium text-gray-700 dark:text-gray-200 ml-3">
                        {item?.title}
                      </span>
                    )}
                    <ChevronRight className="ml-auto w-4 h-4 text-gray-500 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                    {item?.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem?.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            className={`px-4 py-2 rounded-md my-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ${
                              isSubActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''
                            }`}
                          >
                            <Link 
                              href={subItem.url}
                              onClick={() => handleNavClick(subItem.url)}
                            >
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                className={`px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Link 
                  href={item.url} 
                  className="flex items-center w-full"
                  onClick={() => handleNavClick(item.url)}
                >
                  {item.icon && (
                    <item.icon className={`w-5 h-5 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'
                    }`} />
                  )}
                  {open && (
                    <span className={`text-base font-medium ml-3 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {item.title}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}