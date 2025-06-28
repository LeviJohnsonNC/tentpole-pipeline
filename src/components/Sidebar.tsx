import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Plus, 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  CircleDollarSign,
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
  UserPlus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: string;
  active: boolean;
  children?: Omit<MenuItem, 'children' | 'icon'>[];
}

const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    // Auto-expand Sales if user is on requests, quotes, or sales routes
    if (location.pathname.startsWith('/requests') || 
        location.pathname.startsWith('/quotes') || 
        location.pathname.startsWith('/sales')) {
      return ['sales'];
    }
    return [];
  });

  const menuItems: MenuItem[] = [
    { id: "create", label: "Create", icon: Plus, path: "/create", active: false },
    { id: "home", label: "Home", icon: Home, path: "/home", active: false },
    { id: "schedule", label: "Schedule", icon: Calendar, badge: "New", path: "/schedule", active: false },
    { id: "clients", label: "Clients", icon: Users, path: "/clients", active: true },
    { 
      id: "sales", 
      label: "Sales", 
      icon: CircleDollarSign, 
      path: "/sales", 
      active: true,
      children: [
        { id: "requests", label: "Requests", path: "/requests", active: true },
        { id: "quotes", label: "Quotes", path: "/quotes", active: true }
      ]
    },
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

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getIsActive = (item: MenuItem | Omit<MenuItem, 'children' | 'icon'>) => {
    // Only check for active state if the item is actually active
    if (!item.active) return false;
    
    // Exact path match
    if (location.pathname === item.path) {
      return true;
    }
    
    // Special cases for sub-routes
    if (item.id === "requests" && location.pathname.startsWith("/requests")) {
      return true;
    }
    
    if (item.id === "clients" && location.pathname.startsWith("/clients")) {
      return true;
    }
    
    // Sales should only be active if on /sales exactly, not on child routes
    if (item.id === "sales" && location.pathname === "/sales") {
      return true;
    }
    
    if (item.id === "quotes" && location.pathname.startsWith("/quotes")) {
      return true;
    }
    
    return false;
  };

  const isParentActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some(child => getIsActive(child));
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = getIsActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const parentActive = isParentActive(item);

    if (!item.active) {
      return (
        <li key={item.id}>
          <div className="w-full flex items-center px-3 py-2 text-sm rounded-lg cursor-not-allowed opacity-50">
            <Icon className="h-4 w-4 mr-3 text-gray-400" />
            <span className="flex-1 text-left text-gray-400">{item.label}</span>
            {item.badge && (
              <Badge className="ml-2 bg-gray-300 text-gray-500 text-xs px-2 py-0.5">
                {item.badge}
              </Badge>
            )}
          </div>
        </li>
      );
    }

    if (hasChildren) {
      return (
        <li key={item.id}>
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
            <div className="flex items-center">
              <Link
                to={item.path}
                className={`flex-1 flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
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
              <CollapsibleTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <ul className="ml-6 mt-1 space-y-1">
                {item.children?.map((child) => (
                  <li key={child.id}>
                    <Link
                      to={child.path}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        getIsActive(child)
                          ? "bg-[#d4edda] text-[#155724]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex-1 text-left">{child.label}</span>
                      {child.badge && (
                        <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5">
                          {child.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </li>
      );
    }

    return (
      <li key={item.id}>
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
      </li>
    );
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
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
