import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from './components/CodeEditor';
import CodeEditor1 from './components/CodeEditor1';
import Button from './components/ui/button';

function App() {
  const [currentPage, setCurrentPage] = useState('CodeEditor');

  const togglePage = () => {
    setCurrentPage(currentPage === 'CodeEditor' ? 'CodeEditor1' : 'CodeEditor');
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 font-sans text-gray-900 flex flex-col justify-between shadow-2xl">
      <header className="bg-transparent text-white py-12 px-4 shadow-lg relative z-10">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-center tracking-tight mb-4 drop-shadow-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Code Generation & Completion Chatbot
            </span>
          </h1>
          <p className="mt-3 text-xl md:text-2xl text-center font-light text-blue-100 italic drop-shadow">
            AI-powered code for everyone!
          </p>
        </div>
      </header>
      <main className="container mx-auto p-4 mt-8 flex-grow">
        <div className="bg-transparent rounded-lg shadow-2xl p-6 backdrop-filter backdrop-blur-lg bg-opacity-90">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: currentPage === 'CodeEditor' ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: currentPage === 'CodeEditor' ? 100 : -100 }}
            transition={{ duration: 0.5 }}
          >
            {currentPage === 'CodeEditor' ? <CodeEditor /> : <CodeEditor1 />}
          </motion.div>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={togglePage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            >
              Switch to {currentPage === 'CodeEditor' ? 'Code Generator' : 'Code Completer'}
            </Button>
          </div>
        </div>
      </main>
      <footer className="bg-blue-800 text-white py-6 mt-12 shadow-inner">
        <div className="container mx-auto text-center">
          <p className="text-sm md:text-base font-semibold tracking-wide">
            &copy; ShreeCoders Code Generation Chatbot.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;