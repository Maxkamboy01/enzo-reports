import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import styles from './AppLayout.module.css';

const SIDEBAR_FULL = 240;
const SIDEBAR_COLLAPSED = 56;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = () => {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem('sidebar_collapsed', next);
      return next;
    });
  };

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL;

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={styles.main} style={{ '--sidebar-w': sidebarW + 'px' }}>
        <Header onMenuOpen={() => setMobileOpen(true)} sidebarW={sidebarW} />
        <main className={styles.content}>
          <div className={styles.inner}>
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
