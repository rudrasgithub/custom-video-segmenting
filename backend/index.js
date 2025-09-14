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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
    }
};

// Alternative options with different user agents
const fallbackOptions = [
    {
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': '*/*'
            }
        }
    },
    {
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        }
    },
    {
        requestOptions: {
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Accept': '*/*'
            }
        }
    }
];

// Helper function to extract video ID from URL
function getVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Alternative method using direct YouTube API approach
async function getVideoInfoAlternative(videoUrl) {
    const videoId = getVideoId(videoUrl);
    if (!videoId) {
        throw new Error('Could not extract video ID from URL');
    }
    
    // This is a simplified approach - in production, you might want to use 
    // a service like youtube-dl-exec or youtube-transcript-api
    throw new Error('Alternative method not yet implemented');
}

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
        
        // Try multiple approaches with different user agents and delays
        let info;
        let lastError;
        
        for (let i = 0; i < fallbackOptions.length + 1; i++) {
            try {
                const options = i === 0 ? ytdlOptions : fallbackOptions[i - 1];
                console.log(`Attempt ${i + 1} with user agent:`, options.requestOptions.headers['User-Agent']);
                
                // Add a small delay between attempts to avoid rate limiting
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * i));
                }
                
                info = await ytdl.getInfo(videoUrl, options);
                console.log('Successfully retrieved video info on attempt', i + 1);
                break;
            } catch (error) {
                console.log(`Attempt ${i + 1} failed:`, error.message);
                lastError = error;
                
                // If this is the last attempt, throw the error
                if (i === fallbackOptions.length) {
                    throw lastError;
                }
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
        
        // Provide specific error messages based on the error type
        let userMessage = 'Unable to retrieve video information. Please check the URL and try again.';
        let suggestions = [];
        
        if (error.message.includes('Sign in to confirm you\'re not a bot')) {
            userMessage = 'YouTube is currently blocking automated requests. This is a temporary restriction.';
            suggestions = [
                'Try again in a few minutes',
                'Make sure the video is public and not age-restricted',
                'Check if the video URL is correct'
            ];
        } else if (error.message.includes('Video unavailable')) {
            userMessage = 'This video is unavailable or has been removed.';
            suggestions = [
                'Check if the video exists',
                'Make sure the video is public',
                'Try a different video URL'
            ];
        } else if (error.message.includes('Private video')) {
            userMessage = 'This video is private and cannot be accessed.';
            suggestions = ['Only public videos can be processed'];
        }
        
        return res.status(500).json({ 
            message: userMessage,
            suggestions: suggestions,
            error: error.message,
            troubleshooting: {
                tip: 'This issue often occurs in serverless environments due to YouTube\'s bot detection.',
                workaround: 'Try using the application locally for now, or contact support for alternative solutions.'
            }
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