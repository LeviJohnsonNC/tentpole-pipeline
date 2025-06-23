
import CommonHeader from "@/components/CommonHeader";
import Sidebar from "@/components/Sidebar";
import NewQuoteForm from "@/components/NewQuoteForm";

const NewQuote = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <CommonHeader />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">New quote</h1>
          </div>
          
          <div className="max-w-4xl">
            <NewQuoteForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewQuote;
