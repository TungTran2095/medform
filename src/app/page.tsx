import { PlanForm } from '@/components/plan-form';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 py-16 sm:p-8 md:p-24">
      <div className="w-full max-w-5xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/medlatec-logo.png"
            alt="Medlatec Logo"
            width={120}
            height={120}
            className="mb-4"
          />
          <h1 className="font-headline text-4xl font-bold text-foreground sm:text-5xl">
            Kế hoạch 2026
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Điền vào biểu mẫu để gửi kế hoạch năm 2026 của đơn vị bạn.
          </p>
        </header>
        <PlanForm />
      </div>
    </main>
  );
}
