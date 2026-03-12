import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const removeUnicodeCharacters = (str) => str.replace(/[^\u0000-\u007F]/g, '');
const trimLeadingSpaces = (str) => str.replace(/^\s+/, '');

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0a0a0f; }

  .app {
    min-height: 100vh;
    background: #0a0a0f;
    color: #e8e6f0;
    font-family: 'DM Mono', monospace;
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }

  .app::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 70%;
    height: 70%;
    background: radial-gradient(ellipse, rgba(99,60,255,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .app::after {
    content: '';
    position: fixed;
    bottom: -30%;
    right: -10%;
    width: 50%;
    height: 60%;
    background: radial-gradient(ellipse, rgba(0,210,180,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .header {
    margin-bottom: 52px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #00d2b4;
    margin-bottom: 16px;
    font-family: 'DM Mono', monospace;
  }

  .tag::before {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: #00d2b4;
  }

  h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(36px, 6vw, 60px);
    font-weight: 800;
    line-height: 1.0;
    letter-spacing: -0.03em;
    color: #f0eeff;
  }

  h1 span {
    color: #00d2b4;
  }

  .subtitle {
    margin-top: 12px;
    font-size: 13px;
    color: #6b6880;
    letter-spacing: 0.02em;
    line-height: 1.6;
  }

  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
    transition: border-color 0.3s ease;
  }

  .card:hover {
    border-color: rgba(99,60,255,0.3);
  }

  .card-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6336ff;
    margin-bottom: 20px;
    font-weight: 500;
  }

  .upload-zone {
    border: 1.5px dashed rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 48px 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .upload-zone:hover, .upload-zone.dragover {
    border-color: #6336ff;
    background: rgba(99,60,255,0.06);
  }

  .upload-zone input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    background: rgba(99,60,255,0.15);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .upload-text {
    font-size: 14px;
    color: #9996aa;
    line-height: 1.6;
  }

  .upload-text strong {
    display: block;
    color: #e8e6f0;
    font-size: 15px;
    margin-bottom: 4px;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
  }

  .file-name {
    margin-top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,210,180,0.1);
    border: 1px solid rgba(0,210,180,0.2);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12px;
    color: #00d2b4;
  }

  .actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    border-radius: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.25s ease;
    text-transform: uppercase;
  }

  .btn-primary {
    background: #6336ff;
    color: #fff;
    box-shadow: 0 0 0 0 rgba(99,60,255,0.5);
  }

  .btn-primary:hover {
    background: #7a52ff;
    box-shadow: 0 0 24px rgba(99,60,255,0.4);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: rgba(0,210,180,0.1);
    color: #00d2b4;
    border: 1px solid rgba(0,210,180,0.25);
  }

  .btn-secondary:hover {
    background: rgba(0,210,180,0.18);
    border-color: #00d2b4;
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #f0eeff;
    line-height: 1;
  }

  .stat-label {
    font-size: 10px;
    color: #6b6880;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-top: 6px;
  }

  .table-wrap {
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.07);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  thead {
    background: rgba(99,60,255,0.12);
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9580ff;
    font-weight: 500;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    white-space: nowrap;
  }

  td {
    padding: 11px 16px;
    color: #b8b5cc;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr:last-child td { border-bottom: none; }

  tbody tr:hover td {
    background: rgba(99,60,255,0.06);
    color: #e8e6f0;
  }

  .status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #00d2b4;
    box-shadow: 0 0 8px #00d2b4;
    margin-right: 8px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .converted-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(0,210,180,0.1);
    border: 1px solid rgba(0,210,180,0.2);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 10px;
    color: #00d2b4;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-left: 12px;
    vertical-align: middle;
  }
`;

export default function StringConverter() {
  const [inputData, setInputData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [converted, setConverted] = useState(false);
  const [dragover, setDragover] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setConverted(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      setInputData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConvert = () => {
    setInputData(prev =>
      prev.map(row =>
        row.map(cell => trimLeadingSpaces(removeUnicodeCharacters(cell.toString())))
      )
    );
    setConverted(true);
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(inputData);
    XLSX.utils.book_append_sheet(wb, ws, "Converted Data");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "converted_data.xlsx");
  };

  const totalCells = inputData.reduce((acc, r) => acc + r.length, 0);

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <div className="container">
          <header className="header">
            <div className="tag">Data Utility Tool</div>
            <h1>Excel <span>Cleaner</span></h1>
            <p className="subtitle">Strip Unicode characters & trim leading whitespace from spreadsheet data.</p>
          </header>

          {/* Upload Card */}
          <div className="card">
            <div className="card-label">01 — Upload File</div>
            <div
              className={`upload-zone${dragover ? " dragover" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={e => { e.preventDefault(); setDragover(false); }}
            >
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
              <div className="upload-icon">📊</div>
              <div className="upload-text">
                <strong>Drop your Excel file here</strong>
                or click to browse — .xlsx, .xls supported
              </div>
              {fileName && (
                <div className="file-name">
                  ✓ {fileName}
                </div>
              )}
            </div>
          </div>

          {/* Stats + Actions */}
          {inputData.length > 0 && (
            <>
              <div className="stats-row">
                <div className="stat">
                  <div className="stat-value">{inputData.length}</div>
                  <div className="stat-label">Rows</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{inputData[0]?.length ?? 0}</div>
                  <div className="stat-label">Columns</div>
                </div>
                <div className="stat">
                  <div className="stat-value">{totalCells}</div>
                  <div className="stat-label">Total Cells</div>
                </div>
              </div>

              <div className="card">
                <div className="card-label">02 — Process & Export</div>
                <div className="actions">
                  <button className="btn btn-primary" onClick={handleConvert} disabled={converted}>
                    ⚡ Clean Data
                  </button>
                  <button className="btn btn-secondary" onClick={handleDownload} disabled={!converted}>
                    ↓ Download .xlsx
                  </button>
                </div>
              </div>

              {/* Preview Table */}
              <div className="card">
                <div className="card-label">
                  03 — Preview
                  {converted && <span className="converted-badge"><span className="status-dot"></span>Cleaned</span>}
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {inputData[0]?.map((_, i) => (
                          <th key={i}>Col {i + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inputData.slice(0, 50).map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} title={cell}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {inputData.length > 50 && (
                  <p style={{ fontSize: 11, color: "#6b6880", marginTop: 12, textAlign: "center" }}>
                    Showing 50 of {inputData.length} rows — all rows included on export
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}