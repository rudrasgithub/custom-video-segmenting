import { lazy, Suspense } from "react";
import VideoPlayer from "./VideoPlayer";
import Loading from "./Loading";
const TimeScaleBar = lazy(() => delayForDemo(import("./TimeScaleBar")));

export default function SegmentVideo() {
    return (
        <div className="flex mt-8 w-full min-h-[550px]">
            <VideoPlayer />
            <Suspense fallback={<Loading />}>
                <TimeScaleBar />
            </Suspense>
        </div>
    )
}

function delayForDemo(promise) {
    return new Promise(resolve => {
      setTimeout(resolve, 2000);
    }).then(() => promise);
}