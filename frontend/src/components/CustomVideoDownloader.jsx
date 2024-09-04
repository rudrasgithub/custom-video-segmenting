import { useEffect } from 'react'
import axios from 'axios'
import Header from './Header';
import VideoPreview from './VideoPreview';
import DownloadOptions from './DownloadOptions';
import SegmentVideo from './SegmentVideo.jsx'
import { useSelector, useDispatch } from "react-redux"
import { 
    resetVideoState, 
    setError, 
    setIsVideoPlaying, 
    setLoading, 
    setVideo
} from "../features/video/videoSlice.js";
import Footer from './Footer.jsx';

export default function CustomVideoDownloader() {
    const dispatch = useDispatch();
    const url = useSelector((state) => state.video.url);
    const video = useSelector((state) => state.video.video);
    const isVideoPlaying = useSelector((state) => state.video.isVideoPlaying);
    
    useEffect(() => {
        dispatch(resetVideoState());
        
        if (url.trim() === "")
            return;
        const handleSubmit = async () => {
            dispatch(setLoading(true))
            try{
                dispatch(setError(null));
                const response = await axios.post(`${import.meta.env.REACTAPP_BACKEND_URL}/getVideo`,{ url });
                dispatch(setVideo(response.data));
            }catch(err){
                dispatch(setError('Failed to fetch video. Please check the URL and try again.'));
            } finally {
                dispatch(setLoading(false));
            }
        }
        handleSubmit();
    }, [url,dispatch]);

    return (
        <div className='bg-[#08003a] min-h-screen min-w-full'>
            <Header />
            {video && (
                !isVideoPlaying ?
                    <div className='grid grid-cols-2 gap-16 mt-10'>
                        <VideoPreview 
                            video={video}
                            setIsVideoPlaying={setIsVideoPlaying}                          
                        />
                        <DownloadOptions />
                    </div>
                : <SegmentVideo />
            )}
            {video && !isVideoPlaying && <Footer />}
        </div>
    )
}