import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../styles/Notebooks.css"; // Reuse the same CSS!

export default function MyNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchMyNotebooks = async () => {
      const token = localStorage.getItem("studyAppToken");
      const response = await fetch("http://localhost:3000/my-notebooks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setNotebooks(data.notebooks);
    };
    fetchMyNotebooks();
  }, []);

  const filtered = notebooks.filter(nb => {
    const matchesSearch = nb.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || 
                         (filter === "Public" && nb.isPublic) || 
                         (filter === "Private" && !nb.isPublic);
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Helmet>
        <title>SmartStudy AI - My Notebooks</title>
      </Helmet>

      <div className="notebooks-page-wrapper">
        <div className="notebooks-container">
          <div className="notebooks-header-area">
            <h1>My Notebooks</h1>
            <p>Manage your private and public collections</p>
          </div>

          <div className="search-filter-row">
            <div className="search-input-wrap">
              <input 
                placeholder="Search my notebooks..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <select className="btn-sort" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="notebooks-grid">
            {filtered.map(nb => (
              <div key={nb.id} className="rich-notebook-card">
                <h3>{nb.title}</h3>
                <p className="status-tag">{nb.isPublic ? "Public" : "Private"}</p>
                <div className="rnc-summary-box">
                  <p>{nb.summary}</p>
                </div>
                <div className="card-actions-row">
                    <span>{nb.likes} Saves</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}