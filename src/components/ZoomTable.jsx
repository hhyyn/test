import { useState, useEffect, useRef } from 'react'

const ZoomTable = ({ designType = 1 }) => {
  const [visibleColumns, setVisibleColumns] = useState(3)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [mode, setMode] = useState('view') // 'edit' 또는 'view'
  const [cellHeight, setCellHeight] = useState('300px')
  const tableContainerRef = useRef(null)
  const tableRef = useRef(null)
  const headerRef = useRef(null)
  
  // 10개의 칼럼 데이터 생성
  const columns = Array.from({ length: 10 }, (_, i) => `컬럼 ${i + 1}`)
  
  // 컴포넌트 마운트 시 셀 높이 계산
  useEffect(() => {
    const updateCellHeight = () => {
      if (headerRef.current && tableRef.current) {
        // 셀 높이를 250px로 줄임
        setCellHeight('250px'); 
      }
    };

    updateCellHeight();
    window.addEventListener('resize', updateCellHeight);

    return () => {
      window.removeEventListener('resize', updateCellHeight);
    };
  }, []);
  
  // 모드 변경시 스크롤 상태 업데이트
  useEffect(() => {
    if (designType === 2 && mode === 'view' && tableRef.current) {
      // 보기 모드로 변경되면 스크롤을 허용
      tableRef.current.style.overflowX = 'auto';
    }
  }, [mode, designType]);
  
  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return

    // 핀치 줌 처리를 위한 함수
    let initialDistance = 0
    
    const handleTouchStart = (e) => {
      if (mode === 'edit' && designType === 2) return // 편집 모드이면서 시안 2인 경우 확대/축소 불가
      
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
      }
    }
    
    const handleTouchMove = (e) => {
      if (mode === 'edit' && designType === 2) return // 편집 모드이면서 시안 2인 경우 확대/축소 불가
      
      if (e.touches.length === 2) {
        e.preventDefault()
        
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        
        // 줌 인/아웃 감지 - 모바일에서는 반대로 동작하도록 수정
        const ratio = currentDistance / initialDistance
        
        if (ratio > 1.1) { // 손가락을 벌리는 동작 (핀치 아웃) - 확대 효과이므로 컬럼 감소
          setVisibleColumns(prev => Math.max(prev - 1, 1))
          initialDistance = currentDistance
        } else if (ratio < 0.9) { // 손가락을 모으는 동작 (핀치 인) - 축소 효과이므로 컬럼 증가
          setVisibleColumns(prev => Math.min(prev + 1, 10))
          initialDistance = currentDistance
        }
      }
    }
    
    // 마우스 휠 이벤트 처리
    const handleWheel = (e) => {
      if (mode === 'edit' && designType === 2) return // 편집 모드이면서 시안 2인 경우 확대/축소 불가
      
      if (e.ctrlKey) { // Ctrl 키를 누른 상태에서 휠 사용 시에만 적용
        e.preventDefault()
        
        if (e.deltaY < 0) { // 휠 업 (줌 인) - 확대 효과이므로 컬럼 감소
          setVisibleColumns(prev => Math.max(prev - 1, 1))
        } else { // 휠 다운 (줌 아웃) - 축소 효과이므로 컬럼 증가
          setVisibleColumns(prev => Math.min(prev + 1, 10))
        }
      }
    }
    
    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [mode, designType]) // 모드 변경시 이벤트 리스너 재설정
  
  // 테이블 너비 변경시 슬라이더 위치를 업데이트
  useEffect(() => {
    if (tableRef.current) {
      // 스크롤 가능 여부를 확인하고 슬라이더 위치 초기화
      const hasHorizontalScroll = tableRef.current.scrollWidth > tableRef.current.clientWidth
      
      if (!hasHorizontalScroll) {
        setScrollPosition(0)
      } else {
        // 현재 스크롤 위치에 맞게 슬라이더 위치 조정
        const maxScroll = tableRef.current.scrollWidth - tableRef.current.clientWidth
        const scrollPercentage = (tableRef.current.scrollLeft / maxScroll) * 100
        setScrollPosition(scrollPercentage)
      }
    }
  }, [visibleColumns])
  
  // 스크롤바 변경 핸들러
  const handleSliderChange = (e) => {
    const value = Number(e.target.value)
    setScrollPosition(value)
    
    if (tableRef.current) {
      const maxScroll = tableRef.current.scrollWidth - tableRef.current.clientWidth
      tableRef.current.scrollLeft = (maxScroll * value) / 100
    }
  }
  
  // 모드 변경 핸들러
  const handleModeChange = () => {
    // 모드 변경
    const newMode = mode === 'edit' ? 'view' : 'edit'
    setMode(newMode)
    
    // 즉시 스크롤 상태 업데이트 (useEffect를 기다리지 않고)
    if (tableRef.current) {
      if (designType === 2) {
        if (newMode === 'view') {
          // 보기 모드: 스크롤 허용
          tableRef.current.style.overflowX = 'auto';
        } else {
          // 편집 모드: 스크롤 금지
          tableRef.current.style.overflowX = 'hidden';
        }
      }
    }
  }
  
  // 테이블 스크롤 이벤트 핸들러
  const handleTableScroll = () => {
    if (designType === 1) {
      // 시안 1에서는 스크롤이 슬라이더에만 연동됨
      return
    }
    
    if (tableRef.current && mode === 'view') {
      const maxScroll = tableRef.current.scrollWidth - tableRef.current.clientWidth
      if (maxScroll > 0) {
        const scrollPercentage = (tableRef.current.scrollLeft / maxScroll) * 100
        setScrollPosition(scrollPercentage)
      }
    }
  }
  
  // 테이블 스타일 계산
  const tableStyle = {
    tableLayout: 'fixed',
    width: `${100 * (10 / visibleColumns)}%`, // 보이는 컬럼 수에 따라 너비 조정
    height: 'auto', // 자동 높이 설정
    borderSpacing: '0',
  }
  
  // 편집 모드일 때 배경색을 변경하여 시각적으로 구분
  const containerClassName = `zoom-table-container ${mode === 'edit' ? 'edit-mode' : ''}`;
  
  const scrollContainerStyle = {
    width: '100%',
    height: 'auto', // 자동 높이 설정
    overflowX: (designType === 1 || (designType === 2 && mode === 'edit')) ? 'hidden' : 'auto',
    overflowY: 'visible', // Y축 제한 제거
  }
  
  const headerStyle = {
    width: `${100 / 10}%`,
    minWidth: '150px',
    padding: '8px',
    backgroundColor: mode === 'edit' ? '#fff3e0' : '#f5f5f5',
    fontWeight: 'bold',
    boxSizing: 'border-box',
    height: '50px', // 헤더 높이 고정
  }
  
  const cellStyle = {
    width: `${100 / 10}%`,
    minWidth: '150px',
    height: cellHeight, // 고정된 높이 사용
    verticalAlign: 'middle',
    fontSize: '18px',
    padding: '20px 10px', // 패딩 증가
    lineHeight: '1.5',
    textAlign: 'center',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
    backgroundColor: mode === 'view' ? '#e6ffe6' : undefined, // done 모드일 때만 연한 초록색 배경
  }
  
  return (
    <div className="zoom-table-wrapper">
      <div className={containerClassName} ref={tableContainerRef}>
        <div 
          className="table-scroll-container" 
          ref={tableRef}
          onScroll={handleTableScroll}
          style={scrollContainerStyle}
        >
          <table className="zoom-table" style={tableStyle}>
            <thead ref={headerRef}>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} style={headerStyle}>
                    {mode === 'edit'
                      ? <div className="editable-cell">{col}</div> 
                      : col
                    }
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columns.map((_, idx) => (
                  <td key={idx} style={cellStyle}>
                    {mode === 'edit'
                      ? (
                        <div className="editable-cell">
                          편집 가능한 셀 {idx + 1}
                        </div>
                      ) 
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          결과 셀 {idx + 1}
                        </div>
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* 편집 모드 오버레이 */}
        {mode === 'edit' && (
          <div className="edit-mode-overlay">
            <div className="edit-mode-badge">
              <span className="edit-icon">✏️</span> EDIT
            </div>
          </div>
        )}
      </div>
      
      <div className="controls-container">
        {/* 시안 1 & 2: 모드 토글 */}
        <div className={`mode-toggle-container ${designType === 1 ? 'design1' : 'design2'}`}>
          <button 
            className={`mode-toggle ${mode === 'edit' ? 'active' : ''}`} 
            onClick={handleModeChange}
          >
            {mode === 'edit' ? 'DONE' : 'EDIT'}
          </button>
          <div className="mode-description">
            {mode === 'edit' 
              ? designType === 1
                ? '현재 Edit Mode (DONE 버튼 클릭시 완료 모드로 전환)' 
                : '현재 Edit Mode: 스크롤 및 확대/축소 불가능 (DONE 버튼 클릭시 완료 모드로 전환)'
              : designType === 1
                ? '현재 Done Mode (EDIT 버튼 클릭시 편집 모드로 전환)'
                : '현재 Done Mode: 스크롤 및 확대/축소 가능 (EDIT 버튼 클릭시 편집 모드로 전환)'
            }
          </div>
        </div>
        
        {/* 시안 1: 슬라이더 */}
        {designType === 1 && (
          <div className="slider-container">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={scrollPosition} 
              onChange={handleSliderChange} 
              className="scroll-slider"
            />
            <div className="slider-label">슬라이더로 좌우 스크롤</div>
            <div className="design-info">
              시안 1: 기본 x축 스크롤 사용 불가, 아래 슬라이더를 통해 좌우 이동
            </div>
          </div>
        )}
        
        {/* 시안별 기능 설명 */}
        <div className="design-info">
          {designType === 1 
            ? '시안 1: edit/done 모드 기능은 동일하며, 슬라이더로 좌우 이동' 
            : '시안 2: edit/done 모드를 통해 스크롤 및 확대/축소 기능 제어'
          }
        </div>
      </div>
      
      <div className="zoom-info">
        현재 표시 중인 컬럼: {visibleColumns}개 
        <p className="zoom-instructions">
          모바일: 두 손가락으로 핀치 줌 (확대: 손가락 벌리기 = 컬럼 감소, 축소: 손가락 모으기 = 컬럼 증가)<br />
          데스크톱: Ctrl + 마우스 휠 (확대: 휠 업 = 컬럼 감소, 축소: 휠 다운 = 컬럼 증가)
        </p>
      </div>
    </div>
  )
}

export default ZoomTable 