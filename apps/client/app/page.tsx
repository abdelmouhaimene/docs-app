'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Folder } from '@mui/icons-material';

export default function Home() {
  const [directions, setDirections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/directions`);
        if (!response.ok) throw new Error('Failed to fetch directions');
        const data = await response.json();
        setDirections(data);
      } catch (error) {
        console.error('Error fetching directions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDirections();
  }, []);

  return (
    <div
      className="min-h-screen bg-black py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/bg.webp)' }}
    >
      <div className="min-h-screen bg-black/70">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 pt-8">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="MCA Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-[#eabb1c]">
              MCA Document Management System
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Consultez les informations et documents officiels de MCA
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/documents"
                className="bg-[#eabb1c] hover:bg-[#d4a818] text-black font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Documents
              </Link>
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-[#eabb1c] font-semibold px-8 py-3 rounded-lg transition-all duration-200 border border-[#eabb1c]/30"
              >
                Connexion Admin
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#eabb1c] mb-6 text-center">Nos Directions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/5 h-32 rounded-lg border border-white/10"></div>
                ))
              ) : (
                directions.map((dir) => (
                  <Link
                    key={dir._id}
                    href={`/documents?directionId=${dir._id}`}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center transition-all duration-200 hover:-translate-y-1 hover:bg-white/20 hover:shadow-xl border border-[#eabb1c]/20 group"
                  >
                    <Folder className="text-[#eabb1c] mb-2 group-hover:scale-110 transition-transform" sx={{ fontSize: 32 }} />
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#eabb1c] transition-colors line-clamp-2">
                      {dir.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">{dir.code}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
