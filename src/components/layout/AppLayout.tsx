import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Menu,
  X,
  Plus,
  CheckSquare,
  TrendingUp,
  HelpCircle,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/molecules/AccountDropdown';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  onAddHabit?: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar/week', label: 'Weekly', icon: CalendarDays },
  { path: '/calendar/month', label: 'Monthly', icon: CalendarRange },
  { path: '/goals', label: 'Goals', icon: Target },
];

export const AppLayout = ({ children, onAddHabit }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar',
          'hidden lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-7 h-7 text-sidebar-primary" />
                  <span className="font-heading text-xl font-bold text-sidebar-foreground">
                    HabitFlow
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                    'hover:bg-sidebar-accent',
                    isActive(item.path)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          {/* Add Habit Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={onAddHabit}
              variant="success"
              className={cn('w-full', !sidebarOpen && 'px-0')}
            >
              <Plus className="w-5 h-5" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                  >
                    Add Habit
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* Help & Account */}
          <div className="p-4 space-y-2">
            <Link
              to="/help"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium truncate"
                  >
                    Help
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            {sidebarOpen && (
              <div className="px-3 pt-2 border-t border-sidebar-border">
                <AccountDropdown />
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border lg:hidden">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="font-heading text-lg font-bold">HabitFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <AccountDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-deep/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 h-full w-64 bg-sidebar p-4 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                        isActive(item.path)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Help</span>
                </Link>
              </nav>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    onAddHabit?.();
                    setMobileMenuOpen(false);
                  }}
                  variant="success"
                  className="w-full"
                >
                  <Plus className="w-5 h-5" />
                  Add Habit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ paddingLeft: sidebarOpen ? 256 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-screen flex flex-col pt-16 lg:pt-0"
      >
        <div className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">{children}</div>
        <Footer />
      </motion.main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={onAddHabit}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-primary"
          >
            <div className="bg-primary rounded-full p-2">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
};
