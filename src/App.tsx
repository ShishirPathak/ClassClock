import React, { useState, useRef, useEffect } from "react";
import { Upload, Calendar, Send, Mic, Volume2, StopCircle } from "lucide-react";
import { askGemini, summaryPrompt } from "./utils/geminiService";

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timetableContent, setTimetableContent] = useState<string | undefined>(
    ""
  );
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        handleAskQuestion(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const summarizedTimetableContent = await summaryPrompt(content);

      setTimetableContent(summarizedTimetableContent);
      sessionStorage.setItem("timetableContent", summarizedTimetableContent);
      speak(
        "Timetable uploaded successfully. You can now ask questions about your schedule."
      );
    };
    reader.readAsText(file);
  };

  const handleAskQuestion = async (voiceQuestion?: string) => {
    const questionToAsk = voiceQuestion || question;
    if (!questionToAsk.trim() || !timetableContent) return;

    setLoading(true);

    try {
      // const summarizedTimetableContent = await summaryPrompt(timetableContent);
      const response = await askGemini(
        questionToAsk,
        sessionStorage.getItem("timetableContent")
      );

      // Check if the content exists
      // if (retrievedTimetableContent) {
      //     console.log("Retrieved Timetable Content:", retrievedTimetableContent);
      //     // You can now use retrievedTimetableContent as needed
      // } else {
      //     console.log("No timetable content found in sessionStorage.");
      // });
      setAnswer(response);
      speak(response);
    } catch (error) {
      const errorMessage =
        "Sorry, I encountered an error while processing your question.";
      setAnswer(errorMessage);
      speak(errorMessage);
    }

    setLoading(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setQuestion("");
      setAnswer("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Welcome to Timetable Assistant
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold">Welcome, {username}!</h1>
          <p className="text-gray-600">
            Upload your timetable and ask questions about your schedule.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              <Upload size={20} />
              Upload Timetable
            </button>
            {timetableContent && (
              <span className="text-green-500 flex items-center gap-2">
                <Calendar size={20} />
                Timetable Loaded
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about your timetable"
              className="p-3 border rounded"
            />
            <p className="text-sm text-gray-500 mb-2 sm:mb-0 self-end">
              (e.g., When is my next class?)
            </p>
            <button
              onClick={toggleListening}
              className={`self-stretch sm:self-auto flex items-center justify-center gap-2 px-4 py-2 rounded transition ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-purple-500 hover:bg-purple-600"
              } text-white`}
            >
              <Mic size={20} />
              {isListening ? "Stop" : "Speak"}
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleAskQuestion()}
              disabled={loading || !timetableContent}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              <Send size={20} />
              Ask Question
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                <StopCircle size={20} />
                Stop Speaking
              </button>
            )}
          </div>

          {loading && <div className="mt-4 text-gray-600">Thinking...</div>}

          {answer && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Answer:</h3>
                <button
                  onClick={() => speak(answer)}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                >
                  <Volume2 size={20} />
                  Read Answer
                </button>
              </div>
              <p className="text-gray-700">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
