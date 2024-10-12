import React, { useState, useEffect } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python'; // For Python syntax highlighting
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Button from './ui/button';

const CodeEditor = () => {
  const [code, setCode] = useState(''); // User-written code
  const [description, setDescription] = useState(''); // Description of the code
  const [completedCode, setCompletedCode] = useState(''); // AI-completed code
  const [showCompletedCode, setShowCompletedCode] = useState(false); // Controls visibility of the completed code block

  // The block to ignore
  const blockToIgnore = "Description and Prediction: This code defines a simple calculator function that takes user input for a mathematical operation and two numbers, then performs the chosen operation and displays the result. It appears to be a basic implementation of a command-line calculator for a beginner programming exercise or tutorial.";

  // Function to filter the description
  const filterDescription = (text) => {
    if (text.startsWith(blockToIgnore)) {
      return text.slice(blockToIgnore.length).trim();
    }
    return text;
  };

  // Function to format the description with bold headings and normal text
  const formatDescription = (text) => {
    // Split the text into lines
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check if the line contains headings with bold text
      const boldTextPattern = /(\*\*[^*]+\*\*)/g; // Matches text wrapped in ** **
      const parts = line.split(boldTextPattern); // Split the line into parts based on the bold pattern
      return (
        <div key={index}>
          {parts.map((part, i) =>
            part.match(boldTextPattern) ? ( // If the part matches the bold pattern
              <strong key={i}>{part.replace(/\*\*/g, '')}</strong> // Render bold and remove the asterisks
            ) : (
              part // Render normal text
            )
          )}
          <br /> {/* Add line break after each line */}
        </div>
      );
    });
  };

  // Function to analyze code using the /describe_code endpoint
  const analyzeCode = async (newCode) => {
    try {
      const response = await fetch('https://prakharjain1509.pythonanywhere.com/describe_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: newCode }),
      });
      const data = await response.json();
      // Filter the description to ignore the specific block
      setDescription(filterDescription(data.description));
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
  };

  // Function to complete the code using the /complete_code endpoint
  const completeCode = async () => {
    try {
      const response = await fetch('https://prakharjain1509.pythonanywhere.com/complete_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setCompletedCode(data.completed_code);
      setShowCompletedCode(true); // Show the completed code block
    } catch (error) {
      console.error('Error completing code:', error);
    }
  };

  // Replace the user's code with the completed code
  const replaceCode = () => {
    setCode(completedCode);
    setCompletedCode(''); // Clear the completed code after replacement
    setShowCompletedCode(false); // Hide the completed code block
  };

  // Initialize CodeMirror editor
  const { setContainer } = useCodeMirror({
    value: code,
    extensions: [python()], // Using Python syntax highlighting
    onChange: (value) => setCode(value), // Update code state on change
  });

  // Trigger code analysis after 500ms of stopping typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeCode(code);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [code]);

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1" style={{ flexBasis: '70%' }}>
        <Card className="card h-full">
          <CardHeader className="card-header">
            <CardTitle className="card-title">Code Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={setContainer} className="h-[400px]" />
          </CardContent>
        </Card>
      </div>

      {/* Completed Code block (conditionally rendered) */}
      {showCompletedCode && (
        <div className="flex-1" style={{ flexBasis: '70%' }}>
          <Card className="card h-full">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Completed Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto bg-gray-100 p-2">
                <pre>{completedCode}</pre>
              </div>
              <Button className="button mt-4" onClick={replaceCode} style={{ width: '100px' }}>
                Replace Code
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Code Description */}
      <div className="flex-1" style={{ flexBasis: '30%' }}>
        <Card className="card h-full">
          <CardHeader className="card-header">
            <CardTitle className="card-title">Code Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto">
              {description ? formatDescription(description) : 'Code description will appear here...'}
            </div>
            {/* Button to trigger code completion */}
            {!showCompletedCode && (
              <div className="flex justify-center w-full">
                <Button className="button" onClick={completeCode} style={{ width: '100px' }}>
                  Complete this Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeEditor;
