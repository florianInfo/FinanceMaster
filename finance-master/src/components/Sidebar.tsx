'use client';

import { useState } from 'react';
import {
  Menu,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  PiggyBank,
  CalendarClock,
  BadgeDollarSign,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/logo-bnc.jpg';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: CreditCard },
    { href: '/statistics', label: 'Statistiques', icon: BarChart3 },
    { href: '/investments', label: 'Investissements', icon: PiggyBank },
    { href: '/previsions', label: 'Prévisions', icon: CalendarClock },
    { href: '/budget', label: 'Budgets', icon: BadgeDollarSign },
  ];

  return (
    <aside
      className={`h-full border-r shadow-sm transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Image src={logo} alt="logo-bnc" width={30} height={30} />
            <span className="font-semibold text-sm">FinanceMaster</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 flex-grow">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex text-xl items-center gap-3 px-3 py-2 rounded hover:bg-(--color-primary) hover:text-(--color-text-hover) transition"
          >
            <Icon size={24}/>
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Paramètres en bas */}
      <div className="p-2 border-t mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-(--color-primary) hover:text-(--color-text-hover) transition"
        >
          <Settings size={20} />
          {!collapsed && <span>Paramètres</span>}
        </Link>
      </div>
    </aside>
  );
}
