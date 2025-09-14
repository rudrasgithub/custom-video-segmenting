import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from "fs";

const app=express()
app.use(express.json());
app.use(cors());

ffmpeg.setFfmpegPath(ffmpegPath);

app.post('/getVideo', async (req, res) => {
    const videoUrl=req.body.url;
    if(!videoUrl) return res.status(400).json({message:'Please provide the video url'})
    try{
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;
        const thumbnail = info.videoDetails.thumbnail.thumbnails[2];
        const VideoDurationInSeconds = info.videoDetails.lengthSeconds;

        const hours = Math.floor(VideoDurationInSeconds/3600);
        const minutes = Math.floor((VideoDurationInSeconds%3600)/60);
        const seconds = VideoDurationInSeconds%60;

        const TotalVideoDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const formats = info.formats;
        const availableFormats = formats.map(format => ({
            quality: format.qualityLabel || 'Audio',
            itag: format.itag,
            url: format.url,
            mimeType: format.mimeType,
            hasAudio: format.hasAudio,
            hasVideo: format.hasVideo
        }));

        return res.json({
            title,  
            thumbnail,
            TotalVideoDuration,
            availableFormats
        })
    } catch(e) {
        res.status(500).send('Invalid URL')
    }
})

app.post('/downloadVideo', async (req, res) => {
    const { url, itag, outputPath } = req.body;
    try{
        res.setHeader('Content-Disposition', `attachment; filename="${outputPath}"`);
        res.setHeader('Content-Type', 'video/mp4');

        ytdl(url, { quality: itag })
        .on('finish', () => {
            console.log('Finished downloading');
        })
        .on('error', (err) => {
            console.error('Error during download:', err);
            res.status(500).json({ message: 'Error during download' });
        })
        .pipe(res);
    } catch(err) {
        res.json({ message: err });
    }
})

app.post('/downloadClip', async (req, res) => {
    const { url, startTime, endTime, outputPath } = req.body;
    try {
        res.setHeader('Content-Disposition', `attachment; filename="${outputPath}"`);
        res.setHeader('Content-Type', 'video/mp4');
        
        const tempFilePath = 'temp_clip.mp4';
        const stream = ytdl(url, { quality: 18 });
       
        ffmpeg(stream)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .format('mp4')
            .on('end', () => {
                console.log('Segment extraction finished');
                res.download(tempFilePath, outputPath, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                    }
                    fs.unlinkSync(tempFilePath);
                });
            })
            .on('start', () => {
                console.log('started');
            })
            .on('finish', () => {
                console.log('finished');
            })
            .on('error', (err) => {
                console.error('Error during extraction:',err);
                if (!res.headersSent) {
                    res.status(500).send('Error during video processing');
                }   
            })
            .save(tempFilePath);
    } catch (err) {
        console.error('Unexpected error:');
        res.status(500).send('Unexpected server error');
    }
})

app.listen(3000);