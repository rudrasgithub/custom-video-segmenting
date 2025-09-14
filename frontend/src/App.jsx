import CustomVideoDownloader from "./components/CustomVideoDownloader"
import { Toaster } from "react-hot-toast";
import { ENV_INFO } from "./config.js";

function App() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Toaster 
        position="top-right"
        reverseOrder={false}
      />
      {/* Debug info - remove after fixing */}
      <div className="fixed top-2 left-2 bg-black text-white text-xs p-2 rounded z-50 max-w-sm">
        <div>Mode: {ENV_INFO.mode}</div>
        <div>Backend URL: {ENV_INFO.backendUrl}</div>
        <div>Env Backend URL: {ENV_INFO.envBackendUrl}</div>
      </div>
      <CustomVideoDownloader />
    </div>
  )
}

export default App
