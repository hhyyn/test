import ZoomTable from './ZoomTable'

const Page2 = () => {
  return (
    <div className="page">
      <h1>시안 2</h1>
      <p>edit/view 모드로 테이블의 가로 스크롤과 확대/축소 기능을 제어할 수 있음</p>
      <ZoomTable designType={2} />
    </div>
  )
}

export default Page2 