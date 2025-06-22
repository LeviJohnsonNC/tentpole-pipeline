import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Bell, MessageCircle, Settings, Edit2, MoreHorizontal, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from "@/components/Sidebar";
import { useClientStore } from "@/store/clientStore";
import { useRequestStore } from "@/store/requestStore";
import { getRequestById, getClientById } from "@/utils/dataHelpers";
import { Request } from "@/types/Request";
import { Client } from "@/types/Client";

const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessionClients } = useClientStore();
  const { sessionRequests, updateSessionRequest } = useRequestStore();
  
  const [request, setRequest] = useState<Request | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequest, setEditedRequest] = useState<Request | null>(null);

  useEffect(() => {
    if (id) {
      const foundRequest = getRequestById(id, sessionRequests);
      if (foundRequest) {
        setRequest(foundRequest);
        setEditedRequest(foundRequest);
        const foundClient = getClientById(foundRequest.clientId, sessionClients);
        setClient(foundClient || null);
      }
    }
  }, [id, sessionRequests, sessionClients]);

  const handleSave = () => {
    if (editedRequest && id) {
      updateSessionRequest(id, editedRequest);
      setRequest(editedRequest);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedRequest(request);
    setIsEditing(false);
  };

  const handleConvertToQuote = () => {
    if (request && client) {
      navigate(`/quotes/new?requestId=${request.id}&clientId=${client.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!request || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Request not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-600">GROW QA 1</div>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  /
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <MessageCircle className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-4 w-4 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center p-0">
                  20
                </Badge>
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <MoreHorizontal className="h-4 w-4" />
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-white">
                        <DropdownMenuItem onClick={handleConvertToQuote}>
                          Convert to Quote
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Title Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {isEditing ? (
                      <Input
                        value={editedRequest?.title || ''}
                        onChange={(e) => setEditedRequest(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="text-2xl font-bold text-gray-900 border-0 p-0 focus:ring-0"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>Requested</span>
                    <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Client Information */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>{client.primaryAddress}</p>
                      <p>{client.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Overview Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Overview</h3>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isEditing ? (
                      <Textarea
                        value={editedRequest?.serviceDetails || ''}
                        onChange={(e) => setEditedRequest(prev => prev ? {...prev, serviceDetails: e.target.value} : null)}
                        className="min-h-[100px]"
                        placeholder="Describe the service request in detail..."
                      />
                    ) : (
                      <p className="text-gray-600">{request.serviceDetails}</p>
                    )}
                  </CardContent>
                </Card>

                {/* On-site Assessment Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">On-site assessment</h3>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <Copy className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Visit the property to assess the job before you do the work</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center space-x-3">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Notes Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isEditing ? (
                      <Textarea
                        value={editedRequest?.notes || ''}
                        onChange={(e) => setEditedRequest(prev => prev ? {...prev, notes: e.target.value} : null)}
                        placeholder="Leave an internal note for yourself or a team member"
                        className="min-h-[120px] border-0 p-0 resize-none focus:ring-0"
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p className="text-sm">Leave an internal note for yourself or a team member</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestDetails;
