import { useDispatch, useSelector } from "react-redux";
import { setUrl } from "../features/video/videoSlice";

export default function Header() {
    const dispatch = useDispatch();
    const url = useSelector((state) => state.video.url);
    const error = useSelector((state) => state.video.error);
    const loading = useSelector((state) => state.video.loading);

    return (
        <div className='flex flex-col items-center min-w-full'>
            <h1 className='mt-5 text-4xl text-red-500 font-bold mb-4'>Download Your Customized Video</h1>
            <div>
                <input
                    autoFocus
                    type='text'
                    className='mt-5 px-4 py-5 border-block rounded-lg mr-5 w-[500px] focus:outline-none'
                    placeholder='Paste your video link here'
                    value={url}
                    onChange={(e)=>dispatch(setUrl(e.target.value))}
                />
                {error? <span className="text-red-500">Please provide a valid url</span>:(
                    loading?<span className='text-green-500 text-xl font-bold'>Processing...</span>:''
                )}
            </div>
        </div>
    );
}