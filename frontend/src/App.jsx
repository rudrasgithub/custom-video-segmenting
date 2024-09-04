import CustomVideoDownloader from "./components/CustomVideoDownloader"
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Toaster 
        position="top-right"
        reverseOrder={false}
      />
      <CustomVideoDownloader />
    </div>
  )
}
export default App
