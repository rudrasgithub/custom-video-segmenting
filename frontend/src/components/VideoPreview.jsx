import { useDispatch } from "react-redux";
import { setEndTime } from "../features/video/videoSlice";
import { TimeFormatToSeconds } from "./utils";

export default function VideoPreview({ video, setIsVideoPlaying }) {
    const dispatch = useDispatch();

    return (
        <div className='ml-28 mr-10 flex flex-col items-end justify-center'>
            <div>
                <img 
                    src={video.thumbnail.url}
                    width='400'
                    className='rounded-sm cursor-pointer'
                    onClick={() => {
                        dispatch(setIsVideoPlaying(true))
                        dispatch(setEndTime(TimeFormatToSeconds(video.TotalVideoDuration)))
                    }}
                />
                <h2 className='mt-5 font-normal text-white'>{video.title.substring(0,52)+'...'}</h2>
                <span className='font-normal text-white'>Duration: {video.TotalVideoDuration}</span>
            </div>
        </div>
    )
}
