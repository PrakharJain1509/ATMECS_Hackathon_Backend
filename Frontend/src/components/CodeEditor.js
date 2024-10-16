import React, { useState, useEffect } from 'react';
import { useCodeMirror } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Button from './ui/button';
import { Loader2 } from 'lucide-react';

const CodeEditor = () => {
  const [code, setCode] = useState(`# Enter your code here




















`);
  const [description, setDescription] = useState('');
  const [completedCode, setCompletedCode] = useState('');
  const [commentedCode, setCommentedCode] = useState('');
  const [showCompletedCode, setShowCompletedCode] = useState(false);
  const [showCommentedCode, setShowCommentedCode] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const blockToIgnore = "Description and Prediction: This code defines a simple calculator function...";

  const filterDescription = (text) => {
    if (text.startsWith(blockToIgnore)) {
      return text.slice(blockToIgnore.length).trim();
    }
    return text;
  };

  const formatDescription = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const boldTextPattern = /(\*\*[^*]+\*\*)/g;
      const parts = line.split(boldTextPattern);
      return (
        <div key={index}>
          {parts.map((part, i) =>
            part.match(boldTextPattern) ? (
              <strong key={i} className="font-semibold text-indigo-700">{part.replace(/\*\*/g, '')}</strong>
            ) : (
              part
            )
          )}
          <br />
        </div>
      );
    });
  };

  const analyzeCode = async (newCode) => {
    try {
      const response = await fetch('https://prakharjain1509.pythonanywhere.com/describe_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCode }),
      });
      const data = await response.json();
      setDescription(filterDescription(data.description));
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
  };

  const completeCode = async () => {
    setLoadingComplete(true);
    try {
      const response = await fetch('https://prakharjain1509.pythonanywhere.com/complete_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setCompletedCode(data.completed_code);
      setShowCompletedCode(true);
      setShowCommentedCode(false);
    } catch (error) {
      console.error('Error completing code:', error);
    }
    setLoadingComplete(false);
  };

  const commentCode = async () => {
    setLoadingComment(true);
    try {
      const response = await fetch('https://prakharjain1509.pythonanywhere.com/comment_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setCommentedCode(data.commented_code);
      setShowCommentedCode(true);
      setShowCompletedCode(false);
    } catch (error) {
      console.error('Error commenting code:', error);
    }
    setLoadingComment(false);
  };

  const replaceCode = (newCode) => {
    setCode(newCode);
    setCompletedCode('');
    setCommentedCode('');
    setShowCompletedCode(false);
    setShowCommentedCode(false);
  };

  const { setContainer } = useCodeMirror({
    value: code,
    extensions: [python()],
    onChange: (value) => setCode(value),
    theme: 'dark',
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => analyzeCode(code), 500);
    return () => clearTimeout(timeoutId);
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <main className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Card className="h-full shadow-xl rounded-lg overflow-hidden border border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-center text-xl font-bold text-gray-800">Code Editor</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={setContainer} className="h-[400px] overflow-auto bg-gray-900 text-white" />
              </CardContent>
            </Card>
          </div>

          {(showCompletedCode || showCommentedCode) && (
            <div className="flex-1">
              <Card className="h-full shadow-xl rounded-lg overflow-hidden border border-gray-200">
                <CardHeader className="bg-white border-b border-gray-200">
                  <CardTitle className="text-center text-xl font-bold text-gray-800">
                    {showCompletedCode ? 'Completed Code' : 'Commented Code'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[350px] overflow-auto bg-gray-900 p-4 rounded-md">
                    <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                      {showCompletedCode ? completedCode : commentedCode}
                    </pre>
                  </div>
                  <Button
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1"
                    onClick={() => replaceCode(showCompletedCode ? completedCode : commentedCode)}
                  >
                    Replace Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1">
            <Card className="h-full shadow-xl rounded-lg overflow-hidden border border-gray-200">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="text-center text-xl font-bold text-gray-800">Code Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[350px] overflow-auto text-gray-700">
                  {description ? formatDescription(description) : 'Code description will appear here...'}
                </div>
                <div className="mt-4 flex space-x-4">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1"
                    onClick={completeCode}
                    disabled={loadingComplete}
                  >
                    {loadingComplete ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      'Complete this Code'
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1"
                    onClick={commentCode}
                    disabled={loadingComment}
                  >
                    {loadingComment ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      'Comment this Code'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeEditor;
