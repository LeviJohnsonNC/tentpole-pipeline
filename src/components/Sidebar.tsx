
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
    { id: "create", label: "Create", icon: Plus, path: "/create", active: false },
    { id: "home", label: "Home", icon: Home, path: "/home", active: false },
    { id: "schedule", label: "Schedule", icon: Calendar, badge: "New", path: "/schedule", active: false },
    { id: "clients", label: "Clients", icon: Users, path: "/clients", active: true },
    { id: "requests", label: "Requests", icon: FileText, path: "/", active: true },
    { id: "quotes", label: "Quotes", icon: DollarSign, path: "/quotes", active: true },
    { id: "jobs", label: "Jobs", icon: Briefcase, path: "/jobs", active: false },
    { id: "invoices", label: "Invoices", icon: Receipt, path: "/invoices", active: false },
    { id: "marketing", label: "Marketing", icon: TrendingUp, path: "/marketing", active: false },
    { id: "ai-receptionist", label: "AI Receptionist", icon: Bot, path: "/ai-receptionist", active: false },
    { id: "insights", label: "Insights", icon: BarChart3, path: "/insights", active: false },
    { id: "expenses", label: "Expenses", icon: CreditCard, path: "/expenses", active: false },
    { id: "timesheets", label: "Timesheets", icon: Clock, path: "/timesheets", active: false },
    { id: "community", label: "Community", icon: MessageSquare, path: "/community", active: false },
    { id: "apps", label: "Apps", icon: Grid3X3, path: "/apps", active: false },
    { id: "refer", label: "Refer a friend", icon: UserPlus, path: "/refer", active: false },
  ];

  const getIsActive = (item: any) => {
    // Only check for active state if the item is actually active
    if (!item.active) return false;
    
    // Exact path match
    if (location.pathname === item.path) {
      return true;
    }
    
    // Special cases for sub-routes
    if (item.id === "requests" && (location.pathname.startsWith("/requests") || location.pathname === "/")) {
      return true;
    }
    
    if (item.id === "clients" && location.pathname.startsWith("/clients")) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="w-64 bg-[#f8f9fa] border-r border-gray-200 h-screen flex flex-col">
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
            const isActive = getIsActive(item);
            
            return (
              <li key={item.id}>
                {item.active ? (
                  <Link
                    to={item.path}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#d4edda] text-[#155724]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ) : (
                  <div
                    className="w-full flex items-center px-3 py-2 text-sm rounded-lg cursor-not-allowed opacity-50"
                  >
                    <Icon className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="flex-1 text-left text-gray-400">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-2 bg-gray-300 text-gray-500 text-xs px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
