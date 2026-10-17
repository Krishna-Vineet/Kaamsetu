import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="min-h-screen w-full max-w-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;