import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import React from 'react';
import ReactDOM from 'react-dom';
import { Review } from "~features/reviewInfo";
import { TrailerButton } from "./features/trailer-button";
import {NotAllowed} from "~features/notAllowed";
import { createRoot } from 'react-dom/client';
import "react-tooltip/dist/react-tooltip.css";

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
  
  // extract year
  const yearPattern = /\d{4}/;
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
const getMovieName = ({TorrName}) => {
  const sePattern = /S\d{2}E\d{2}/; // Season and episode pattern

  let movieName = TorrName;
  if (getMovieYear({TorrName}) === null) {
    // If year is not found, look for season and episode pattern
    const seMatch = TorrName.match(sePattern);
    if (seMatch) {
      // Split the name at the season and episode pattern 
      movieName = TorrName.split(seMatch[0])[0].trim() + ' ' + seMatch[0];
      // remove the season and episode pattern from the movie name
      movieName = movieName.replace(seMatch[0], "");
      // remove any "(" and ")" from the movie name
      movieName = movieName.replace("(", "");
      // if the name ends with a space, remove it
      if (movieName.endsWith(" ")) {
        movieName = movieName.substring(0, movieName.length - 1);
      }

      // console.log(movieName);
    } else {
      // If neither year nor season/episode pattern is found
      movieName = TorrName;
    }
  } else {
    // If year is found, split the name at the year
    movieName = TorrName.split(getMovieYear({TorrName}))[0].trim();
    // remove any "(" and ")" from the movie name
    movieName = movieName.replace("(", "");
    // if the name ends with a space, remove it
    if (movieName.endsWith(" ")) {
      movieName = movieName.substring(0, movieName.length - 1);
    }
  }
  return String(movieName);
}

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
      } else if (isGameRow){
        reviewContainer.textContent = 'Game Review';
        reviewCell.appendChild(reviewContainer);
      } else {
        let movieName = getMovieName({TorrName});
        let movieYear = getMovieYear({TorrName});
        
        // temporary placeholder
        reviewContainer.textContent = 'Loading...';
        
        // Fetch and render review data here
        root.render(<Review name={movieName} year={movieYear}/>); // Use the getMovieRating component

        reviewCell.appendChild(reviewContainer);
      }
    } else {
      root.render(<NotAllowed/>);
      reviewCell.appendChild(reviewContainer);
    }
    row.insertBefore(reviewCell, row.children[2]);

    // After processing the row, wait for a specified time
    setTimeout(() => {
      resolve();
    }, 300); // delay  between eah row
  });
};

const loadingRow = (row) => {
  const loadingCell = document.createElement('td');
  const loadingContainer = document.createElement('div');
  loadingContainer.textContent = 'Loading...';
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
  for (const row of rows) {
    loadingRow(row);
  }
  for (const row of rows) {
    removeLoadingRow(row);
    await processReviewRow(row); // Process each row one by one for reviews
  }
};


addTrailerColumn();
addReviewColumn();

export default PlasmoOverlay
