import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const SignInPage = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex h-full flex-col items-center justify-center gap-y-8 px-4">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold text-[#2E2A47]">Selamat Datang!</h1>
          <p className="text-base text-[#7E8CA0]">
            Masuk atau buat akun untuk kembali ke dasbor.
          </p>
        </div>
        <ClerkLoaded>
          <SignIn path="/sign-in" />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2 className="animate-spin text-muted-foreground" />
        </ClerkLoading>
      </div>
      <div className="hidden h-full items-center justify-center bg-blue-600 lg:flex">
        <Image src="/logo.svg" alt="Logo" height={100} width={100} />
      </div>
    </div>
  );
};

export default SignInPage;
