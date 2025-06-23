
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import SalesPipeline from "@/components/SalesPipeline";

const Sales = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <CommonHeader showResetButton={true} />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Sales Pipeline</h1>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <SalesPipeline />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sales;
