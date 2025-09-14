import { useDispatch, useSelector } from "react-redux"
import { setEndTime, setStartTime } from "../features/video/videoSlice";
import { useState } from "react";
import { formatTime, TimeFormatToSeconds } from "./utils"
import TimeScaleButtons from './TimeScaleButtons'

export default function TimeScaleBar() {
    const dispatch = useDispatch()
    const startTime = useSelector((state) => state.video.startTime);
    const endTime = useSelector((state) => state.video.endTime);

    const [startInput, setStartInput] = useState(formatTime(startTime));
    const [endInput, setEndInput] = useState(formatTime(endTime));
    const [prevStartInput, setPrevStartInput] = useState(formatTime(startTime));
    const [prevEndInput, setPrevEndInput] = useState(formatTime(endTime));

    const isValidTime = (value) => {
        const timeParts = value.split(':').map(Number);
        const [hours=0, minutes=0, seconds=0] = timeParts;

        if (minutes >= 60 || seconds >= 60) return false;
        if(seconds < 9) {
            return true;
        }
        const now = hours*3600 + minutes*60 + seconds;
        return now >= 0 && now < endTime;
    };
    const handleInputChange = (e, setInput, prevInput, setPrevInput, setTime) => {
        let value = e.target.value.replace(/[^0-9:]/g, "");
        const numberOfColons = (value.match(/:/g) || []).length;

        if (numberOfColons > 2 || !isValidTime(value)) {
            setInput(prevInput);
            return;
        }
        setInput(value);

        if (value.length === 8) {
            const timeParts = value.split(':').map((part) => part.padStart(2, '0'));
            const formattedTime = timeParts.join(':');
            const formattedSeconds = TimeFormatToSeconds(formattedTime);
            
            if (formattedSeconds === endTime) {
                setInput(prevInput);
            } else {
                setInput(formattedTime);
                setPrevInput(formattedTime);
                dispatch(setTime(formattedSeconds));
            }
        }
    };

    return (
        <div className="w-1/3">
            <div className="mt-28 items-center gap-5 flex ml-10">
                <input
                    type="text"
                    value={startInput}
                    onChange={(e) => handleInputChange(e, setStartInput, prevStartInput, setPrevStartInput, setStartTime)}
                    placeholder="Start Time"
                    className="px-3 py-3 w-24 rounded-md focus:outline-none text-center"
                />
                <h1 className="text-3xl text-white">-</h1>
                <input
                    type="text"
                    value={endInput}
                    onChange={(e) => handleInputChange(e, setEndInput, prevEndInput, setPrevEndInput, setEndTime)}
                    placeholder="End Time"
                    className="px-3 py-3 w-24 rounded-md focus:outline-none text-center"
                />
            </div>
            <div className="flex items-center ml-32 pt-5 text-white font-light">
                {(endTime - startTime).toFixed(1)} seconds
            </div>
            <TimeScaleButtons 
                startTime={startTime}
                endTime={endTime}
            />
        </div>
    )
}
