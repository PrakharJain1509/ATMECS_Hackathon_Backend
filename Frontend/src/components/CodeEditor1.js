import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { Card, CardContent, CardHeader, CardTitle } from './ui1/card';
import Button from './ui1/button';
import { motion } from 'framer-motion';
import { Loader2, Copy, Check } from 'lucide-react';

const CodeEditor1 = () => {
  const [codeType, setCodeType] = useState('competitive_programming');
  const [description, setDescription] = useState('');
  const [generatedCode, setGeneratedCode] = useState({});
  const [loading, setLoading] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});

  const handleSubmit = async () => {
    setLoading(true);
    setGeneratedCode({});
    try {
      const response = await fetch('https://prakharjain1509.pythonanywhere.com/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: codeType, description }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGeneratedCode(data);
    } catch (error) {
      console.error('Error generating code:', error);
      setGeneratedCode({ error: 'Error generating code. Please try again.' });
    }
    setLoading(false);
  };


  const getLanguage = (type) => {
    switch (type) {
      case 'cpp': return cpp();
      case 'python': return python();
      case 'javascript': return javascript();
      case 'html': return html();
      case 'css': return css();
      default: return cpp();
    }
  };

  const decodeHtmlEntities = (text) => {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    });
  };

  const renderCodeBlock = (code, language, key) => {
    let decodedCode = code;
    
    try {
      const parsedCode = JSON.parse(code);
      if (codeType === 'competitive_programming' && parsedCode.code) {
        decodedCode = decodeHtmlEntities(parsedCode.code);
      } else {
        decodedCode = decodeHtmlEntities(JSON.stringify(parsedCode, null, 2));
      }
    } catch (error) {
      console.error('Error parsing or decoding code:', error);
      decodedCode = decodeHtmlEntities(code);
    }

    return (
      <div className="relative">
        <CodeMirror
          value={decodedCode}
          height="300px"
          extensions={[getLanguage(language)]}
          theme="dark"
          editable={false}
        />
        <Button
          onClick={() => copyToClipboard(decodedCode, key)}
          className="absolute top-2 right-2 p-1"
          variant="outline"
          size="sm"
        >
          {copiedStates[key] ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  };

  const renderGeneratedCode = () => {
    if (codeType === 'web_development') {
      return (
        <div className="space-y-4 w-full">
          {['html', 'css', 'js'].map((lang) => (
            <Card key={lang} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-bold uppercase">{lang}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderCodeBlock(generatedCode[lang] || '', lang, lang)}
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else if (codeType === 'competitive_programming') {
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Generated Code</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCodeBlock(generatedCode.code || '', 'cpp', 'competitive')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {generatedCode.test_cases?.join('\n')}
                </pre>
                <Button
                  onClick={() => copyToClipboard(generatedCode.test_cases?.join('\n') || '', 'testCases')}
                  className="absolute top-0.5 right-2 p-1"
                  variant="outline"
                  size="sm"
                >
                  {copiedStates['testCases'] ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    } else {
      return (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Generated Code</CardTitle>
          </CardHeader>
          <CardContent>
            {renderCodeBlock(generatedCode.code || '', 'python', 'aiml')}
          </CardContent>
        </Card>
      );
    }
  };
  const isWebDevelopment = codeType === 'web_development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
      >
        <div className={`p-8 ${isWebDevelopment ? 'space-y-8' : 'grid grid-cols-1 md:grid-cols-2 gap-8'}`}>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-600">Input</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={codeType}
                onChange={(e) => setCodeType(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <option value="competitive_programming">Competitive Programming</option>
                <option value="ai_ml">AI/ML</option>
                <option value="web_development">Web Development</option>
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter code description..."
                className="w-full p-2 mb-4 border rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full transition duration-200 transform hover:scale-105 relative"
              >
               {loading ? 'Generating...' : 'Generate Code'}
              </Button>
            </CardContent>
          </Card>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={isWebDevelopment ? 'w-full' : 'overflow-y-auto max-h-[calc(100vh-200px)]'}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-blue-500"
                >
                  <Loader2 className="h-16 w-16 animate-spin" />
                </motion.div>
              </div>
            ) : (
              renderGeneratedCode()
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CodeEditor1;