import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // State for the selected file
  const [numPages, setNumPages] = useState<number | null>(null); // State for total pages
  const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Ref for the canvas element we will add later
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const isRendering = useRef(false); // Track if a render is currently in progress
  const activeRenderTask = useRef<pdfjsLib.RenderTask | null>(null); // Store the currently active render task

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

  const renderPage = useCallback(async (pageNum: number) => {
    // Check if a render is already in progress
    if (isRendering.current) {
      console.log(`Render skipped for page ${pageNum}, already in progress.`);
      return;
    }

    // Set the lock to indicate rendering is starting
    isRendering.current = true;
    console.log(`Starting render for page ${pageNum}, setting lock.`); // Debug log

    // Cancel any previous render task that might still be running
    if (activeRenderTask.current) {
      console.log(`Cancelling previous render task before rendering page ${pageNum}`);
      activeRenderTask.current.cancel();
      activeRenderTask.current = null; // Clear the ref immediately after cancellation
    }

    // Ensure pdfDoc (from state) and canvasRef.current are available
    if (!pdfDoc || !canvasRef.current) {
      console.log('PDF Doc or Canvas Ref not ready for rendering');
      isRendering.current = false; // Release lock if resources aren't available
      return; // Exit if resources aren't ready
    }

    try {
      // Get the specific page object from the loaded document
      const page = await pdfDoc.getPage(pageNum);

      const scale = 1.5; // Define desired scale (adjust as needed)
      const viewport = page.getViewport({ scale });

      // Prepare canvas using PDF page dimensions
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d'); // Get 2D rendering context

      if (!context) {
        console.error('Failed to get canvas context');
        return; // Exit if context is not available
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Prepare rendering context for PDF.js
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Store the new task and await its completion promise
      activeRenderTask.current = page.render(renderContext);
      await activeRenderTask.current.promise;
      activeRenderTask.current = null; // Clear ref on successful completion
      console.log(`Page ${pageNum} rendered successfully`); // Debug log

    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      alert(`Error rendering page ${pageNum}.`);
      // Optional: Reset state if rendering fails critically
    } finally {
      // This runs after try or catch finishes - release the lock
      isRendering.current = false;
      activeRenderTask.current = null; // Ensure task ref is cleared on exit
      console.log(`Render finally block for page ${pageNum}, releasing lock & clearing task.`);
    }
  }, [pdfDoc]);

  // useEffect for handling file loading - separated from rendering logic
  useEffect(() => {
    // Only run if a file is selected
    if (file) {
      const reader = new FileReader(); // Use FileReader to read the file content

      reader.onload = async (e) => {
        // This runs when the file is successfully read
        if (e.target?.result) {
          const typedArray = new Uint8Array(e.target.result as ArrayBuffer); // PDF data as ArrayBuffer
          try {
            // Load the PDF document using PDF.js
            const loadingTask = pdfjsLib.getDocument({ data: typedArray });
            const pdf = await loadingTask.promise; // Wait for document to load

            // Update state with loaded PDF info
            setNumPages(pdf.numPages); // Set total number of pages
            setPdfDoc(pdf); // Store the PDF document object itself
            setCurrentPage(1); // Reset to page 1 when new PDF loads
            // Removed renderPage(1) call - this will be handled by the separate rendering effect
            console.log('PDF loaded successfully. Pages:', pdf.numPages); // For debugging

          } catch (error) {
            console.error('Error loading PDF document:', error);
            alert('Failed to load PDF document. Please try a different file.');
            // Reset state if loading fails
            setFile(null);
            setNumPages(null);
            setPdfDoc(null);
            setCurrentPage(1);
          }
        }
      };

      reader.onerror = (e) => {
          // Handle errors during file reading
          console.error('Error reading file:', e);
          alert('Error reading the selected file.');
          setFile(null); // Reset file state
      };

      // Start reading the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);

    } else {
      // If file becomes null (e.g., deselected), reset the PDF state
      setNumPages(null);
      setPdfDoc(null);
      setCurrentPage(1);
    }

  }, [file]); // Only depend on file changes, removed renderPage dependency

  // New useEffect specifically for rendering the PDF when pdfDoc or currentPage changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]); // Runs when doc loads or page changes

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
            <canvas ref={canvasRef} className="pdf-canvas"></canvas>
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
