import notAllowedImg from 'data-base64:~/assets/images/notAllowed.png';
import '../style.css';

export const NotAllowed = () => {

    return (
        <div className="flex flex-col items-center">
            <img className="" src={notAllowedImg} alt="Not Allowed" style={{ width: '25px', height: '25px' }} />
        </div>
    );
}   

