import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Chitchat</h1>
      </div>
    </ProtectedRoute>
  );
}
