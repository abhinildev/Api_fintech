import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import {ReactTyped} from "react-typed"
export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-center flex-1 px-6 md:px-16">
      
        <div className="text-center md:text-left md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            LLM-Powered Intelligent Query–Retrieval
          </h1>
          <p className="text-lg text-gray-400 max-w-lg">
            Process large insurance, legal, HR, and compliance documents 
            and get contextual, explainable decisions instantly.
          </p>
          <Link
            to="/main"
            className="inline-block mt-4 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition"
          >
            Get Started →
          </Link>
        </div>

       
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <div className="w-64 h-64 border border-gray-700 rounded-xl flex items-center justify-center text-gray-500">
           <ReactTyped strings={['Document', 'Url','Email','PDFs']} typeSpeed={120} backspeed={140} loop></ReactTyped>
          </div>
        </div>
      </div>
    </div>
  );
}
