import Image from 'next/image';
import React from 'react'

interface ThemeImageProp {
    lightsrc: string
    darksrc: string
    height: number
    width: number
    alt: string
    loading: "eager" | "lazy"
}

const ThemeImage = ({lightsrc, darksrc, height, width, alt, loading}: ThemeImageProp) => {
  return (
    <div className=''>
        <Image width={width} height={height} src={darksrc} alt={alt} className='hidden dark:block'  loading={loading}/>
        <Image width={width} height={height} src={lightsrc} alt={alt} className='block dark:hidden' loading={loading}/>
    </div>
  )
}

export default ThemeImage