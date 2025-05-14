import { useState, useEffect, useRef } from 'react'

const ZoomTable = ({ designType = 1 }) => {
  const [visibleColumns, setVisibleColumns] = useState(3)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [mode, setMode] = useState('view') // 'edit' 또는 'view'
  const [cellHeight, setCellHeight] = useState('300px')
  const [isDragging, setIsDragging] = useState(false)
  const [startTouchX, setStartTouchX] = useState(0)
  const [startTouch1, setStartTouch1] = useState({ x: 0, y: 0 })
  const [startTouch2, setStartTouch2] = useState({ x: 0, y: 0 })
  const [initialDistance, setInitialDistance] = useState(0)
  const [touchCount, setTouchCount] = useState(0)
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
  
  // 핀치와 스와이프를 구분하는 함수
  const isSameDirectionMove = (touch1Start, touch1Current, touch2Start, touch2Current) => {
    // X 방향 이동 계산
    const touch1DeltaX = touch1Current.clientX - touch1Start.x
    const touch2DeltaX = touch2Current.clientX - touch2Start.x
    
    // 두 손가락이 같은 방향으로 10px 이상 이동했는지 확인 (드래그 동작)
    const isSameDirectionX = (touch1DeltaX > 10 && touch2DeltaX > 10) || 
                           (touch1DeltaX < -10 && touch2DeltaX < -10)
    
    // 손가락 사이의 현재 거리 계산
    const currentDistance = Math.hypot(
      touch1Current.clientX - touch2Current.clientX,
      touch1Current.clientY - touch2Current.clientY
    )
    
    // 초기 거리와 현재 거리의 차이가 작으면 드래그로 간주
    const distanceDifference = Math.abs(currentDistance - initialDistance)
    
    // 거리 변화가 적고 같은 방향으로 이동한 경우 드래그로 판단
    return isSameDirectionX && distanceDifference < 30
  }
  
  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return
    
    const handleTouchStart = (e) => {
      // 터치 개수 저장
      setTouchCount(e.touches.length)
      
      if (mode === 'edit' && designType === 2) return // 편집 모드이면서 시안 2인 경우 확대/축소와 스크롤 불가
      
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        
        // 시작 위치 저장
        setStartTouch1({ x: touch1.clientX, y: touch1.clientY })
        setStartTouch2({ x: touch2.clientX, y: touch2.clientY })
        
        // 두 터치 포인트 사이의 거리 계산
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        setInitialDistance(distance)
        
        // 중앙 위치 계산 (드래그용)
        const centerX = (touch1.clientX + touch2.clientX) / 2
        setStartTouchX(centerX)
        
        // 드래그 준비 (특정 조건이 충족되면 드래그 모드 활성화)
        setIsDragging(false)
      }
    }
    
    const handleTouchMove = (e) => {
      if (mode === 'edit' && designType === 2) return // 편집 모드이면서 시안 2인 경우 확대/축소와 스크롤 불가
      
      if (e.touches.length === 2) {
        e.preventDefault()
        
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        
        // 현재 두 손가락 사이의 거리 계산
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        
        // 시안 3에서 두 손가락 제스처 처리
        if (designType === 3) {
          // 손가락이 같은 방향으로 이동하는지 확인 (드래그)
          const isDragGesture = isSameDirectionMove(startTouch1, touch1, startTouch2, touch2)
          
          if (isDragGesture) {
            // 드래그 모드: 두 손가락이 같은 방향으로 이동
            const currentCenterX = (touch1.clientX + touch2.clientX) / 2
            const deltaX = startTouchX - currentCenterX
            
            if (tableRef.current) {
              tableRef.current.scrollLeft += deltaX
              setStartTouchX(currentCenterX)
              
              // 스크롤 위치 업데이트
              const maxScroll = tableRef.current.scrollWidth - tableRef.current.clientWidth
              if (maxScroll > 0) {
                const scrollPercentage = (tableRef.current.scrollLeft / maxScroll) * 100
                setScrollPosition(scrollPercentage)
              }
            }
          } else {
            // 확대/축소 모드: 두 손가락이 반대 방향으로 움직이거나 거리가 변함
            const ratio = currentDistance / initialDistance
            
            if (ratio > 1.1) { // 손가락을 벌리는 동작 (핀치 아웃) - 확대 효과이므로 컬럼 감소
              setVisibleColumns(prev => Math.max(prev - 1, 1))
              // 새로운 거리를 기준으로 업데이트
              setInitialDistance(currentDistance)
              
              // 새로운 시작 위치 업데이트
              setStartTouch1({ x: touch1.clientX, y: touch1.clientY })
              setStartTouch2({ x: touch2.clientX, y: touch2.clientY })
            } else if (ratio < 0.9) { // 손가락을 모으는 동작 (핀치 인) - 축소 효과이므로 컬럼 증가
              setVisibleColumns(prev => Math.min(prev + 1, 10))
              // 새로운 거리를 기준으로 업데이트
              setInitialDistance(currentDistance)
              
              // 새로운 시작 위치 업데이트
              setStartTouch1({ x: touch1.clientX, y: touch1.clientY })
              setStartTouch2({ x: touch2.clientX, y: touch2.clientY })
            }
          }
          return
        }
        
        // 시안 1, 2의 경우 기존 로직 유지
        const ratio = currentDistance / initialDistance
        
        if (ratio > 1.1) { // 손가락을 벌리는 동작 (핀치 아웃) - 확대 효과이므로 컬럼 감소
          setVisibleColumns(prev => Math.max(prev - 1, 1))
          setInitialDistance(currentDistance)
        } else if (ratio < 0.9) { // 손가락을 모으는 동작 (핀치 인) - 축소 효과이므로 컬럼 증가
          setVisibleColumns(prev => Math.min(prev + 1, 10))
          setInitialDistance(currentDistance)
        }
      }
    }
    
    const handleTouchEnd = (e) => {
      // 터치 끝날 때 드래그 상태 초기화
      setIsDragging(false)
      setTouchCount(e.touches.length) // 남은 터치 개수 업데이트
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
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [mode, designType, isDragging, startTouchX, touchCount, initialDistance, startTouch1, startTouch2])
  
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
    if (designType === 1 || designType === 3) {
      // 시안 1과 시안 3에서는 스크롤이 특정 방식으로만 이루어짐
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
  
  // 시안 3에서는 테이블에 스크롤을 기본적으로 막음
  if (designType === 3 && tableRef.current) {
    tableRef.current.style.overflowX = 'hidden';
  }
  
  return (
    <div className={containerClassName}>
      {/* 편집 모드일 경우 오버레이 배지 표시 */}
      {mode === 'edit' && (
        <div className="edit-badge">
          <span>편집 모드</span>
        </div>
      )}
      
      <div 
        ref={tableContainerRef} 
        className="table-container"
        style={{ position: 'relative' }}
      >
        <div 
          ref={tableRef}
          className="table-wrapper"
          style={{ 
            overflowX: designType === 2 && mode === 'edit' ? 'hidden' : (designType === 3 ? 'hidden' : 'auto'), 
            overflowY: 'hidden' 
          }}
          onScroll={handleTableScroll}
        >
          <table style={tableStyle}>
            <thead ref={headerRef}>
              <tr>
                {columns.slice(0, 10).map((column, index) => (
                  <th key={index} style={{ height: '40px' }}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {columns.slice(0, 10).map((_, index) => (
                  <td 
                    key={index} 
                    style={{ 
                      height: cellHeight, 
                      padding: '10px', 
                      border: '1px solid #ccc',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      background: mode === 'edit' ? '#fff6f0' : 'white' // 편집 모드에서 배경색 변경
                    }}
                  >
                    데이터 {index + 1}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="controls-container">
        {/* 시안 1, 2, 3: 모드 토글 */}
        <div className={`mode-toggle-container ${designType === 1 ? 'design1' : designType === 2 ? 'design2' : 'design3'}`}>
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
                : designType === 2
                  ? '현재 Edit Mode: 스크롤 및 확대/축소 불가능 (DONE 버튼 클릭시 완료 모드로 전환)'
                  : '현재 Edit Mode (DONE 버튼 클릭시 완료 모드로 전환)'
              : designType === 1
                ? '현재 Done Mode (EDIT 버튼 클릭시 편집 모드로 전환)'
                : designType === 2
                  ? '현재 Done Mode: 스크롤 및 확대/축소 가능 (EDIT 버튼 클릭시 편집 모드로 전환)'
                  : '현재 Done Mode (EDIT 버튼 클릭시 편집 모드로 전환)'
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
        
        {/* 시안 3: 두 손가락 제스처 가이드 */}
        {designType === 3 && (
          <div className="slider-container">
            <div className="gesture-instructions">
              <div className="gesture-item">
                <span className="gesture-icon">👆👆</span>
                <span className="gesture-text">두 손가락 핀치: 확대/축소</span>
              </div>
              <div className="gesture-item">
                <span className="gesture-icon">➡️ ➡️</span>
                <span className="gesture-text">두 손가락 수평 드래그: 좌우 스크롤</span>
              </div>
            </div>
            <div className="design-info">
              시안 3: 두 손가락 핀치로 확대/축소, 두 손가락 수평 이동으로 좌우 스크롤
            </div>
          </div>
        )}
        
        {/* 시안별 기능 설명 */}
        <div className="design-info">
          {designType === 1 
            ? '시안 1: edit/done 모드 기능은 동일하며, 슬라이더로 좌우 이동' 
            : designType === 2
              ? '시안 2: edit/done 모드를 통해 스크롤 및 확대/축소 기능 제어'
              : '시안 3: edit/done 모드 기능은 동일하며, 제스처로 테이블 제어'
          }
        </div>
      </div>
      
      <div className="zoom-info">
        현재 표시 중인 컬럼: {visibleColumns}개 
        <p className="zoom-instructions">
          모바일: 두 손가락으로 핀치 줌 (확대: 손가락 벌리기 = 컬럼 감소, 축소: 손가락 모으기 = 컬럼 증가)<br />
          {designType === 3 && <>두 손가락 수평 드래그: 좌우 스크롤<br /></>}
          데스크톱: Ctrl + 마우스 휠 (확대: 휠 업 = 컬럼 감소, 축소: 휠 다운 = 컬럼 증가)
        </p>
      </div>
    </div>
  )
}

export default ZoomTable 