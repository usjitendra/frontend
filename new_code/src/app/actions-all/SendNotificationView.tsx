import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Edit, Copy, Trash, Bell, Users, Mail, MessageSquare, CalendarDays } from "lucide-react";

const SendNotificationView = () => {
    const cards = [
        {
            title: "Send Reminder",
            description: "Automated reminder system supporting SMS, email, and push notifications. Customizable timing and messaging.",
            icon: Bell,
            iconBg: "from-amber-500 to-amber-600",
            status: "Active",
            parameters: ["Appointment ID", "Patient ID", "Type", "Lead Time"],
            createdDate: "Feb 15, 2023"
        },
        {
            title: "Team Notifications",
            description: "Notify team members about new appointments, cancellations, and schedule changes.",
            icon: Users,
            iconBg: "from-purple-500 to-purple-600",
            status: "Active",
            parameters: ["Team ID", "Event Type", "Message", "Priority"],
            createdDate: "Mar 10, 2023"
        },
        {
            title: "Email Campaigns",
            description: "Send bulk email notifications and marketing campaigns to patient lists.",
            icon: Mail,
            iconBg: "from-blue-500 to-blue-600",
            status: "Active",
            parameters: ["Recipient List", "Template ID", "Subject", "Schedule"],
            createdDate: "Apr 5, 2023"
        },
        {
            title: "SMS Alerts",
            description: "Send urgent SMS notifications for critical updates and emergency communications.",
            icon: MessageSquare,
            iconBg: "from-green-500 to-green-600",
            status: "Inactive",
            parameters: ["Phone Number", "Message", "Priority", "Retry Count"],
            createdDate: "May 20, 2023"
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-100">
            <div className="">
                {/* Header */}
                <div className="mb-6 bg-white p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white bg-amber-500">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
                                <p className="text-sm text-gray-500 mt-1">Alert users and teams with automated notifications</p>
                            </div>
                        </div>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Action
                        </Button>
                    </div>
                </div>                  

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                    {cards.map((card, index) => {
                        const CardIcon = card.icon;
                        return (
                            <Card key={index} className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                                <CardIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{card.title}</h3>
                                                <Badge className={`${
                                                    card.status === "Active" 
                                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        card.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                                                    }`}></div>
                                                    {card.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                        {card.description}
                                    </p>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Bell className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Required Parameters</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {card.parameters.map((param, paramIndex) => (
                                                    <Badge key={paramIndex} variant="outline" className="text-xs">
                                                        {param}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <CalendarDays className="h-3 w-3 text-gray-400" />
                                                    <span>Created {card.createdDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" className="h-7 px-3 text-amber-700 bg-amber-50 hover:bg-amber-100">
                                                        <Edit className="h-3 w-3 mr-1.5" />
                                                        Edit
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500 hover:bg-red-50">
                                                        <Trash className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SendNotificationView; 