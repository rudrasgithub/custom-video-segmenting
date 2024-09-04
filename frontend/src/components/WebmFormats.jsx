import { useSelector } from "react-redux";
import { downloadVideo, getQualityValue, ShowToastMessage } from "./utils";

export default function WebmFormats() {
    const video = useSelector((state) => state.video.video);
    const url = useSelector((state) => state.video.url);
    const formatMap = new Map();

    video.availableFormats.forEach(format => {
        if (format.hasVideo && format.mimeType.includes('webm')) {
            const key = `${format.quality}-${format.hasAudio}`;
            if (!formatMap.has(key)) {
                formatMap.set(key, {
                    quality: format.quality,
                    hasAudio: format.hasAudio,
                    itags: [format.itag]
                });
            }
        }
    });
    // Convert the map to an array and sort by quality
    const webmFormats = Array.from(formatMap.values())
        .sort((a, b) => getQualityValue(a.quality) - getQualityValue(b.quality)); // Sort by quality

    return (
        <div>
            {webmFormats.length > 0 && (
                <h3 className='text-lg text-white font-normal mb-4 mt-10 flex justify-center'>WebM Files</h3>
            )}
            {webmFormats.map(({ quality, hasAudio, itags }) => (
                <div key={`${quality}-${hasAudio}`} className='flex flex-col'>
                    <div className='flex mb-4'>
                        {itags.map(itag => (
                            <button
                                key={`${quality}-${hasAudio}-${itag}`}
                                className='flex justify-center items-center px-4 py-2 w-[150px] h-[50px] bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
                                onClick={() => {
                                    ShowToastMessage();
                                    downloadVideo(url, itag, `video_${quality}.webm`);
                                }}
                            >
                                {quality}
                            </button>
                        ))}
                        {!hasAudio && (
                            <span className='flex justify-center items-center'>🔇</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
