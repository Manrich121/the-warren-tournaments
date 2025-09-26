import { AdminNav } from '@/components/AdminNav';
import { Header } from '@/components/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-8 space-y-6">
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
