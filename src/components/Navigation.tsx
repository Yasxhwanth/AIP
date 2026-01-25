import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <div className="navigation py-2 px-4 bg-gray-800 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Enterprise Ontology Platform</Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/" 
                className="hover:text-blue-300 transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/demo" 
                className="hover:text-blue-300 transition-colors"
              >
                Guided Demo
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navigation;