'use client';
import { useState } from 'react';

export default function TestPage() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">FAB Test</h1>
      <button onClick={() => alert('Test button works!')} className="px-4 py-2 bg-primary rounded">
        Test Button
      </button>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-secondary rounded-full shadow-xl"
        style={{ zIndex: 999999 }}
      >
        <span className="material-symbols-outlined text-2xl">psychology</span>
      </button>
      {isOpen && <div className="fixed bottom-24 right-6 w-96 h-96 bg-surface-container rounded-xl p-4" style={{ zIndex: 999999 }}>Chat works!</div>}
    </div>
  );
}
