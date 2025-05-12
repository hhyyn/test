import ZoomTable from './ZoomTable'

const Page2 = () => {
  return (
    <div className="page">
      <h1>페이지 2</h1>
      <p>시안 2: edit/view 모드로 테이블의 가로 스크롤과 확대/축소 기능을 제어할 수 있습니다.</p>
      <ZoomTable designType={2} />
    </div>
  )
}

export default Page2 