import React from 'react';
import { Outlet } from 'react-router-dom';
import { BcvBanner } from './BcvBanner';
import { Navbar } from './Navbar';
import { OrderReservationBanner } from './OrderReservationBanner';
import { Footer } from './Footer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <BcvBanner />
      <Navbar />
      <OrderReservationBanner />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
