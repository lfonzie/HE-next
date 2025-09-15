import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function ChatLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?error=unauthenticated');
  }

  return <>{children}</>;
}
