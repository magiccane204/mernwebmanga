import React, { useEffect, useRef } from "react";

const API = "https://mernwebmanga.onrender.com";

function Home({ pdfs, setPdfs }) {
  const fileInputRef = useRef(null);

  // Fetch PDFs
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await fetch(`${API}/api/pdfs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`
          }
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setPdfs(data);
        } else if (Array.isArray(data.pdfs)) {
          setPdfs(data.pdfs);
        } else {
          setPdfs([]);
        }

      } catch (err) {
        console.error("Error fetching PDFs:", err);
        setPdfs([]);
      }
    };

    fetchPdfs();
  }, [setPdfs]);



  // Upload PDFs
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("pdfs", files[i]);
    }

    try {
      const res = await fetch(`${API}/api/pdfs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`
        },
        body: formData
      });

      const data = await res.json();

      let newPdfs = [];
      if (Array.isArray(data)) {
        newPdfs = data;
      } else if (Array.isArray(data.pdfs)) {
        newPdfs = data.pdfs;
      }

      setPdfs((prev) => [...prev, ...newPdfs]);

    } catch (err) {
      console.error("Upload error:", err);
    }
  };



  return (
    <div className="page home-page">

      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          background: "#1c1c1c",
          color: "#fff",
          borderRadius: "30px",
          padding: "12px 25px",
          fontWeight: "bold",
          border: "1px solid #333",
          cursor: "pointer",
          transition: "all 0.3s ease",
          fontSize: "16px"
        }}
      >
        📤 Upload PDFs

        <input
          type="file"
          accept="application/pdf"
          multiple
          ref={fileInputRef}
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </button>


      <h2>📁 Manga Collection (PDF)</h2>


      <div className="pdf-grid">
        {(!Array.isArray(pdfs) || pdfs.length === 0) && (
          <p>No PDFs uploaded yet.</p>
        )}

        {Array.isArray(pdfs) &&
          pdfs.map((pdf, index) => {

            // ✅ GridFS URL
            const fileUrl = `${API}/api/pdfs/file/${pdf.filename}`;

            return (
              <div key={index} className="pdf-card">

                <iframe
                  src={fileUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
                  title={pdf.name}
                  className="pdf-preview"
                ></iframe>

                <p className="pdf-name">
                  {pdf.name.replace(/\.pdf$/i, "")}
                </p>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-btn"
                >
                  🔎 Open PDF
                </a>

              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Home;
