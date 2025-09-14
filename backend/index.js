import express from 'express';
import ytdl from '@distube/ytdl-core';
import cors from 'cors';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from "fs";

const app=express()
app.use(express.json());

// Configure ytdl-core with better headers for serverless environments
const ytdlOptions = {
    requestOptions: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    }
};

// CORS configuration for both development and production
const corsOptions = {
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Alternative local port
        'http://localhost:4173',  // Vite preview server
        "https://custom-video-segmenting-backend.vercel.app",
        'https://custom-video-segmenting-frontend.vercel.app', // Production frontend
        'https://custom-video-segmenting-frontend-izphj7c2u.vercel.app', // Current deployment
        /^https:\/\/custom-video-segmenting-frontend.*\.vercel\.app$/  // Vercel preview deployments
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Log CORS origin for debugging
app.use((req, res, next) => {
    console.log('Request from origin:', req.headers.origin);
    next();
});

ffmpeg.setFfmpegPath(ffmpegPath);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Custom Video Segmenting Backend API', 
        status: 'running',
        endpoints: ['/getVideo', '/downloadVideo', '/downloadClip'],
        cors: {
            allowedOrigins: corsOptions.origin,
            currentOrigin: req.headers.origin
        }
    });
});

app.post('/getVideo', async (req, res) => {
    const videoUrl = req.body.url;
    
    // Log the incoming request for debugging
    console.log('getVideo request:', { url: videoUrl, origin: req.headers.origin });
    
    if (!videoUrl) {
        return res.status(400).json({ message: 'Please provide the video url' });
    }
    
    // Basic URL validation
    try {
        new URL(videoUrl);
    } catch (urlError) {
        console.log('Invalid URL format:', videoUrl);
        return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    // Check if it's a YouTube URL
    if (!ytdl.validateURL(videoUrl)) {
        console.log('Not a valid YouTube URL:', videoUrl);
        return res.status(400).json({ message: 'Please provide a valid YouTube URL' });
    }
    
    try {
        console.log('Attempting to get video info for:', videoUrl);
        
        // First attempt with enhanced headers
        let info;
        try {
            info = await ytdl.getInfo(videoUrl, ytdlOptions);
        } catch (firstError) {
            console.log('First attempt failed, trying with different approach:', firstError.message);
            
            // Second attempt with just basic options if the first fails
            try {
                info = await ytdl.getInfo(videoUrl, { 
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                        }
                    }
                });
            } catch (secondError) {
                console.log('Second attempt failed, trying basic request:', secondError.message);
                // Third attempt with minimal options
                info = await ytdl.getInfo(videoUrl);
            }
        }
        
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

        console.log('Successfully retrieved video info for:', title);
        return res.json({
            title,  
            thumbnail,
            TotalVideoDuration,
            availableFormats
        });
    } catch(error) {
        console.error('Error getting video info:', error.message);
        return res.status(500).json({ 
            message: 'Unable to retrieve video information. Please check the URL and try again.',
            error: error.message 
        });
    }
})

app.post('/downloadVideo', async (req, res) => {
    const { url, itag, outputPath } = req.body;
    try{
        res.setHeader('Content-Disposition', `attachment; filename="${outputPath}"`);
        res.setHeader('Content-Type', 'video/mp4');

        ytdl(url, { quality: itag, ...ytdlOptions })
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
        const stream = ytdl(url, { quality: 18, ...ytdlOptions });
       
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