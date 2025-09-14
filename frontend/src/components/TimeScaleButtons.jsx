import { useDispatch, useSelector } from "react-redux";
import { setIsVideoPlaying } from "../features/video/videoSlice";
import { handleDownload, ShowToastMessage } from "./utils";

export default function TimeScaleButtons({ startTime, endTime }) {
    const dispatch = useDispatch();
    const url = useSelector((state) => state.video.url);
    
    return (
        <div className="flex ml-10 gap-5 items-center">
            <button 
                type="button"
                onClick={() => dispatch(setIsVideoPlaying(false))}
                className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 
                focus:ring-red-300 font-medium rounded-lg text-lg px-5 py-3.5 me-2 mb-2 mt-5 justify-center items-center"
            >
                Cancel
            </button>
            <button 
                type="button" 
                onClick={() => {
                    ShowToastMessage();
                    handleDownload(url, startTime, endTime, 'video_clip.mp4');
                }}
                className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 
                focus:ring-green-300 font-medium items-center justify-center rounded-lg text-lg px-5 py-3.5 me-2 mb-2 mt-5"
            >
                Import Clip
            </button>
        </div>
    )
}
