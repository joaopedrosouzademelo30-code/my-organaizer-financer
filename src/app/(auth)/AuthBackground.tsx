"use client";
import Spline from '@splinetool/react-spline';
import { Suspense } from 'react';

export function AuthBackground() {
  return (
    <div className="absolute inset-0 w-full h-full opacity-60">
      <Suspense fallback={<div className="flex items-center justify-center w-full h-full text-white/50">Carregando Cena 3D...</div>}>
        <Spline scene="https://prod.spline.design/lMtSPzENZ13SvcMC/scene.splinecode" />
      </Suspense>
    </div>
  );
}
