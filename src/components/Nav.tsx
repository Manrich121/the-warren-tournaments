'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mainLinks = [
  { href: '/', label: 'Home' },
  { href: '/leagues', label: 'Leagues' },
  { href: '/events', label: 'Events' }
];

const mobileMenuLinks = [
  { href: '/matches', label: 'Matches' },
  { href: '/players', label: 'Players' }
];

const allLinks = [...mainLinks, ...mobileMenuLinks];

export function Nav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="flex items-center justify-between">
        {/* Main navigation links */}
        <div className="flex space-x-8">
          {/* Show main links on mobile, all links on desktop */}
          {mainLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === link.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {/* Desktop-only links */}
          {mobileMenuLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden sm:block py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === link.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t bg-background">
          {mobileMenuLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-4 font-medium text-sm ${
                pathname === link.href
                  ? 'text-primary bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
