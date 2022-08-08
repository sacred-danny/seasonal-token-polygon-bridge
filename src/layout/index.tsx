import { Nav } from '../components/Nav';

export const Layout = ({children}: any) => {
  
  return (
    <div className="w-full flex flex-col min-h-screen bg-main bg-cover font-poppins">
      <div className="px-[10%] w-full lg:fixed z-10 py-10">
        <Nav/>
      </div>
      <div className="px-[10%] w-full flex flex-col lg:h-screen justify-center items-center lg:overflow-hidden py-40 lg:py-0">
        <div className="w-full">
        {children}
        </div>
      </div>
    </div>
  )
}
