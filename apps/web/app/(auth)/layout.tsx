import React from 'react'

const AuthLayout = ({children}: Readonly<{children: React.ReactNode}>) => {
  return (
    <div>
      <nav className="">
        
      </nav>
      {children}
    </div>
  )
}

export default AuthLayout