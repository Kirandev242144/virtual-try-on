'use client';

import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Feed from "../components/Feed";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main>
      <Navbar onSearch={setSearchQuery} />
      <Feed searchQuery={searchQuery} />
    </main>
  );
}
