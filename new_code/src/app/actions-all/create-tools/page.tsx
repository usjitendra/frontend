"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash,
  Bell,
  Users,
  Mail,
  MessageSquare,
  CalendarDays,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
const baseUrl = process.env.NEXT_PUBLIC_API_URL_TOOLS;

const CreateToolsPage = () => {
  const router = useRouter();
  const [tools, setTools] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 Edit Function
  const handleEdit = (card: any) => {
    console.log("card", card);
    const params = new URLSearchParams({
      actionId: JSON.stringify(card),
      atype: "Edit",
    });
    router.push(`/actions-all/create-tools/create?${params.toString()}`);
  };

  const fetchTools = async () => {
    try {
      // console.log("Fetching all tools...");
      const response = await axios.get(`${baseUrl}tools`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });

      // console.log("Tools Data:", response?.data?.tools);
      if (response.data?.tools) {
        setIsLoading(false);
        setTools(response.data.tools);

        const cardsData = response.data.tools.map(
          (tool: any, index: number) => {
            const parameters = tool?.body?.properties
              ? Object.keys(tool.body.properties)
              : [];

            return {
              id: index + 1,
              title: tool?.name || "Untitled Tool",
              description: tool?.description || "No description available",
              icon: Bell, // default icon (can make dynamic later)
              iconBg: "from-amber-500 to-amber-600",
              status: "Active",
              firestore_doc_id: tool?.firestore_doc_id || "",
              url: tool?.url || "",
              method: tool?.method || "GET",
              parameters, // dynamic parameters
              createdDate: new Date().toDateString(),
            };
          }
        );

        setCards(cardsData);
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []); // Only run once on mount

  // 🟥 Delete Function
  type ToolId = {
    firestore_doc_id: string;
  };

  const handleDelete = async (tool: ToolId) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        console.log("Deleting item with ID:", tool.firestore_doc_id);

        const result = await axios.delete(
          `${baseUrl}tools/${tool.firestore_doc_id}`
        );

        if (result.data.status === "success") {
          toast({
            title: "Tools deleted successfully!",
          });

          fetchTools();
        } else {
          toast({
            title: "Failed to delete item",
            description: result.data.message || "Something went wrong",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">All Tools</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Alert users and teams with automated notifications
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/actions-all/create-tools/create")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Tool
            </Button>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
          {cards?.map((card) => {
            const CardIcon = card.icon;
            return (
              <Card
                key={card.id}
                className="group hover:shadow-lg hover:border-amber-200 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 bg-gradient-to-br ${card.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
                      >
                        <CardIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {card.title.length > 15
                            ? card.title.slice(0, 15) + "..."
                            : card.title}
                        </h3>
                        <Badge
                          className={`${
                            card.status === "Active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              card.status === "Active"
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          ></div>
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
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Required Parameters
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {card.parameters.map(
                          (param: string, paramIndex: number) => (
                            <Badge
                              key={paramIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {param}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {/* <CalendarDays className="h-3 w-3 text-gray-400" /> */}
                          {/* <span>Created {card.createdDate}</span> */}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEdit(card)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-amber-700 bg-amber-50 hover:bg-amber-100"
                          >
                            <Edit className="h-3 w-3 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(card)}
                          >
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

export default CreateToolsPage;
