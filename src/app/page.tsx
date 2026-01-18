import { getRandomContent } from '@/lib/content';
import ClientView from './components/ClientView';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialContent = await getRandomContent();

  return (
    <main>
      <ClientView initialContent={initialContent} />
    </main>
  );
}
