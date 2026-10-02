import { Suspense } from 'react';
import { PosterStudio } from '@/components/poster/PosterStudio';

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 font-bengali">স্টুডিও লোড হচ্ছে...</div>}>
      <PosterStudio />
    </Suspense>
  );
}
