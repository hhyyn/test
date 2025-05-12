import ZoomTable from './ZoomTable'

const Page1 = () => {
  return (
    <div className="page">
      <h1>시안 1</h1>
      <p>슬라이더로 테이블의 가로 스크롤을 제어</p>
      <ZoomTable designType={1} />
    </div>
  )
}

export default Page1 