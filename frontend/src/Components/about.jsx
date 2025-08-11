import React from "react";

const teamMembers = [
  {
    name: "Abhilash Kashyap",

    img: "/abhilash.jpeg",
    
  },
  {
    name: "Bishal Ranjan Nath",
 
    img: "/Bishal.jpeg",
   
  },
  {
    name: "Tasdeeque Ruhani",

    img: "/Taz.jpeg",
   
  },
  {
    name: "Abhinil Savarni",
  
    img: "/ab.jpeg",
   
  }
];

const AboutUs = () => {
  return (
    <div className="bg-black text-white min-h-screen px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-8 animate-fadeIn">
        About <span className="text-gray-400">Runtime Terror</span>
      </h1>

      <p className="max-w-4xl mx-auto text-lg text-gray-300 mb-12 leading-relaxed animate-slideUp">
        <strong>Runtime Terror</strong> is a collaborative team of four developers dedicated to building intelligent and
        scalable solutions for document-based query systems. Our featured project, the <strong>LLM-Powered Intelligent
        Query–Retrieval System</strong>, allows users to process and analyze documents such as PDFs, DOCX files, URLs,
        and emails, returning contextual and explainable answers to queries.
        <br /><br />
        <strong>Workflow:</strong> Users upload or link documents, which are processed through an embedding pipeline using
        <em> HuggingFace sentence transformers</em> and stored in a <em>FAISS vector database</em>. Queries are matched against
        relevant document chunks, and results are refined using advanced language models to ensure accuracy and clarity.
        <br /><br />
        <strong>Technologies Used:</strong>  
        - <em>Frontend:</em> React with Tailwind CSS for a minimalist, responsive interface.  
        - <em>Backend:</em> FastAPI with Python for high-performance API services.  
        - <em>Machine Learning:</em> LangChain, HuggingFace embeddings, and Mistral LLM for natural language understanding.  
        - <em>Database:</em> FAISS for vector similarity search.  
        - <em>Security:</em> Secure API access and CORS-enabled endpoints.  
        <br /><br />
        We emphasize clean architecture, modular development, and seamless integration between frontend and backend. This
        ensures the system remains both efficient and scalable, ready for future enhancements.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg p-6 shadow-lg transform hover:-translate-y-2 transition-all duration-300 animate-fadeIn"
          >
            <img
              src={member.img}
              alt={member.name}
              className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-gray-600"
            />
            <h2 className="text-xl font-semibold mt-4 text-center">
              {member.name}
            </h2>
            <p className="text-gray-400 text-sm text-center">{member.role}</p>
            <p className="text-gray-300 text-sm mt-4 text-center leading-relaxed">
              {member.bio}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
