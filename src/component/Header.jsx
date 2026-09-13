import React from "react";
import logo from '/logo.svg';
import nasa from '/nasa.svg';

export default function Header() {
  return (
    <header className="w-full bg-transparent border-b border-slate-700/60 py-4 px-6 sm:px-12 flex justify-center gap-10 items-center relative z-20">
      <img 
        src={logo} 
        alt="App Logo" 
        className="h-6 sm:h-7 w-auto object-contain" 
      />
      
      <img 
        src={nasa} 
        alt="NASA Logo" 
        className="h-6 sm:h-8 w-auto object-contain" 
      />
    </header>
  );
}