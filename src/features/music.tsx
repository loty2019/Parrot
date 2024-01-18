import MusicImg from 'data-base64:~/assets/images/musicImg.png';
import '../style.css';

export const Music = () => {
    return (
        <div className="flex flex-col items-center">
            <img className="" src={MusicImg} alt="Not Allowed" style={{ width: '25px', height: '25px' }} />
        </div>
    );
}   

