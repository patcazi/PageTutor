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
          <li className="file-item">
            <span className="file-icon">📄</span>
            fallacies_sc.pdf
          </li>
          <li className="file-item">
            <span className="file-icon">📄</span>
            IJGood1965.pdf
          </li>
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
          <div className="user-info">
            <div className="user-avatar">Pa</div>
            <div className="user-name">Patrice Azi</div>
          </div>
          <button className="upgrade-btn">✨ Upgrade to Plus</button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content">
        <div className="document-header">
          <div className="document-title">fallacies_sc.pdf</div>
          <div className="document-controls">
            <button className="control-btn">−</button>
            <button className="control-btn">○</button>
            <button className="control-btn">+</button>
            <span className="page-indicator">1 /72</span>
          </div>
        </div>
        <div className="document-viewer">
          {/* PDF content will be displayed here */}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="sidebar right-sidebar">
        <div className="chat-header">Chat</div>
        <div className="chat-history">
          <div className="chat-prompt">
            <div className="prompt-question">
              Why did the study of fallacies decline with the rise of formal logic?
            </div>
          </div>
          
          <div className="chat-request">
            <div className="request-text">
              Summarize: the argument conception of fallacies.
            </div>
          </div>
          
          <div className="chat-response">
            <div className="response-avatar">⬢</div>
            <div className="response-content">
              The argument conception of fallacies understands fallacies primarily as bad or deceptive arguments, as opposed to false but popular beliefs (the belief conception). This conception focuses on evaluating the logical quality and reasoning involved in arguments rather than just the truth or falsity of a belief.
            </div>
          </div>
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
