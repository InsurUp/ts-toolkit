import { Routes, Route } from 'react-router';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Callback } from '@/pages/Callback';
import { CustomerTable } from '@/pages/CustomerTable';
import { CustomerTableInfinite } from '@/pages/CustomerTableInfinite';

function App(): React.ReactElement {
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
            <Route path="/customers" element={<CustomerTable />} />
            <Route path="/customers-infinite" element={<CustomerTableInfinite />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
