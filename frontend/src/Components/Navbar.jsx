import React from 'react';
import { Link } from 'react-router-dom';
import About from './about';
const Navbar = () => {
  return (
    <div className="bg-black shadow-md p-4 flex justify-between items-center">
 
      <h1 className="text-2xl font-bold text-white tracking-wide hover:text-gray-300 transition-colors duration-300">
        IQRS
      </h1>

      
      <div className="space-x-8 flex">
        {[
          { name: "Home", path: "/" },
          { name: "Try Demo", path: "/main" },
          { name: "About Us", path: "/about" }
        ].map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="text-white relative group transition-colors duration-300"
          >
            {item.name}
          
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-300"></span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;
