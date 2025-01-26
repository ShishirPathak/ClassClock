import React, { useState, useRef, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { Upload, Calendar, Send, Mic, Volume2, StopCircle } from "lucide-react";
import { askGemini, summaryPrompt } from "./utils/geminiService";

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timetableContent, setTimetableContent] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    setIsUploading(true);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const summarizedTimetableContent = await summaryPrompt(content);
      console.log("content\n", content);

      setTimetableContent(summarizedTimetableContent);
      sessionStorage.setItem("timetableContent", summarizedTimetableContent);
      setIsUploading(false);
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
      <div className="m-4 sm:m-8 md:m-20 flex flex-col sm:flex-row items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h3 className="text-lg font-bold mb-6 text-center">
            🔓 UMassD: AI Bot Unlocks Schedules! 🎓
          </h3>
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
          {/* Footer */}
          <footer className="text-center text-gray-500 mt-8">
            Crafted with ❤️ by Shishir
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="m-4 sm:m-8 md:m-20 p-8">
      <div className="max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-4xl mx-auto">
        <header className="bg-white rounded-lg shadow-md p-6 mb-8 ">
          <h1 className=" text-2xl font-bold text-center">
            Welcome, {username}!
          </h1>
          <p className=" text-gray-600 text-center">
            Upload your timetable and ask questions about your schedule.
          </p>
          <button
            onClick={() => setShowInstruction(!showInstruction)}
            className="text-blue-500 hover:text-blue-600 mx-auto block mt-2"
          >
            How to download the .ics file from COIN?
          </button>
          {showInstruction && (
            <div className="text-gray-700 mt-2 p-4 rounded-lg mx-auto bg-transparent shadow-2xl">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ol
                  className=" list-decimal list-inside"
                  style={{ textAlign: "left", maxWidth: "600px" }}
                >
                  <span className="font-bold text-lg">
                    Here are the steps to download the .ics file from COIN:
                  </span>
                  <li>Login to MyUmassD</li>
                  <li>Go to QUICKLAUNCH</li>
                  <li>Select 'Coin for students'</li>
                  <li>Expand 'Academics' on the left panel sidebar</li>
                  <li>Click on 'My class schedule'</li>
                  <li>You will see a link 'Email as a .ics'</li>
                  <li>
                    Click on the link. It will send .ics file to your university
                    email
                  </li>
                  <li>Download the .ics file from your email</li>
                  <li>Upload the .ics file to this application</li>
                </ol>
              </div>
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              <Upload size={20} />
              Upload Timetable (.ics File)
            </button>
            {isUploading && <ClipLoader color="#000000" />}{" "}
            {/* Render the spinner while uploading */}
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
              className="w-full p-3 border rounded"
            />
            <p className="text-sm text-gray-500 mb-2 sm:mb-0">
              (e.g., When is my Artificial Intelligence class?)
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
              <p className="text-sm text-blue-800 mt-2">
                Note: AI can occasionally make mistakes. Please verify important
                information.
              </p>
            </div>
          )}
          {/* Footer */}
          <footer className="text-center text-gray-500 mt-8">
            Crafted with ❤️ by Shishir{" "}
          </footer>
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
