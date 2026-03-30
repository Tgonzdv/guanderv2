import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const session = token ? verifyToken(token) : null;

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--guander-cream)' }}>
      <AdminNavbar adminName={session.email} adminRole={session.role} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
