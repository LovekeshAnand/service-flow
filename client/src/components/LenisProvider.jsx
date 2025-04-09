'use client';
<<<<<<< HEAD
 
 import { useEffect } from 'react';
 import Lenis from '@studio-freight/lenis';
 
 export default function LenisProvider({ children }) {
   useEffect(() => {
     const lenis = new Lenis({
       duration: 1.2,
       easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
     });
 
     function raf(time) {
       lenis.raf(time);
       requestAnimationFrame(raf);
     }
 
     requestAnimationFrame(raf);
 
     return () => {
       lenis.destroy();
     };
   }, []);
 
   return <>{children}</>;
 }
=======

import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

export default function LenisProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
>>>>>>> 31fae96cfba8fd54524ba8d74dabd5eec25d6b96
