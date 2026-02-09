// src/layouts/GuestLayout.tsx
import { Outlet } from 'react-router-dom';
import MagicalHeader from '@/components/layouts/includes/MagicalHeader';
import MagicalFooter from '@/components/layouts/includes/MagicalFooter';
import HeaderPortal from '@/components/HeaderPortal';

const GuestLayout = () => {
  return (
    <div className="flex flex-col">
      <HeaderPortal>
        <MagicalHeader />
      </HeaderPortal>
      <main className="flex-1">
        <Outlet />
      </main>
      <MagicalFooter />
    </div>
  );
};

export default GuestLayout;