import React, { useEffect, useRef } from "react";

const API = "https://mernwebmanga.onrender.com";

function Home({ pdfs, setPdfs }) {
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await fetch(`${API}/api/pdfs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`
          }
        });

        let data;
        try {
          data = await res.json();
        } catch {
          console.error("Not JSON");
          return;
        }

        setPdfs(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchPdfs();
  }, [setPdfs]);


  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let f of files) formData.append("pdfs", f);

    try {
      const res = await fetch(`${API}/api/pdfs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`
        },
        body: formData
      });

      let data;
      try {
        data = await res.json();
      } catch {
        console.error("Upload not JSON");
        return;
      }

      setPdfs(prev => [...prev, ...data]);

    } catch (err) {
      console.error("Upload error:", err);
    }
  };


  return (
    <div>

      <button onClick={() => fileInputRef.current.click()}>
        Upload PDFs
        <input
          type="file"
          multiple
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </button>

      <h2>PDFs</h2>

      {pdfs.map((pdf, i) => {
        const url = `${API}/api/pdfs/file/${pdf.filename}`;

        return (
          <div key={i}>
            <iframe src={url} width="200" height="250" title={pdf.name} />
            <p>{pdf.name}</p>
            <a href={url} target="_blank">Open</a>
          </div>
        );
      })}

    </div>
  );
}

export default Home;
