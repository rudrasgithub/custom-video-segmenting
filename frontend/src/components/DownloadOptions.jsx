import Mp4Formats from "./Mp4Formats";
import WebmFormats from "./WebmFormats";

export default function DownloadOptions() {
    return (
        <div>
            <h2 className='mt-10 font-semibold text-white text-xl flex'>Downloading Options</h2>
            <div  className="flex">
                <div className='flex gap-10 max-h-[500px] [scrollbar-margin-left:6px] [scrollbar-width:thin] overflow-y-auto'>
                    <Mp4Formats />
                    <WebmFormats />
                </div>
            </div>
        </div>
    )
}
