
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import NewClientForm from "@/components/NewClientForm";

const NewClient = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">New client</h1>
          </div>
          
          <div className="max-w-4xl">
            <NewClientForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewClient;
