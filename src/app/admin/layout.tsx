
import { AdminNav } from '@/components/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="container mx-auto py-8 space-y-6">
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
