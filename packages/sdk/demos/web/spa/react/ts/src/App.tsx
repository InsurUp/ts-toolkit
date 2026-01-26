import { Routes, Route } from "react-router";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Home } from "@/pages/Home";
import { Callback } from "@/pages/Callback";
import { Profile } from "@/pages/Profile";
import { CustomerList } from "@/pages/customers/CustomerList";
import { CustomerDetail } from "@/pages/customers/CustomerDetail";
import { PolicyList } from "@/pages/policies/PolicyList";
import { PolicyDetail } from "@/pages/policies/PolicyDetail";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/policies" element={<PolicyList />} />
            <Route path="/policies/:id" element={<PolicyDetail />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
