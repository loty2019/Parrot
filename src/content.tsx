import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useState, useEffect } from 'react';
import { Review } from "~features/reviewInfo";
import { TrailerButton } from "./features/trailer-button";
import {NotAllowed} from "~features/notAllowed";
import { createRoot } from 'react-dom/client';
import { Loading } from "~features/loading";
import "react-tooltip/dist/react-tooltip.css";
import 'style.css';

export const config: PlasmoCSConfig = {
  matches: 
  [ "*://kickasstorrent.cr/*",
    "*://kickasstorrents.cr/*",
    "*://kickasstorrent.to/*",
    "*://kickasstorrents.to/*", 
    "*://kickass.sx/*", 
    "*://katcr.to/*", 
    "*://kat.am/*", 
    "*://kat.cr/*", 
    "*://kickass.cr/*", 
    "*://kickass.to/*"
  ],
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
}

// return the movie year
const getMovieYear = ({TorrName}) => {
  // if the check is in local storage
  if ( localStorage.getItem(TorrName) !== null) {
    TorrName = localStorage.getItem(TorrName);
  }
  // extract year
  const yearPattern = /\d{4}/;

  //const SpecialYearPattern = /d{4}\d{4}/;

  const yearMatch = TorrName.match(yearPattern); // Get the year of the movie
  let year = null;
    if (yearMatch) {
      year = parseInt(yearMatch[0], 10); // Access the first element of the array

      // If year is lower than 1888 then it is not a valid year
      // Get the current year
      const currentYear = new Date().getFullYear();

      // Use the currentYear variable in your code
      if (year < 1888 || year > currentYear + 1) {
        year = null; // or handle this case as needed
      }
    }
  return year;
}

// return movie name
const getMovieName = ({ TorrName }) => {
  // Check if the TorrName is in local storage and use it if available
  if (localStorage.getItem(TorrName) !== null) {
    TorrName = localStorage.getItem(TorrName);
  }

  // Function to get the movie year, assumed to be available in scope
  const year = getMovieYear({ TorrName });

  // Regular expressions for season and episode, and season patterns
  const seasonEpisodePattern = /S\d{2}E\d{2}/;
  const seasonPattern = /S\d{2}/;

  // Initialize movieName with TorrName
  let movieName = TorrName;

  // Check and remove year, season and episode, or just season pattern
  if (year) {
    movieName = movieName.split(year)[0].trim();
  } else {
    const seasonEpisodeMatch = TorrName.match(seasonEpisodePattern);
    const seasonMatch = TorrName.match(seasonPattern);

    if (seasonEpisodeMatch) {
      movieName = TorrName.split(seasonEpisodeMatch[0])[0].trim();
    } else if (seasonMatch) {
      movieName = TorrName.split(seasonMatch[0])[0].trim();
    }
  }

  // Remove "Season" with optional number
  movieName = movieName.replace(/Season\s*\d*/, "");

  movieName = movieName.split(/[\s_][\d{4}|S\d{2}]/)[0].trim();

  // Remove any remaining parentheses and trailing spaces
  movieName = movieName.replace(/[()]/g, "").trim();

  return movieName;
};

// get movie year
const addTrailerColumn = () => {
  const table = document.querySelector('table.data.frontPageWidget');
  if (!table) return;

  // Add header for the Trailer column
  const headerRow = table.querySelector('tr.firstr');
  const trailerHeader = document.createElement('th');
  trailerHeader.textContent = 'Trailer';
  trailerHeader.classList.add('center');
  headerRow.insertBefore(trailerHeader, headerRow.children[1]);

  // Add Trailer button to each row
  const rows = table.querySelectorAll('tr.odd, tr.even');
  rows.forEach(row => {
    const isExcludedRow = row.querySelector('.markeredBlock a[href*="/xxx/"]') !== null; // exclude adult content
    const isMusicRow = row.querySelector('.markeredBlock a[href*="/music/"]') !== null; // check for music content
    const isGameRow = row.querySelector('.markeredBlock a[href*="/games/"]') !== null; 
    const trailerCell = document.createElement('td'); // create a new cell for the Trailer button
    let TorrName = row.querySelector('a.cellMainLink').textContent; 
    
    let movieNameAndYear = null; // Concatenate the movie name and year
    // print movie name
    //console.log(getMovieName({TorrName}));
    // print movie year
    //console.log(getMovieYear({TorrName}));


    if (getMovieYear({TorrName}) === null) {
      movieNameAndYear = getMovieName({TorrName});
    } else {
      movieNameAndYear = getMovieName({TorrName}) + ' ' + getMovieYear({TorrName});
    }
    // console.log(movieNameAndYear);

    // Create a container for the React component
    const trailerButtonContainer = document.createElement('div');
    const root = createRoot(trailerButtonContainer);
    // Check the category of the torrent
    if (!isExcludedRow) {

      //console.log(movieNameAndYear);

      if (isMusicRow) {
        trailerButtonContainer.textContent = 'Music';
        trailerCell.appendChild(trailerButtonContainer);
      } else if (isGameRow){
        trailerButtonContainer.textContent = 'Game';
        trailerCell.appendChild(trailerButtonContainer);
      } else {
        
        // Mount the React component
        root.render(<TrailerButton trailerUrl={movieNameAndYear}/>);
        trailerCell.appendChild(trailerButtonContainer);
      }
    } else {
      root.render(<NotAllowed/>);
      trailerCell.appendChild(trailerButtonContainer);
    }
    
    row.insertBefore(trailerCell, row.children[1]);
  });
};

const processReviewRow = (row) => {
  return new Promise<void>((resolve) => {
    let delay = 200;
    const isExcludedRow = row.querySelector('.markeredBlock a[href*="/xxx/"]') !== null; // exclude adult content
    const isMusicRow = row.querySelector('.markeredBlock a[href*="/music/"]') !== null; // check for music content
    const isGameRow = row.querySelector('.markeredBlock a[href*="/games/"]') !== null; // check for movie content
    const reviewCell = document.createElement('td');
    let TorrName = row.querySelector('a.cellMainLink').textContent;

    // create root element
    const reviewContainer = document.createElement('div');
    const root = createRoot(reviewContainer);
    // Check the category of the torrent
    if (!isExcludedRow) {
      if (isMusicRow) {
        reviewContainer.textContent = 'Music Review';
        reviewCell.appendChild(reviewContainer);
        delay = 0;
      } else if (isGameRow){
        reviewContainer.textContent = 'Game Review';
        reviewCell.appendChild(reviewContainer);
        delay = 0;
      } else {
        let movieName = getMovieName({TorrName});
        let movieYear = getMovieYear({TorrName});

        if (localStorage.getItem(movieName + movieYear) !== null) {

          const data = JSON.parse(localStorage.getItem(movieName + movieYear));

          if (!Array.isArray(data.Ratings) || data.Ratings.length === 0) {
            delay = 300;
          } else{
            delay = 0;
          }
        }
        // Fetch and render review data here
        root.render(<Review name={movieName} year={movieYear} TorrName={TorrName}/>); // Use the getMovieRating component
        
        addPosterColumn(row);
        reviewCell.appendChild(reviewContainer);
      }
    } else {
      root.render(<NotAllowed/>);
      reviewCell.appendChild(reviewContainer);
      delay = 0;
    }
    row.insertBefore(reviewCell, row.children[2]);

    // After processing the row, wait for a specified time
    setTimeout(() => {
      resolve();
    }, delay); // delay  between eah row
  });
};

const loadingRow = (row) => {
  const loadingCell = document.createElement('td');
  const loadingContainer = document.createElement('div');
  createRoot(loadingContainer).render(<Loading/>);
  loadingCell.appendChild(loadingContainer);
  row.insertBefore(loadingCell, row.children[2]);
};

// remove loading row
const removeLoadingRow = (row) => {
  row.removeChild(row.children[2]);
};

const addReviewColumn = async () => {
  const table = document.querySelector('table.data.frontPageWidget');
  if (!table) return;
  const headerRow = table.querySelector('tr.firstr');
  const reviewHeader = document.createElement('th');
  reviewHeader.textContent = 'Review';
  reviewHeader.classList.add('center');
  headerRow.insertBefore(reviewHeader, headerRow.children[2]);

  const rows = table.querySelectorAll('tr.odd, tr.even');
  // fast load
  for (const row of rows) {
    loadingRow(row);
    let TorrName = row.querySelector('a.cellMainLink').textContent;
    let movieName = getMovieName({TorrName});
    let movieYear = getMovieYear({TorrName});
    let movieNameYear = movieName + movieYear; // Concatenate the movie name and year
    const reviewCell = document.createElement('td');
    const reviewContainer = document.createElement('div');

    if (localStorage.getItem(movieNameYear) !== null) {
      const data = JSON.parse(localStorage.getItem(movieNameYear));
    
      if (data.Ratings && Array.isArray(data.Ratings) && data.Ratings.length === 0) {
        // if the data are bad don't fast load
        //loadingRow(row);
      } else {
        removeLoadingRow(row);
        // if the data are good fast load
        createRoot(reviewContainer).render(<Review name={movieName} year={movieYear} TorrName={TorrName}/>);
        addPosterColumn(row);
        reviewCell.appendChild(reviewContainer);
        row.insertBefore(reviewCell, row.children[2]);
      }
    } 
    
  }
  //Load everything else
  for (const row of rows) {
    removeLoadingRow(row);
    await processReviewRow(row); // Process each row one by one for reviews
       // Add poster column
  }
};

const addPosterColumn = (row) => {
  //const isExcludedRow = row.querySelector('.markeredBlock a[href*="/xxx/"]') !== null; // exclude adult content
  //const isMusicRow = row.querySelector('.markeredBlock a[href*="/music/"]') !== null; // check for music content
    // create a new cell for the Trailer button
  let TorrName = row.querySelector('a.cellMainLink').textContent; 
  let movieName = getMovieName({TorrName});
  let movieYear = getMovieYear({TorrName});
  let movieNameYear = movieName + movieYear;

  let poster = null;
  // get the poster from local storage 
  if (localStorage.getItem(movieNameYear) !== null) {
    const data = JSON.parse(localStorage.getItem(movieNameYear));
    poster = data.Poster;
      // Check if the poster already exists in the row
    const existingPoster = row.querySelector('.markeredBlock img');
    if (existingPoster) {
      // Poster already exists, no need to add another
      return;
    }

    // Remove the icon
    const Icon = row.querySelector('.iaconbox > a');
    if (Icon) {
      Icon.remove();
    }

    // Select the 'torrent name' cell from the row
    const nameContainer = row.querySelector('.markeredBlock .cellMainLink');

    if (nameContainer && poster !== 'N/A') {
      // Create an image element
      const img = document.createElement('img');
      // Set the source of the image (replace 'your-image-url.jpg' with your image URL)
      img.src = poster;

      
      img.className = 'flex inline-flex m-2 hover:scale-[3.5] transition-all duration-200 w-11 h-11 rounded-md';

      // Add event listener to open the image fullscreen on click
      img.addEventListener('click', () => {
        // Open the image fullscreen logic here
        window.open(poster);
      });

      // Insert the image before the name
      nameContainer.parentElement.insertBefore(img, nameContainer);
    }
  } 

}

const UltraHighDefinition = () => {
  const table = document.querySelector('table.data.frontPageWidget');
  if (!table) return;

  // Select all rows in the table, excluding the header row
  const rows = table.querySelectorAll('tr:not(.firstr)');

  rows.forEach(row => {
      // Select the 'torrent name' cell from the row
      const torrentNameCell = row.querySelector('td div.torrentname');
      if (torrentNameCell) {
          // Check if the text within the 'torrent name' cell contains '2160'
          if (torrentNameCell.textContent.includes('2160p') || 
            torrentNameCell.textContent.includes('4K') || 
            torrentNameCell.textContent.includes('UHD') || 
            torrentNameCell.textContent.includes('2160')) {

              // Change the background color of the row to green
              row.classList.add('green-background');
          } 
          
          if (torrentNameCell.textContent.includes('720p') || 
            torrentNameCell.textContent.includes('HDCAM') ||
            torrentNameCell.textContent.includes('CAM')) {
            row.classList.add('red-background');
          }
      }
  });
}

addTrailerColumn();
addReviewColumn();
UltraHighDefinition();

export default PlasmoOverlay
