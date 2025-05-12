import { useState } from 'react'
import './App.css'
import Page1 from './components/Page1'
import Page2 from './components/Page2'

function App() {
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="app-container">
      <div className="navigation">
        <button 
          className={currentPage === 1 ? 'active' : ''} 
          onClick={() => handlePageChange(1)}
        >
          페이지 1
        </button>
        <button 
          className={currentPage === 2 ? 'active' : ''} 
          onClick={() => handlePageChange(2)}
        >
          페이지 2
        </button>
      </div>
      <div className="content">
        {currentPage === 1 ? <Page1 /> : <Page2 />}
      </div>
    </div>
  )
}

export default App
