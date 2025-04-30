import React from 'react'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="app-container">
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
          <div className="dropzone-container">
            <p style={{fontSize: '3em', margin: '0'}}>📄</p>
            <h3>Drag & Drop PDF here or Click to Upload</h3>
          </div>
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
