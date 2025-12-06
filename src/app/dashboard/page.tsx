import { Dashboard } from '@/components/dashboard';
import Image from 'next/image';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 py-8 sm:p-8 md:p-16">
      <div className="w-full max-w-7xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/medlatec-logo.png"
            alt="Medlatec Logo"
            width={100}
            height={100}
            className="mb-4"
          />
          <h1 className="font-headline text-3xl font-bold text-foreground sm:text-4xl">
            Dashboard Tổng Hợp Kế Hoạch 2026
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Tổng hợp kết quả từ các đơn vị đã điền form
          </p>
        </header>
        <Dashboard />
      </div>
    </main>
  );
}


