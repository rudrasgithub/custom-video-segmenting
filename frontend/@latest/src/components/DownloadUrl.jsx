import {useEffect, useState} from 'react'
import axios from 'axios'
import {BACKEND_URL} from "../../config";

export default function DownloadUrl() {
    const [url,setUrl]=useState("");
    const [video,setVideo]=useState(null);
    const [error,setError]=useState(null)
    const [loading,setLoading]=useState(false);

    const getQualityValue = (qualityLabel) => {
        const match = qualityLabel.match(/(\d+)p/);
        return parseInt(match[1], 10);
    };
    const mp4Formats = (
        video?.availableFormats
        .filter(format => format.hasVideo && format.mimeType.includes('mp4')) // MP4 files with video
        .filter(format => getQualityValue(format.quality) >= 240) // Quality filter
        .sort((a, b) => getQualityValue(a.quality) - getQualityValue(b.quality))
    ); 
    const webmFormats = (
        video?.availableFormats
        .filter(format => format.hasVideo && format.mimeType.includes('webm')) // WebM files with video
        .filter(format => getQualityValue(format.quality) >= 240) // Quality filter
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
    }, [url])
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
                    {loading?<span className='text-green-500 text-xl font-bold'>Processing...</span>:''}
                    {/* {error?<span>Please provide valid url</span>:''} */}
                </div>
            </div>
            <div className='flex h-max'>
                {video && (
                    <div className='grid grid-cols-2 gap-5'>
                        <div className='ml-28 mr-10 flex flex-col justify-center items-center'>
                            <img 
                                src={video.thumbnail.url}
                                height={video.thumbnail.height} 
                                width={video.thumbnail.width} 
                                className='rounded-sm'
                            />
                            <h2 className='mt-5 font-semibold text'>{video.title}</h2>
                            <span className='font-semibold'>Duration: {video.TotalVideoDuration}</span>
                        </div>
                        <div>
                            <h2 className='mt-10 font-bold text-xl flex '>Downloading Options</h2>
                            <div className='flex'>
                                <div>
                                    <h3 className='pl-20 mt-10 mr-20 text-lg font-semibold mb-4'>MP4 Files</h3>
                                    {mp4Formats
                                        .map(format => (
                                            <div 
                                                key={format.itag}
                                                className='flex mb-4'
                                            >
                                                <button
                                                    className='flex justify-center items-center px-4 py-2 w-[150px] h-[50px] bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
                                                    onClick={()=>downloadVideo(format.itag, `video_${format.quality}.mp4`)}
                                                >
                                                    {format.quality}
                                                </button>
                                                {!format.hasAudio && (
                                                    <span className='flex justify-center items-center'>🔇</span>
                                                )}
                                            </div>
                                        ))
                                    }
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
        </div>
    )
}
