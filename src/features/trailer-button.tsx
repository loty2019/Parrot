import trailerImg from "data-base64:~/assets/images/trailer.png";
import { Tooltip } from "react-tooltip";
import '../style.css';

export const TrailerButton = ({ trailerUrl }) => {
    const handleClick = () => {
        // Open a YouTube video with the trailer of a specific movie
        window.open(`https://www.youtube.com/results?search_query=${trailerUrl}+trailer`);
    }

    return (
        <div className="flex justify-center">
            <img 
                src={trailerImg} 
                alt="Trailer" 
                className="w-10 h-10 hover:scale-110 p-1 hover:bg-[#0002] rounded-md transition-all duration-200 " 
                onClick={handleClick} 
                data-tooltip-id="tooltip-trailer" 
                data-tooltip-content="Watch the trailer!"
                data-tooltip-place="top" 
                data-tooltip-delay-show={2000} 
            />
            <Tooltip id='tooltip-trailer'/>
        </div>
    );
}