import React, { useState } from "react";

const API = "https://mernwebmanga.onrender.com";

function Search({ pdfs }) {
  const [query, setQuery] = useState("");

  const filtered = pdfs.filter((pdf) =>
    pdf.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <h2>Search PDFs</h2>
      <input
        type="text"
        placeholder="Enter PDF name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="pdf-grid">
        {filtered.length === 0 && <p>No results found.</p>}
        {filtered.map((pdf, index) => {
          const pdfUrl = `${API}/api/pdfs/file/${pdf.filename}`;
          return (
            <div key={index} className="pdf-card">
              <iframe
                src={pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
                title={pdf.name}
                className="pdf-preview"
              ></iframe>

              <p className="pdf-name">{pdf.name}</p>

              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="open-btn">
                Open PDF
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Search;
