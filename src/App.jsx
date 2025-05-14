import { useState } from 'react'
import './App.css'
import Page1 from './components/Page1'
import Page2 from './components/Page2'
import Page3 from './components/Page3'

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
          시안 1
        </button>
        <button 
          className={currentPage === 2 ? 'active' : ''} 
          onClick={() => handlePageChange(2)}
        >
          시안 2
        </button>
        <button 
          className={currentPage === 3 ? 'active' : ''} 
          onClick={() => handlePageChange(3)}
        >
          시안 3
        </button>
      </div>
      <div className="content">
        {currentPage === 1 ? <Page1 /> : currentPage === 2 ? <Page2 /> : <Page3 />}
      </div>
    </div>
  )
}

export default App
