import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';

const Navbar = () => {
  return (
    <div className='relative w-full flex items-center justify-between text-sm font-medium px-10 py-8'>
      <div className="text-sm flex items-center justify-center gap-4">
        <Link className='text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors ' href={"/"}><Image src={"/favicon.svg"} alt='examinr ai logo' height={0} width={20} loading='eager' /></Link>
        <Link className='text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors px-2 py-1 ' href={"/credits"}>Credits</Link>
        <Link className='text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors px-2 py-1 ' href={"/for-schools"}>For schools</Link>
        <Link className='text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors px-2 py-1 ' href={"/resources"}>Resources</Link>
      </div>
      <Link className='absolute top-1/2 left-1/2 -translate-1/2' href={"/"}><Image src={"/examinr-logo.svg"} alt='examinr ai logo' height={0} width={150} loading='eager' /></Link>
      <div className="space-x-2 flex items-center gap-1">
        <AnimatedThemeToggler className='mr-2' />
        <Link className='py-3.5 px-5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors' href={"/sign-in"}>Log in</Link>
        <Link className='py-3.5 px-5 rounded-full bg-blue-500 hover:bg-blue-600 transition-all text-white' href={"/sign-up"}>Sign up</Link>
      </div>
    </div>
  )
}

export default Navbar