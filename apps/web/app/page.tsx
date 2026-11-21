import React from 'react'
import Navbar from '../components/landingpage/navbar';
import StudentsHero from '../components/landingpage/for-students';

const HomePage = () => {
  return (
    <div>
      <nav className="">
        <Navbar />
      </nav>
      <main className=''>
        <StudentsHero />
      </main>
    </div>
  )
}

export default HomePage