import { useSelector } from "react-redux";
import ReactPlayer from "react-player"; 
import { useEffect, useRef, useState } from "react";

export default function VideoPlayer() {
    const url = useSelector((state) => state.video.url);
    const startTime = useSelector((state) => state.video.startTime);
    const endTime = useSelector((state) => state.video.endTime);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    
    const handleProgress = ({ playedSeconds }) => {
        if (playedSeconds > endTime) {
            playerRef.current.seekTo(startTime);
            setIsPlaying(true);
        }
    };
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(startTime);
            setIsPlaying(true);
        }
    }, [startTime]);

    return (
        <div className="bg-black w-2/3 mx-36">
            <ReactPlayer
                url={url}
                ref={playerRef}
                playing={isPlaying}
                loop={true}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />
        </div>
    )
}
