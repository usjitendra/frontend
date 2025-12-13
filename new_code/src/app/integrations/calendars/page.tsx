"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, ChevronDown, ChevronRight, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import AddCalendar from "@/components/calendar/AddCalendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { connectCalendarApi, disconnectCalendarApi, fetchLatestCalendarApi, getCalendarListApi, removeCalendarAccountApi } from "@/network/Api";
import { useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { log } from "console";

const CalendarsPage = () => {
  const [isAddCalendarOpen, setIsAddCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("google");
  const [calendarList, setCalendarList] = useState<Record<string, any[]>>({});
  const [connectedCalendarList, setConnectedCalendarList] = useState<Record<string, any[]>>({});
  const userProfileData: any = useSelector<any>((state) => state?.account?.profileData)
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [connectingCalendars, setConnectingCalendars] = useState<Record<string, boolean>>({});
  const [disconnectingCalendars, setDisconnectingCalendars] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  console.log("connectedCalendarList",connectedCalendarList);
  console.log("calendarList",calendarList);
  

  const fetchCalendarList = async () => {
    getCalendarListApi().then((res) => {
      if(res.data){
        console.log("calendar list",res.data?.data?.calendars);
        
        setConnectedCalendarList(res.data?.data?.calendars);
      }
    }).catch((err) => {
      console.log(err);
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/integrations/calendars?type=${value}`);
  };

  const toggleAccountExpanded = (accountEmail: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountEmail]: !prev[accountEmail]
    }));
  };

  const openRemoveDialog = (email: string) => {
    setAccountToRemove(email);
    setConfirmEmail("");
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveAccount = () => {
    if (!accountToRemove) return;
    if (confirmEmail !== accountToRemove) return;

    removeCalendarAccountApi(accountToRemove).then((res) => {
      if(res.data){
        fetchLatestCalendar();
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setIsRemoveDialogOpen(false);
      setAccountToRemove(null);
      setConfirmEmail("");
    });
  };

  const connectNewAccount = () => {
    if(activeTab === "google"){
      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/integrations/success`,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar openid email profile',
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        state: userProfileData?.id
      });
  
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }else if(activeTab === "microsoft"){
      console.log("microsoft");
    }else if(activeTab === "other"){
      console.log("other");
    }
  };

  const fetchLatestCalendar = async () => {
    setIsLoading(true);
    fetchLatestCalendarApi().then((res) => {
      if(res.data){
        setCalendarList(res.data?.data?.calendars);
        
        // Initialize expanded state for all accounts
        const initialExpandedState: Record<string, boolean> = {};
        Object.keys(res.data?.data?.calendars || {}).forEach(email => {
          initialExpandedState[email] = true;
        });
        setExpandedAccounts(initialExpandedState);
        
        console.log("latest calendar", res.data);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const disconnectCalendar = (calendarId: string) => {
    setDisconnectingCalendars(prev => ({ ...prev, [calendarId]: true }));
    disconnectCalendarApi(calendarId).then((res: any) => {
      if(res.data){
        // fetchCalendarList();
        fetchLatestCalendar();
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setDisconnectingCalendars(prev => ({ ...prev, [calendarId]: false }));
    });
  }

  const connectCalendar = (calendarId: string, connectedAccountId: string) => {
    setConnectingCalendars(prev => ({ ...prev, [calendarId]: true }));
    connectCalendarApi({
      calendar_id: calendarId,
      connected_account_id: connectedAccountId
    }).then((res: any) => {
      if(res.data){
        fetchLatestCalendar();
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setConnectingCalendars(prev => ({ ...prev, [calendarId]: false }));
    });
  }
  useEffect(() => {
    const type = searchParams.get("type");
    if (type && ["google", "microsoft", "other"].includes(type)) {
      setActiveTab(type);
    }
  }, [searchParams]);

  useEffect(() => {
    // fetchCalendarList();
    fetchLatestCalendar();
  }, []);

  return (
    <div className="w-full bg-gray-50 h-full">
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Connected Calendars</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your calendar integrations and availability</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800" 
            onClick={() => connectNewAccount()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="google">Google Calendar</TabsTrigger>
            <TabsTrigger disabled value="microsoft">Microsoft Calendar</TabsTrigger>
            <TabsTrigger disabled value="other">Other Calendars</TabsTrigger>
          </TabsList>

          <TabsContent value="google">
            {/* Google Calendar Accounts */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Loading Calendars</h3>
                  <p className="text-gray-500 max-w-md">
                    Please wait while we fetch your connected calendars...
                  </p>
                </div>
              ) : Object.keys(calendarList).length > 0 ? (
                Object.entries(calendarList).map(([email, calendars]) => (
                  <Card key={email} className="hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`flex items-center justify-between ${expandedAccounts[email] ? 'border-b border-gray-200 pb-4 mb-4' : ''} `}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm">
                            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{email}</h3>
                            <p className="text-sm text-gray-500">Google Account</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 mr-2"
                            onClick={() => openRemoveDialog(calendars?.[0]?.connected_account_id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove Account
                          </Button>
                          <Collapsible open={expandedAccounts[email]}>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleAccountExpanded(email)}
                              >
                                {expandedAccounts[email] ?
                                  <ChevronDown className="h-5 w-5 text-gray-400" /> :
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                }
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        </div>
                      </div>

                      <Collapsible open={expandedAccounts[email]}>
                        <CollapsibleContent>
                          <div className="space-y-4 pl-16">
                            {calendars.map((calendar) => (
                              <div key={calendar.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm" 
                                       style={{ backgroundColor: calendar.backgroundColor || 'white' }}>
                                    <Calendar className="h-5 w-5" style={{ color: calendar.foregroundColor || '#3b82f6' }} />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800">{calendar.summary}</h4>
                                    <div className="flex gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-600 border-green-100"
                                      >
                                        Active
                                      </Badge>
                                      {calendar.primary && (
                                        <Badge
                                          variant="outline"
                                          className="bg-purple-50 text-purple-600 border-purple-100"
                                        >
                                          Default
                                        </Badge>
                                      )}
                                      {calendar.description && calendar.description.toLowerCase().includes('work') && (
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-50 text-blue-600 border-blue-100"
                                        >
                                          Work
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {calendar?.is_connected ? (
                                    <Button 
                                      variant="outline" 
                                      className="border-indigo-100 text-indigo-600 hover:bg-indigo-50" 
                                      onClick={() => disconnectCalendar(calendar.calendar_id)}
                                      disabled={disconnectingCalendars[calendar.calendar_id]}
                                    >
                                      {disconnectingCalendars[calendar.calendar_id] ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Disconnecting...
                                        </>
                                      ) : (
                                        "Disconnect"
                                      )}
                                    </Button>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      className="border-indigo-100 text-indigo-600 hover:bg-indigo-50" 
                                      onClick={() => connectCalendar(calendar.id, calendar.connected_account_id)}
                                      disabled={connectingCalendars[calendar.id]}
                                    >
                                      {connectingCalendars[calendar.id] ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Connecting...
                                        </>
                                      ) : (
                                        "Connect"
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Google Calendars Connected</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    Connect your Google Calendar to manage all your schedules in one place.
                  </p>
                  <Button onClick={() => connectNewAccount()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Google Account
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="microsoft">
            {/* Microsoft Calendar Accounts */}
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Microsoft Calendar Integration Coming Soon</h3>
              <p className="text-gray-500 max-w-md mb-6">
                We're working on adding Microsoft Calendar integration. Stay tuned!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Other Calendars Connected</h3>
              <p className="text-gray-500 max-w-md mb-6">
                Connect additional calendar services to manage all your schedules in one place.
              </p>
              <Button onClick={() => setIsAddCalendarOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddCalendar isOpen={isAddCalendarOpen} onClose={() => setIsAddCalendarOpen(false)} />

      {/* Remove Account Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Remove Calendar Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  Are you sure you want to remove <span className="font-semibold">{accountToRemove}</span>?
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                  <div className="font-medium mb-1">Important:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>This will disconnect all calendars associated with this account</li>
                    <li>All scheduled appointments linked to these calendars will no longer be synced</li>
                    <li>This calendar will be removed from all attached providers</li>
                    <li>Future appointments won't be scheduled on this calendar</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <label htmlFor="confirm-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Please type <span className="font-semibold">{accountToRemove}</span> to confirm:
                  </label>
                  <Input 
                    id="confirm-email"
                    type="text"
                    placeholder={`Type ${accountToRemove} to confirm`}
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmEmail("");
              setAccountToRemove(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={confirmEmail !== accountToRemove}
            >
              Remove Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarsPage;