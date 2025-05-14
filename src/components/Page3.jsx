import ZoomTable from './ZoomTable'

const Page3 = () => {
  return (
    <div className="page">
      <h1>시안 3</h1>
      <p>두 손가락으로 드래그하여 테이블의 가로 스크롤을 제어할 수 있음</p>
      <ZoomTable designType={3} />
    </div>
  )
}

export default Page3 