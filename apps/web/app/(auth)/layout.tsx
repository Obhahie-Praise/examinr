import Menu from "@/components/ui/animated-menu-btn";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import ThemeImage from "@/components/ui/theme-img";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between py-6 px-10 relative min-h-fit">
        <Link
          href={"/"}
          className="flex items-center gap-2 rounded-full hover:bg-neutral-100 transition-colors dark:hover:bg-neutral-900 px-5 py-2.5 dark:text-white"
        >
          <ArrowLeft size={15} />
          <p className="">back</p>
        </Link>
        <Link className='absolute top-1/2 left-1/2 -translate-1/2' href={"/"}> <ThemeImage lightsrc={"/examinr-lightmode.svg"} darksrc={"/examinr-logo.svg"} alt='examinr ai logo' height={0} width={150} loading='eager' /></Link>
        <AnimatedThemeToggler className="p-2.5  hover:bg-neutral-100 dark:hover:bg-neutral-900 dark:text-neutral-900 transition-colors rounded-full dark:text-white" />
      </nav>
      {children}
      <div className="absolute bottom-10 right-10">
        <Menu />
      </div>
    </div>
  );
};

export default AuthLayout;
