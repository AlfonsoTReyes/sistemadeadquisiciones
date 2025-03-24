"use client";

import Link from 'next/link';
import Image from "next/image";
import logoSJR from "../public/logo_sanjuan.png";

export default function Menu() {
  return (
    <nav className="bg-custom-color border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/#">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src={logoSJR.src} alt="Logo" width={150} height={40} priority />
          </div>
        </Link>
        <p className="self-center text-center font-semibold whitespace-nowrap text-white">Adquisiciones</p>
      </div>
    </nav>
  );
}
