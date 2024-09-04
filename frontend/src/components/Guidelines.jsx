
export default function Guidelines() {
    return (
        <div className="flex flex-col justify-center py-5 px-5">
            <h1 className='text-4xl font-normal pl-5 ml-32 underline'>Guidelines</h1>
            <div className="ml-96">
                <h1 className="text-4xl font-thin m-2">Steps to download a video:</h1>
                <div className="px-5">
                    <p>1. Paste the Youtube URL</p>
                    <p>2. Find and Click on the resolution button based on your quality and video type</p>
                    <p>3. Now your video is ready!</p>
                </div>
            </div>
            <div className="ml-96">
                <h1 className="text-4xl font-thin m-2">Steps to download a specific Clip:</h1>
                <div className="px-5">
                    <p>1. Click on the video thumbnail</p>
                    <p>2. Provide start and end time</p>
                    <p>3. Click on the Import Click button to download your customized clip</p>
                </div>
            </div>
        </div>
    )
}
