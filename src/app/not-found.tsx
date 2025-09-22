import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The page you&#39;re looking for doesn&#39;t exist or the player ID is invalid.
            </p>
            <Link href="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
