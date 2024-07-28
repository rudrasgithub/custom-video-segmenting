import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

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

app.post('/streamVideo', async (req, res) => {
    const videoUrl = req.body.videoUrl;

    ytdl(videoUrl, { quality: 'highest' }).pipe(res);
    res.json({
        message: 'you can start streaming the video'
    })
})

app.post('/downloadVideo', async (req, res) => {
    const { videoUrl,itag, outputPath } = req.body;
    try{
        console.log(videoUrl);
        const finalPath = path.join(process.cwd(), outputPath);
        console.log(finalPath);
        ytdl(videoUrl, { itag:itag })
            .pipe(fs.createWriteStream(finalPath))
            .on('finish', () => console.log('Video download completed' ))
            .on('error', () => console.log('Error downloading the video'));
        res.json({ message: 'Video downloaded',
            path:finalPath
         })
    } catch(err) {
        res.json({ message: err });
    }
})

app.post('/downloadClip', async (req, res) => {
    const segmentVideo =async (videoUrl, startTime, endTime, itag, outputPath) => {
        const stream = ytdl(videoUrl, { itag: itag });
        await new Promise(resolve => setTimeout(resolve, 5000));
        ffmpeg(stream)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(outputPath)
            .on('end', () => {
                console.log('Segment extraction finished');
            })
            .on('error', (err) => {
                console.error('Error during extraction:', err);
            })
            .run();
    }
    const { videoUrl, startTime, endTime, itag, outputPath } = req.body;

    try {
        await segmentVideo(videoUrl, startTime, endTime, itag, outputPath);
        res.json({
            message: 'Segment video successfully'
        });
    } catch(err) {
        res.json({
            message: 'Error during segment extraction:', err
        })
    }
})

app.listen(3000);