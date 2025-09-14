import { 
    IconBrandLinkedin,
    IconX,
    IconBrandInstagram,
    IconBrandGithub
} from '@tabler/icons-react';

export default function Careers() {
    return (
        <div className='bg-black'>
            <h1 className="text-4xl font-bold text-white flex justify-center my-5">Follow us on</h1>
            <div className="flex gap-5 text-xl text-green-400 justify-center mb-5">
                <a href="https://www.github.com/rudrasgithub" 
                    target="_blank"
                    className='flex justify-center items-center'
                >   
                    <IconBrandGithub stroke={2} />
                    <p className='text-green-500 ml-2'>GitHub</p>
                </a>
                <a href="https://www.linkedin.com/in/rudramanaidupasupuleti" 
                    target="_blank" 
                    className='flex justify-center items-center'
                >
                    <IconBrandLinkedin stroke={2} />
                    <p className='text-green-500 ml-2'>LinkedIn</p>
                </a>
                <a href="https://x.com/rudrastwt" 
                    target="_blank" 
                    className='flex justify-center items-center'
                >
                    <IconX stroke={2} />
                    <p className='text-green-500 ml-2'>Twitter</p>
                </a>
                <a href="https://www.instagram.com/rudrasgram" 
                    target="_blank" 
                    className='flex justify-center items-center'
                >   
                    <IconBrandInstagram stroke={2} />
                    <p className='text-green-500 ml-2'>Instagram</p>
                </a>
            </div>
            <p className='text-white flex justify-center pb-5'>© 2024 Custom Video Downloader, made with ❤️ by Rudra.</p>
        </div>
    )
}
