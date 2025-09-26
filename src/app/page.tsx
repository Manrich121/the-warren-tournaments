import { Header } from '@/components/Header';
import { Leaderboard } from '@/components/Leaderboard';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Leaderboard />
      </main>
    </>
  );
}
