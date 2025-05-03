import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css'; // Recommended base CSS
import 'react-pdf/dist/Page/TextLayer.css';    // Recommended base CSS
import { getPdfExplanation } from "./lib/openaiClient";
import FloatingToolbar from "./components/FloatingToolbar";
import './App.css'

// Use the local worker file that will be copied to the public directory
// This is more reliable than using a CDN and works in production builds
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // State for the selected file
  const [numPages, setNumPages] = useState<number | null>(null); // State for total pages
  const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
  const [highlights, setHighlights] = useState<string[]>([]); // State for text highlights
  const [aiResponses, setAiResponses] = useState<
    { summary?: string; explanation?: string; quiz?: string[]; loading: boolean; mode?: "summary" | "analysis" | "quiz" }[]
  >([]);
  const [toolbar, setToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
    selection: string;
  }>({ visible: false, x: 0, y: 0, selection: "" });
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const viewerContainerRef = useRef<HTMLDivElement>(null); // Ref for the PDF viewer container
  const [containerWidth, setContainerWidth] = useState<number>(0); // State for container width

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

  // useEffect for measuring and tracking container width
  useEffect(() => {
    const container = viewerContainerRef.current;
    if (!container) return; // Exit if ref not attached yet

    console.log('Container reference obtained:', container);

    const resizeObserver = new ResizeObserver(entries => {
      // Observe size changes
      for (let entry of entries) {
        if (entry.contentRect) {
          // Update state with the container's width
          const newWidth = Math.min(entry.contentRect.width, 1000);  // cap at 1000px
          console.log('ResizeObserver - Measured Width:', newWidth);
          console.log('ResizeObserver - Container Element:', entry.target);
          setContainerWidth(newWidth);
        }
      }
    });

    // Measure initial width
    const initialWidth = Math.min(container.clientWidth, 1000);  // cap at 1000px
    console.log('Initial Container Width:', initialWidth);
    console.log('Container offsetWidth:', container.offsetWidth);
    console.log('Container scrollWidth:', container.scrollWidth);
    console.log('Container getBoundingClientRect():', container.getBoundingClientRect());
    setContainerWidth(initialWidth);

    // Start observing
    resizeObserver.observe(container);
    console.log('ResizeObserver started observing container');

    // Cleanup function on component unmount
    return () => {
      resizeObserver.unobserve(container);
      console.log('ResizeObserver stopped observing container');
    };
  }, []); // Empty dependency array means run once on mount

  // useEffect for capturing text selection
  useEffect(() => {
    // Handler for text selection
    const handleMouseUp = () => {
      const selected = window.getSelection()?.toString().trim();
      if (selected) {
        const range = window.getSelection()!.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // show toolbar just above the selection
        setToolbar({
          visible: true,
          x: rect.left,
          y: rect.top - 30,   // 30px above
          selection: selected
        });
      } else {
        setToolbar(t => ({ ...t, visible: false }));
      }
    };

    // Add global event listener for mouseup
    document.addEventListener('mouseup', handleMouseUp, true);

    // Cleanup function on component unmount
    return () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, []); // Empty dependency array means run once on mount

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
            <div className="pdf-viewer-container" ref={viewerContainerRef}> {/* Added ref here */}
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
                    // Conditionally pass width only if calculated
                    width={containerWidth > 0 ? containerWidth : undefined}
                    renderAnnotationLayer={false} // Keep things simple for now
                    renderTextLayer={true}       // Enable text layer for selection
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
          {highlights.map((h, i) => (
            <div key={i} className="chat-prompt">
              <strong>{h.length > 80 ? h.slice(0, 80) + "…" : h}</strong>
              {aiResponses[i]?.loading ? (
                <div>Loading {aiResponses[i].mode}…</div>
              ) : aiResponses[i]?.mode === "summary" ? (
                <p><em>Summary:</em> {aiResponses[i].summary}</p>
              ) : aiResponses[i]?.mode === "analysis" ? (
                <p><em>Analysis:</em> {aiResponses[i].explanation}</p>
              ) : (
                <ol>
                  {aiResponses[i].quiz?.map((q: any, j: number) => (
                    <li key={j}>
                      {typeof q === "string"
                        ? q
                        : q?.question ?? JSON.stringify(q)}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input type="text" className="chat-input" placeholder="Ask any question..." />
          <button className="send-btn">➤</button>
        </div>
      </div>

      {toolbar.visible && (
        <FloatingToolbar
          x={toolbar.x}
          y={toolbar.y}
          onChoose={(mode: "summary" | "analysis" | "quiz") => {
            const idx = highlights.length;            // index for this highlight

            // push placeholder in highlights & responses
            setHighlights(h => [...h, toolbar.selection]);
            setAiResponses(r => [
              ...r,
              { summary: "", explanation: "", quiz: [], loading: true, mode }
            ]);

            // Cast to any to bypass the TypeScript error
            (getPdfExplanation as any)(toolbar.selection, mode).then((res: {
              summary?: string;
              explanation?: string;
              quiz?: string[];
              error?: boolean;
            }) =>
              setAiResponses(r =>
                r.map((item, i) =>
                  i === idx ? { ...res, mode, loading: false } : item
                )
              )
            );

            setToolbar(t => ({ ...t, visible: false }));
          }}
        />
      )}
    </div>
  )
}

export default App
