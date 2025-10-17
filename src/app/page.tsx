import Main from "@/components/Main";
import Sidebar from "@/components/common/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Main />
      </main>
    </div>
  );
}
