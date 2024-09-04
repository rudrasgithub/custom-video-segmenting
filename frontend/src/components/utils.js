import axios from "axios";
import toast from 'react-hot-toast';

export const ShowToastMessage = () => {
    toast.success("Downloading started! Please wait.");
};

export const getQualityValue = (qualityLabel) => {
    const match = qualityLabel.match(/(\d+)p/);
    return parseInt(match[1], 10);
};

export const formatTime = (time) => {
    const hours = Math.floor(time / 3600) | 0;
    const minutes = Math.floor((time % 3600) / 60) | 0;
    const seconds = time % 60 | 0;
    
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const TimeFormatToSeconds = (time) => {
    if(time === null) return 0;
    const timeParts = time.split(':').map(Number);
    const [hours, minutes, seconds] = timeParts;
    
    return (hours * 3600) + (minutes * 60) + seconds;
}
const DownloadManager = (response, outputPath) => {
    const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', outputPath)
    document.body.appendChild(link);
    link.click();
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(fileUrl);
}
export const downloadVideo = async (url, itag, outputPath) => {
    try{
        const response = await axios.post(
            `${import.meta.env.REACTAPP_BACKEND_URL}/downloadVideo`,
            { url, itag, outputPath },
            { responseType: 'blob' }
        );
        DownloadManager(response, outputPath);
    } catch(err) {
        console.log('Error downloading video');
        alert('Failed to download the video.');
    }
}
export const handleDownload = async (url, startTime, endTime, outputPath) => {
    try {
        const response = await axios.post(
            `${import.meta.env.REACTAPP_BACKEND_URL}/downloadClip`,
            { url, startTime, endTime, outputPath },
            { responseType: 'blob' }
        )
        DownloadManager(response, outputPath);
    } catch(err) {
        console.log('Error downloading clip');
        alert('Failed to download the clip.');
    }
}