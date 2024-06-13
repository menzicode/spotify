import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './App.css';
import axios from 'axios';
import { setMaxListeners } from 'events';
console.log("hellO");

const scroller = () => {

    function importAll(r) {
      return r.keys().map((fileName) => ({
        src: r(fileName),
        subdirectory: fileName.substring(fileName.indexOf('/') + 1, fileName.lastIndexOf('/'))
      }));
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

	const settings = {
	  dots: false,
	  infinite: true,
	  speed: 3000,
	  slidesToShow: 6,
	  slidesToScroll: 1,
	  autoplay: true,
	  autoplaySpeed: 1,
	};

    function map_subdir(subdir) {
        if (subdir === 'eighties_alt') {
            return 'A playlist with 80s alternative music';
        }
        if (subdir === 'classical') {
            return 'A playlist with classical music';
        }
        if (subdir === 'country') {
            return 'A playlist with classic country music';
        }
        if (subdir === 'edm') {
            return 'A playlist with electronic dance music';
        }
        if (subdir === 'grateful_dead') {
            return 'A playlist with music by the Grateful Dead';
        }
        if (subdir === 'idm') {
            return 'A playlist with ambient electronic music';
        }
        if (subdir === 'marijuana') {
            return 'A playlist with reggae and psychadelic alternative music';
        }
        if (subdir === 'night_rider') {
            return 'A playlist called "Night Rider"';
        }
        if (subdir === 'rap') {
            return 'A playlist with rap music';
        }
        if (subdir === 'international_surf') {
            return 'A playlist with global surf rock music';
        }
        if (subdir === 'worms') {
            return 'A playlist with contemporary alternative music';
        }
    }
  
	const scroller_images = shuffle(importAll(require.context('./Images/', true, /\.(png|jpg|svg)$/)));
    
    return (
	    <footer className="image-scroller">
          <h2 style={{'color': 'gray', 'marginTop': '2vw'}}>Gallery</h2>
	      <Slider {...settings}>
            {scroller_images.map((image, index) => (
              <div className='image-container' key={index}>
                <img src={image.src} alt={`Slide ${index + 1}`} />
                <h3>{map_subdir(image.subdirectory)}</h3> {/* Display the subdirectory as a label */}
              </div>
            ))}
	      </Slider>
	    </footer>
    );
}

function App() {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState([]);
    const [displayMessage, setDisplayMessage] = useState('');
    const [playlistName, setPlaylistName] = useState('');

    const [imageOne, setImageOne] = useState({url: 'https://developer.spotify.com/images/guidelines/design/icon1@2x.png', prompt: ''});
    const [imageTwo, setImageTwo] = useState({url: 'https://developer.spotify.com/images/guidelines/design/icon1@2x.png', prompt: ''}); 
    const [imageThree, setImageThree] = useState({url: 'https://developer.spotify.com/images/guidelines/design/icon1@2x.png', prompt: ''}); 
    const [imageFour, setImageFour] = useState({url: 'https://developer.spotify.com/images/guidelines/design/icon1@2x.png', prompt: ''}); 

    const [playlistLink, setPlaylistLink] = useState('');


    const handleInputChange = (event) => {
        setPlaylistLink(event.target.value);
    };

    function downloadImage(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${playlistName}_cover.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    
    const generateImages = async (event) => {
        event.preventDefault();
        try {
            console.log('Sending request to server');
            setDisplayMessage('Analyzing playlist... this takes a couple minutes.');
            await axios.post('https://ec2-18-223-205-172.us-east-2.compute.amazonaws.com:8000/get_playlist_name', { playlist_link: playlistLink }).then((response) => {
                const playlist_name = response.data.playlist_name;
                console.log('Success:', response);
                setPlaylistName(`${playlist_name}`);
            });
            await axios.post('https://ec2-18-223-205-172.us-east-2.compute.amazonaws.com:8000/get_prompts', { playlist_link: playlistLink }).then((response) => {
                setDisplayMessage('Thinking of designs...');
                const prompts = response.data.prompts;
                const randomID = response.data.id;
                console.log('Success:', response);
                if (prompts.length < 4) {
                    console.log('Error: Not enough prompts');
                    return;
                }
                setDisplayMessage('Generating images...');
                prompts.forEach((prompt, index) => {
                    console.log('Prompt:', prompt.prompt);
                    axios.post('https://ec2-18-223-205-172.us-east-2.compute.amazonaws.com:8000/generate_image', { prompt: prompt.prompt, id: randomID, playlist: playlistLink }).then((response) => {
                        const url = response.data.url;
                        const revised_promp = response.data.revised_prompt;
                        switch (index) {
                            case 0:
                                setImageOne({'url': url, 'prompt': revised_promp});
                                break;
                            case 1:
                                setImageTwo({'url': url, 'prompt': revised_promp});
                                break;
                            case 2:
                                setImageThree({'url': url, 'prompt': revised_promp});
                                break;
                            case 3:
                                setImageFour({'url': url, 'prompt': revised_promp});
                                setDisplayMessage('Done!');
                                break;
                            default:
                                break;
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error:', error.response);
        };
    };


	return (
	  <div className="App">
	    <header className="App-header">
	      <h1>Playlist Cover Image Generator</h1>
          <div classname='link-entry-container'>
              <input className='playlist-link-input'
                type="text" 
                value={playlistLink} 
                onChange={(e) => handleInputChange(e)}
                placeholder=" Enter a Spotify playlist link..."
              />
              <button className='generate-button' onClick={generateImages}>Generate Images</button>
          </div>
	    </header>
        <div className='text-display'>
            <h2>{playlistName}</h2>
            <h2>{displayMessage}</h2>
        </div>
	    <div className="image-display">
            <div className='generated-image-container' onClick={() => downloadImage(imageOne.url)}>
                <h3>Click to download</h3>
                <img src={imageOne.url} alt={imageOne.prompt} />
            </div>
            <div className='generated-image-container' onClick={() => downloadImage(imageTwo.url)}>
                <h3>Click to download</h3>
                <img src={imageTwo.url} alt={imageTwo.prompt} />
            </div>
            <div className='generated-image-container' onClick={() => downloadImage(imageThree.url)}>
                <h3>Click to download</h3>
                <img src={imageThree.url} alt={imageThree.prompt} />
            </div>
            <div className='generated-image-container' onClick={() => downloadImage(imageFour.url)}>
                <h3>Click to download</h3>
                <img src={imageFour.url} alt={imageFour.prompt} />
            </div>
	    </div>
        {scroller()}
	  </div>
	);
}

export default App;

