
import Sidebar from "@/components/Sidebar";
import NewRequestForm from "@/components/NewRequestForm";

const NewRequest = () => {
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
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">New Request</h1>
          </div>
          
          <div className="max-w-4xl">
            <NewRequestForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewRequest;
