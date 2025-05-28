import ProtectedRoute from "@/components/ProtectedRoute";
import ChatPage from "@/sections/Chat";

export default function Home() {
  return (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  );
}
