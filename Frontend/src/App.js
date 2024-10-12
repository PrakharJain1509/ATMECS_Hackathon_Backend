import React from 'react';
import CodeEditor from './components/CodeEditor';

function App() {
  return (
    <div className="App">
      <header className="p-4">
        <h1 className="text-2xl font-bold mb-4">AI Code Completer</h1>
      </header>
      <main>
        <CodeEditor />
      </main>
    </div>
  );
}

export default App;