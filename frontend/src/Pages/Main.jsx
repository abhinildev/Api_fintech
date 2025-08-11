// src/Pages/Main.jsx
import { useState } from "react";
import axios from "axios";

export default function Main() {
  const [inputType, setInputType] = useState("document");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [pdf, setPdf] = useState(null);
  const [emailText, setEmailText] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setResponse("");

      let documentUrl = "";

      if (inputType === "url") {
        documentUrl = url;
      } else if (inputType === "document" || inputType === "pdf") {
        
        alert("File upload needs a hosting step before sending to backend.");
        setLoading(false);
        return;
      } else if (inputType === "email") {
        
        alert("Email text input not yet wired to backend.");
        setLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:8000/api/v1/hackrx/run", {
        documents: documentUrl,
        questions: [query],
      });

      setResponse(res.data.answers.join("\n\n"));
    } catch (err) {
      console.error(err);
      setResponse("Error: Could not get a response from the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Query Your Data</h1>

        {/* Input Type Selector */}
        <div className="flex justify-center space-x-4">
          {["document", "url", "pdf", "email"].map((type) => (
            <button
              key={type}
              onClick={() => setInputType(type)}
              className={`px-4 py-2 border border-black rounded-lg capitalize ${
                inputType === type ? "bg-black text-white" : "bg-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Conditional Input Fields */}
        {inputType === "document" && (
          <div className="border-2 border-dashed border-black p-6 rounded-lg text-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload" className="cursor-pointer text-lg font-medium">
              {file ? file.name : "Click to upload a document"}
            </label>
          </div>
        )}

        {inputType === "url" && (
          <input
            type="text"
            placeholder="Enter a URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-black rounded-lg p-4 focus:outline-none"
          />
        )}

        {inputType === "pdf" && (
          <div className="border-2 border-dashed border-black p-6 rounded-lg text-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files[0])}
              className="hidden"
              id="pdfUpload"
            />
            <label htmlFor="pdfUpload" className="cursor-pointer text-lg font-medium">
              {pdf ? pdf.name : "Click to upload a PDF"}
            </label>
          </div>
        )}

        {inputType === "email" && (
          <textarea
            placeholder="Paste email content here..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="w-full border border-black rounded-lg p-4 focus:outline-none"
            rows={6}
          />
        )}

        {/* Query Box */}
        <textarea
          placeholder="Type your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-black rounded-lg p-4 focus:outline-none"
          rows={4}
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>

        {/* Response Box */}
        {response && (
          <div className="border border-black rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
            <h2 className="font-semibold mb-2">Response:</h2>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
