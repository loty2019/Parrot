import React, { useState } from 'react';
import trailerImg from "data-base64:~/assets/images/trailer.png";
import { Tooltip } from "react-tooltip";
import dotenv from 'dotenv';
import axios from 'axios';
import '../style.css';

dotenv.config({ path: '.env' });
const apiKey = process.env.PLASMO_PUBLIC_YOUTUBE_API_KEY;
const rapidApiKey = process.env.PLASMO_PUBLIC_RAPID_API_KEY;

export const TrailerButton = ({ name, year }) => {
    const [videoId, setVideoId] = useState(null);
    const [showPlayer, setShowPlayer] = useState(false);

    const fetchYouTubeAPI = async (query) => {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&key=${apiKey}&type=video`;
        return fetch(url)
            .then(response => {
                if (!response.ok && response.status === 403) {
                    throw new Error('QuotaReached');
                }
                return response.json();
            });
    };

    // Define the fallback fetch function using Axios and RapidAPI
    const fetchRapidAPI = async (query) => {
        const options = {
            method: 'GET',
            url: 'https://youtube-v311.p.rapidapi.com/search/',
            params: {
                part: 'snippet',
                maxResults: '1',
                order: 'relevance',
                q: query,
                safeSearch: 'moderate',
                type: 'video,channel,playlist'
            },
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'youtube-v311.p.rapidapi.com'
            }
        };
        return axios.request(options).then(response => response.data);
    };

    const handleClick = async () => {
        const storedItemKey = `${name}${year}`;
        const storedItem = localStorage.getItem(storedItemKey);
        let storedObject = storedItem ? JSON.parse(storedItem) : null;
    
        // Function to save the video ID to local storage
        const saveIdToLocalStorage = (id) => {
            // Attempt to retrieve the current object from local storage
            const existingItem = localStorage.getItem(storedItemKey);
            const existingObject = existingItem ? JSON.parse(existingItem) : {};
        
            // Add the 'videoId' field to the existing object or create it if not present
            existingObject.videoId = id;
        
            // Save the updated object back to local storage
            localStorage.setItem(storedItemKey, JSON.stringify(existingObject));
        };
    
        // Function to fetch the video ID
        const fetchId = async () => {
            try {
                const searchQuery = `${name + " " + year} trailer`;
                const data = await fetchYouTubeAPI(searchQuery);
                if (data.items.length > 0) {
                    const videoId = data.items[0].id.videoId;
                    setVideoId(videoId);
                    saveIdToLocalStorage(videoId);
                    setShowPlayer(true);
                } else {
                    console.log('No videos found');
                }
            } catch (error) {
                console.error('Error fetching video', error);
                if (error.message === 'QuotaReached') {
                    const searchQuery = `${name + " " + year} trailer`;
                    const rapidData = await fetchRapidAPI(searchQuery);
                    if (rapidData.items && rapidData.items.length > 0) {
                        const videoId = rapidData.items[0].id.videoId;
                        setVideoId(videoId);
                        saveIdToLocalStorage(videoId);
                        setShowPlayer(true);
                    } else {
                        console.log('No videos found on fallback API');
                    }
                }
            }
        };
    
        if (showPlayer) {
            setShowPlayer(false);
            setVideoId(null);
        } else if (storedObject && storedObject.videoId) {
            setVideoId(storedObject.videoId);
            setShowPlayer(true);
        } else {
            await fetchId();
        }
    };


    return (
        <div className="flex justify-center relative">
            <img 
                src={trailerImg} 
                alt="Trailer" 
                className="w-10 h-10 hover:scale-110 p-1 hover:bg-[#0002] rounded-md transition-all duration-200 cursor-pointer" 
                onClick={handleClick} 
                data-tooltip-id="tooltip-trailer" 
                data-tooltip-content="Watch the trailer!"
                data-tooltip-place="top" 
                data-tooltip-delay-show={2000} 
            />
            <Tooltip id='tooltip-trailer'/>
            {showPlayer && videoId && (
                <div className="absolute left-full top-0 ml-4 w-96 h-56 bg-white rounded-lg shadow-lg overflow-hidden">
                    <button 
                        className="absolute top-2 right-2 text-lg font-bold text-white bg-red-500 rounded-full w-6 h-6 flex justify-center items-center hover:bg-red-700 transition-all duration-200" 
                        onClick={() => setShowPlayer(false)}>×</button>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </div>
    );
    
}
