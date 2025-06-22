
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Plus, 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Briefcase, 
  Receipt, 
  TrendingUp, 
  Bot, 
  BarChart3, 
  CreditCard, 
  Clock, 
  MessageSquare, 
  Grid3X3, 
  UserPlus 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { id: "create", label: "Create", icon: Plus, hasAction: true, path: "/" },
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "schedule", label: "Schedule", icon: Calendar, badge: "New", path: "/schedule" },
    { id: "clients", label: "Clients", icon: Users, path: "/clients" },
    { id: "requests", label: "Requests", icon: FileText, path: "/" },
    { id: "quotes", label: "Quotes", icon: DollarSign, path: "/quotes" },
    { id: "jobs", label: "Jobs", icon: Briefcase, path: "/jobs" },
    { id: "invoices", label: "Invoices", icon: Receipt, path: "/invoices" },
    { id: "marketing", label: "Marketing", icon: TrendingUp, path: "/marketing" },
    { id: "ai-receptionist", label: "AI Receptionist", icon: Bot, path: "/ai-receptionist" },
    { id: "insights", label: "Insights", icon: BarChart3, path: "/insights" },
    { id: "expenses", label: "Expenses", icon: CreditCard, path: "/expenses" },
    { id: "timesheets", label: "Timesheets", icon: Clock, path: "/timesheets" },
    { id: "community", label: "Community", icon: MessageSquare, path: "/community" },
    { id: "apps", label: "Apps", icon: Grid3X3, path: "/apps" },
    { id: "refer", label: "Refer a friend", icon: UserPlus, path: "/refer" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#0B6839] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="font-semibold text-gray-900">Jobber</span>
        </div>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#0B6839] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${item.hasAction ? "bg-[#0B6839] text-white" : ""}`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
