import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Menu, X, Phone, Plus, User, LogOut, LayoutDashboard, CalendarDays } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/departments', label: 'Departments' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
            <div className="w-9 h-9 rounded-xl bg-medical-blue flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <span className="font-heading font-bold text-lg text-foreground hidden sm:block">
              Lumina <span className="text-medical-blue">Medical</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-medical-blue bg-medical-blue/5'
                    : 'text-slate-600 hover:text-medical-blue hover:bg-slate-50'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+15550100" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-medical-blue transition-colors" data-testid="emergency-phone">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Emergency</span>
            </a>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full gap-2" data-testid="user-menu-trigger">
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{user.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2" data-testid="admin-dashboard-link">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'patient' && (
                    <DropdownMenuItem asChild>
                      <Link to="/portal" className="flex items-center gap-2" data-testid="patient-portal-link">
                        <CalendarDays className="w-4 h-4" /> Patient Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600" data-testid="logout-btn">
                    <LogOut className="w-4 h-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" data-testid="login-link">
                <Button variant="outline" className="rounded-full">Login</Button>
              </Link>
            )}

            <Link to="/appointment" data-testid="book-appointment-nav">
              <Button className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white shadow-lg shadow-medical-blue/20 gap-2">
                <CalendarDays className="w-4 h-4" />
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/appointment" data-testid="book-appointment-mobile">
              <Button size="sm" className="rounded-full bg-medical-blue hover:bg-medical-blue-dark text-white text-xs">
                Book
              </Button>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.href) ? 'text-medical-blue bg-medical-blue/5' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t my-3" />
                  {user ? (
                    <>
                      <Link to={user.role === 'admin' ? '/admin' : '/portal'} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                        {user.role === 'admin' ? 'Admin Dashboard' : 'Patient Portal'}
                      </Link>
                      <button onClick={() => { logout(); setOpen(false); }} className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-medical-blue hover:bg-medical-blue/5">
                      Login / Register
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
