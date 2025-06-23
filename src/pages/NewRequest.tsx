
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import NewRequestForm from "@/components/NewRequestForm";

const NewRequest = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
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
