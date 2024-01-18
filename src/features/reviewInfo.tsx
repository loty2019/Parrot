import React, { useState, useEffect } from 'react';
import RottenTomatoes from 'data-base64:~assets/images/Rotten_Tomatoes.png';
import IMDB from 'data-base64:~assets/images/imdb_logo.png';
import Metacritic from 'data-base64:~assets/images/Metacritic_Logo.png';
import ErrorParrot from 'data-base64:~assets/images/error_parrot.png';
import { Tooltip } from "react-tooltip";
import { Loading } from "~features/loading";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import '../style.css';

const apiKey = process.env.PLASMO_PUBLIC_API_KEY;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const Review = ({name, year, TorrName}) => {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // replace every space with %20 except the last one
  let movieName = name.replace(/\s+/g, "%20").replace(/%20$/, "");
  
  // storage key
  let movieNameYear = String(name + year); // redundant but for clarity
  let ID= null;


  useEffect(() => {
    // if Key is already present in the local storage
    if (localStorage.getItem(movieNameYear) !== null) {
      //console.log("Key is already present in the local storage for " + movieNameYear + " getting data from local storage");
      // get the data from local storage
      const data = JSON.parse(localStorage.getItem(movieNameYear));
      
      // if rating return an error message (bad data)
      if (!Array.isArray(data.Ratings) || data.Ratings.length === 0) {
        console.log("Bad data for " + movieNameYear);
        // remove the bad data
        localStorage.removeItem(movieNameYear);
        // fetch data
        fetchMovieData();
        // for debugging
        // assign data
        //setMovieData(data);
        //setLoading(false);
      } else {
        // assign data
        setMovieData(data);
        setLoading(false);
      }

    } else {
      fetchMovieData();
    }
  }, []);

  const fetchMovieData = async () => {
    try {
      //API call
      const urlSearch = 'https://movie-database-alternative.p.rapidapi.com/?s='+ movieName +'&r=json&y='+ year +'&page=1';
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
        }
      };

      // fetch data
      let response = await fetch(urlSearch, options);
      let result = await response.json();

      // Retry once if the first attempt fails
      if (!response.ok) { 
        await delay(3000); // Additional delay for retry
        response = await fetch(urlSearch, options);
        result = await response.json();
      }
      if (!response.ok) {
        throw new Error('Network response was not ok' + movieName + year + response.status);
      } else if (Array.isArray(result.Search) && result.Search.length > 0 && result.Search[0].imdbID) {
        // get ID
        ID = String(result.Search[0].imdbID);
        //console.log("ID for " + movieName + "=" + ID);
        
        const urlId = 'https://movie-database-alternative.p.rapidapi.com/?r=json&i='+ ID;

        // fetch data
        response = await fetch(urlId, options);
        const resultWithID = await response.json();
        
        // assign data
        setMovieData(resultWithID);

        // store data in local storage use the movie name and year as key
        localStorage.setItem(movieNameYear, JSON.stringify(resultWithID));
        
        //console.log(resultWithID.Ratings[0].Value);
        setLoading(false);
      } else {
        throw new Error('No movie found for: ' + name + " " + year);
      }
      setLoading(false);
    
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center'>
        <Loading />
      </div>
    )
  }

  const setNewKey = () => {
    // prompt user to enter the correct movie name
    const fixedMovieName = prompt("Please enter the fixed name\n(ex. Avengers: Endgame 2023)", name + " " + year);

    // if the user enters a new name
    if (fixedMovieName !== null) {
      localStorage.setItem(TorrName, fixedMovieName);
      // reload the page
      window.location.reload();
    }
  }

  if (error) {
    if (error.startsWith("No movie found for")) {
      return(
        <div className='flex justify-center'>
          <img 
            data-tooltip-id="tooltip-error"
            data-tooltip-content= {`Ahoy, I couldn't lay me hands on ${name}, matey! Click to fix match!`}
            data-tooltip-place="top"
            className='animate-pulse w-12 h-12 hover:scale-110 hover:animate-none hover:bg-[#0002] rounded-md transition-all duration-200' 
            src={ErrorParrot} 
            alt='error'
            onClick={setNewKey}
          />
          <Tooltip id='tooltip-error' className='tooltipError' style={{ backgroundColor: "rgb(255, 255, 153)", color: "#222" }}/>
        </div>
      )
    }
    return(
      <div className='flex justify-center'>
        <img 
          data-tooltip-id="tooltip-error"
          data-tooltip-content= {`Ahoy, I encountered an error, matey! => ${error}`}
          data-tooltip-place="top"
          className='animate-pulse w-12 h-12 hover:scale-110 hover:animate-none hover:bg-[#0002] rounded-md transition-all duration-200' 
          src={ErrorParrot} 
          alt='error'
        />
        <Tooltip id='tooltip-error' className='tooltipError' style={{ backgroundColor: "rgb(255, 255, 153)", color: "#222" }}/>
      </div>
    )
  }

  const getRatingValue = (index) => {
    if (movieData && Array.isArray(movieData.Ratings)) {
      if (movieData.Ratings.length === 0) {
        return 'N/A';
      } else if (movieData.Ratings[index]) {
        return movieData.Ratings[index].Value;
      } else {
        return 'N/A';
      }
    } else {
      // Return 'N/A' if movieData is null or Ratings is not an array
      return 'N/A';
    }
  };

  return (
    <div className='review'>
      <div className='flex flex-col gap-1.5'>
        
        <div className='flex flex-row items-center rounded-md hover:bg-[#f62d1761] ease-out duration-500' 
          onClick={() => window.open(`https://www.rottentomatoes.com/search?search=`+ movieName)}
          > 
          <img className='w-5 h-5' src={RottenTomatoes} />
          <span className='p-1'>{getRatingValue(1)}</span>
        </div>

        <div className='flex flex-row items-center rounded-md hover:bg-[#ffe6756b] ease-out duration-500'
          onClick={() => window.open('https://www.imdb.com/title/'+ movieData.imdbID)}
          >
          <img className='w-5 h-5' src={IMDB}/>
          <span className='p-1'>{getRatingValue(0)}</span>
        </div>

        <div className='flex flex-row items-center rounded-md hover:bg-[#0002] ease-out duration-500'>
          <img className='w-5 h-5' src={Metacritic}/>
          <span className='p-1'>{getRatingValue(2)}</span>
        </div>
      </div>
    </div>
  )
};

export default Review;