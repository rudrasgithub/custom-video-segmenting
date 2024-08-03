import {useEffect, useState} from 'react'
import axios from 'axios'
import {BACKEND_URL} from "../../config";
import ReactPlayer from 'react-player';

export default function DownloadUrl() {
    const [url,setUrl]=useState("");
    const [video,setVideo]=useState(null);
    const [error,setError]=useState(null)
    const [loading,setLoading]=useState(false);
    const [getStream, setGetStream] = useState(false);

    const getQualityValue = (qualityLabel) => {
        const match = qualityLabel.match(/(\d+)p/);
        return parseInt(match[1], 10);
    };
    const mp4Formats = (
        video?.availableFormats
        .filter(format => format.hasVideo && format.mimeType.includes('mp4'))
        .sort((a, b) => getQualityValue(a.quality) - getQualityValue(b.quality))
        .reduce((map,format) => {
            const quality = format.quality;
            const hasAudio = format.hasAudio;
            const { itag } = format.itag;

            if (!map.has(quality)) {
                map.set(quality, [{hasAudio, itag}]);
            } else {
                const existingValues = map.get(quality);
                if (hasAudio===true && existingValues.hasAudio!==true){
                    map.set(quality, [...existingValues, {hasAudio, itag}]);
                }
            }
            return map;
        }, new Map()));

    const webmFormats = (
        video?.availableFormats
        .filter(format => format.hasVideo && format.mimeType.includes('webm')) // WebM files with video
        .sort((a, b) => getQualityValue(a.quality) - getQualityValue(b.quality))
    );
    const downloadVideo = async (itag, outputPath) => {
        try{
            const response = await axios.post(`${BACKEND_URL}/downloadVideo`,{
                videoUrl:url,
                itag,
                outputPath
            });
            if (response.data.message === 'Video downloaded') {
                const fileDownloadUrl = `${response.data.finalPath}`;
                const link = document.createElement('a');
                link.href = fileDownloadUrl;
                link.download = outputPath;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('Failed to download the video.');
            }
        }catch(err){
            console.log('Error downloading video');
        }
    }
    useEffect(() => {
        if (url.trim() === "") return;
        const handleSubmit=async()=>{
            setLoading(true);
            try{
                setError(null);
                const response=await axios.post(`${BACKEND_URL}/getVideo`,{url});
                setLoading(false);
                setVideo(response.data);
            }catch(err){
                setError('Failed to fetch video. Please check the URL and try again.')
                setLoading(false);
            }
        }
        handleSubmit();
    }, [url]);

    return (
        <div className='bg-gray-200 min-h-screen min-w-full'>
            <div className='flex flex-col items-center min-w-full'>
                <h1 className='mt-5 text-4xl text-red-500 font-bold mb-4'>Download Your Customized Video</h1>
                <div>
                    <input
                        autoFocus
                        type='text'
                        className='mt-5 px-4 py-5 border-block rounded-lg mr-5 w-[500px]'
                        placeholder='Paste your video link here'
                        value={url}
                        onChange={(e)=>setUrl(e.target.value)}
                    />
                    {error?<span>Please provide valid url</span>:(
                        loading?<span className='text-green-500 text-xl font-bold'>Processing...</span>:''
                    )}
                </div>
            </div>
                {video && (
                    <div className='grid grid-cols-2 gap-16'>
                        <div className='ml-28 mr-10 flex flex-col items-end justify-center'>
                            {!getStream ? (
                                <img 
                                    src={video.thumbnail.url}
                                    width='400'
                                    className='rounded-sm cursor-pointer'
                                    onClick={() => setGetStream(true)}
                                />
                            ) : (
                                <div className='bg-black'>
                                    <ReactPlayer
                                        url={video.url}
                                        controls
                                        width='100%'
                                        height='auto'
                                    />
                                    <button
                                        onClick={() => setGetStream(false)}
                                        className='absolute top-5 right-5 bg-red-500 text-white p-2 rounded'
                                    >
                                        Close
                                    </button>
                                    </div>
                            )}
                            <h2 className='mt-5 font-semibold text'>{video.title.substring(0,50)}</h2>
                            <span className='font-semibold'>Duration: {video.TotalVideoDuration}</span>
                        </div>
                        <div>
                            <h2 className='mt-10 font-bold text-xl flex '>Downloading Options</h2>
                            <div className='flex'>
                                <div>
                                    <h3 className='pl-20 mt-10 mr-20 text-lg font-semibold mb-4'>MP4 Files</h3>
                                    {Array.from(mp4Formats.entries()).map(([quality, formats]) => (
                                        <div key={quality} className='flex flex-col'>
                                            {formats.map(({ hasAudio, itag }) => (
                                                <div 
                                                    key={itag}
                                                    className='flex mb-4'
                                                >
                                                    <button
                                                        className='flex justify-center items-center px-4 py-2 w-[150px] h-[50px] bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
                                                        onClick={()=>downloadVideo(itag, `video_${quality}.mp4`)}
                                                    >
                                                        {quality}
                                                    </button>
                                                    {!hasAudio && (
                                                        <span className='flex justify-center items-center'>🔇</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {webmFormats.length > 0 && (
                                    <div>
                                        <h3 className='text-lg font-semibold mb-4 mt-10 flex justify-center'>WebM Files</h3>
                                        {webmFormats
                                            .map(format => (
                                                <div key={format.itag} className='flex mb-4'>
                                                    <button
                                                        className='flex-1 items-center px-4 py-2 w-[150px] h-[50px] bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400'
                                                        onClick={()=>downloadVideo(format.itag, `video_${format.quality}.webm`)}
                                                    >
                                                        {format.quality}
                                                    </button>
                                                    {!format.hasAudio && (
                                                        <span className='flex justify-center items-center ml-2 text-gray-500'>🔇</span>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}
