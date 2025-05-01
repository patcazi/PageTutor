import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css'; // Recommended base CSS
import 'react-pdf/dist/Page/TextLayer.css';    // Recommended base CSS
import './App.css'

// Use the local worker file that will be copied to the public directory
// This is more reliable than using a CDN and works in production builds
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // State for the selected file
  const [numPages, setNumPages] = useState<number | null>(null); // State for total pages
  const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setCurrentPage(1);
      setNumPages(null);
      console.log('File selected:', selectedFile.name);
    } else if (selectedFile) {
      alert('Please select a valid PDF file.');
      event.target.value = ''; // Reset the input
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }): void => {
    setNumPages(nextNumPages); // Update state with total pages
    setCurrentPage(1); // Reset to page 1 on new document load
    console.log(`Document loaded successfully with ${nextNumPages} pages.`);
  };

  // useEffect for handling file loading - separated from rendering logic
  useEffect(() => {
    // Only run if a file is selected
    if (file) {
      // We'll add react-pdf logic here later
      console.log('File loaded:', file.name);
    } else {
      // If file becomes null (e.g., deselected), reset the state
      setNumPages(null);
      setCurrentPage(1);
    }
  }, [file]); // Only depend on file changes

  return (
    <div className="app-container">
      {/* Hidden file input */}
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {/* Left Sidebar */}
      <div className="sidebar left-sidebar">
        <button className="new-chat-btn">+ New Chat</button>
        <button className="new-folder-btn">+ New Folder</button>
        
        <ul className="file-list">
          <p>No documents loaded yet.</p>
        </ul>
        
        <div className="sidebar-footer">
          <div className="language-selector">
            <span className="language-icon">🌐</span>
            <span>EN</span>
          </div>
          <div className="ai-scholar">
            <span className="ai-icon">🤖</span>
            AI Scholar
          </div>
          <button className="login-btn">Login / Sign Up</button>
          <button className="upgrade-btn">✨ Upgrade to Plus</button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content">
        <div className="document-header">
          <div className="document-title">No PDF Loaded</div>
          <div className="document-controls">
            <button className="control-btn">−</button>
            <button className="control-btn">○</button>
            <button className="control-btn">+</button>
          </div>
        </div>
        <div className="document-viewer">
          {file === null ? (
            <div
              className="dropzone-container"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
              onDragOver={(event) => {
                event.preventDefault(); // Necessary to allow dropping
              }}
              onDrop={(event) => {
                event.preventDefault(); // Prevent browser opening file
                const droppedFile = event.dataTransfer.files?.[0];
                if (droppedFile && droppedFile.type === 'application/pdf') {
                  setFile(droppedFile); // Use the existing setFile state updater
                  setCurrentPage(1);    // Reset page state
                  setNumPages(null);
                  console.log('File dropped:', droppedFile.name);
                } else if (droppedFile) {
                  alert('Please drop a valid PDF file.');
                }
              }}
            >
              <p style={{fontSize: '3em', margin: '0'}}>📄</p>
              <h3>Drag & Drop PDF here or Click to Upload</h3>
            </div>
          ) : (
            <div className="pdf-viewer-container"> {/* Outer scrollable container */}
              <Document
                file={file} // Pass the selected file object
                onLoadSuccess={onDocumentLoadSuccess} // Call handler on load
                onLoadError={console.error} // Log errors
                // Optional: Add error component via onError prop
              >
                {/* Loop through page numbers and render each Page */}
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={900}
                    renderAnnotationLayer={false} // Keep things simple for now
                    renderTextLayer={false}       // Keep things simple for now
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="sidebar right-sidebar">
        <div className="chat-header">Chat</div>
        <div className="chat-history">
          {/* Chat messages will appear here */}
        </div>
        <div className="chat-input-area">
          <input type="text" className="chat-input" placeholder="Ask any question..." />
          <button className="send-btn">➤</button>
        </div>
      </div>
    </div>
  )
}

export default App
