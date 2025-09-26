'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/leagues', label: 'Leagues' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/matches', label: 'Matches' },
  { href: '/admin/players', label: 'Players' }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-8 border-b">
      {links.map(link => (
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
    </nav>
  );
}
