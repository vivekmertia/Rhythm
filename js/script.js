console.log('lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

// Converts seconds to MM:SS format
function secondsToMinutesAndSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetches songs from the server
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    playMusic(songs[0]);
    displaySongs(songs);
    

}

//test
document.getElementById('searchButton').addEventListener('click', function() {
    const searchQuery = document.getElementById('searchInput').value;
    const apiKey = '26190072';
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${apiKey}&format=json&limit=1&name=${searchQuery}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const track = data.results[0];
            console.log(track)
            console.log(track.album_name);
            let myArray = [track.name];
            displaySongsAPI(myArray);
            playMusicAPI(track.audio,myArray);
            if (track) {
                document.getElementById('result').innerHTML = `
                    <p><strong>Track Name:</strong> ${track.name}</p>
                    <p><strong>Artist Name:</strong> ${track.artist_name}</p>
                    <p><strong>Album Name:</strong> ${track.album_name}</p>
                    <p><strong>Release Date:</strong> ${track.releasedate}</p>
                    <audio controls>
                        <source src="${track.audio}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                `;
            } else {
                document.getElementById('result').innerHTML = '<p>No results found.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = '<p>An error occurred while fetching the data.</p>';
        });
});

// Displays songs in the song list
function displaySongs(songs) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="music.svg" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20", " ")}</div>
            <div>Mukesh, Vivek & Yashika</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
        <img class="invert" src="play.svg" alt="">
    </div> </li>`;
    }

    // Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(typeof(e.querySelector(".info").firstElementChild.innerHTML.trim()));
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            
        });
    });
}

function displaySongsAPI(songs) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="music.svg" alt="">
        <div class="info">
            <div> ${song.replaceAll("%20", " ")}</div>
            <div>Mukesh, Vivek & Yashika</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
        <img class="invert" src="play.svg" alt="">
    </div> </li>`;
    }

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

const playMusicAPI = (track,track_name, pause = false) => {
    console.log(track)
    // Assuming currentSong is your audio element
    if (!pause) {
        currentSong.src = track; // Assuming track is the full URL to the audio file
        currentSong.play();
        play.src = "pause.svg"; // Assuming play is the element for your play button
    }
    // Update song info and time
    document.querySelector(".songinfo").innerHTML = track_name;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Displays albums on the page
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let responseText = await a.text();
    let div = document.createElement("div");
    div.innerHTML = responseText;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";  // Clear previous content
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[1];
            try {
                let infoResponse = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
                let folderInfo = await infoResponse.json();
                console.log(folderInfo);

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>   
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${folderInfo.title}</h2>
                    <p>${folderInfo.description}</p>
                </div>`;
            } catch (error) {
                console.error("Error fetching folder info:", error);
            }
        }
    });




    // Load the playlist when a card is clicked
    cardContainer.addEventListener("click", async item => {
        if (item.target.classList.contains("card")) {
            const folder = item.target.dataset.folder;
            await getSongs(`songs/${folder}`);
        } else if (item.target.parentNode.classList.contains("card")) {
            const folder = item.target.parentNode.dataset.folder;
            await getSongs(`songs/${folder}`);
        }
    });
}

// Searches for songs based on the query
function searchSongs(query) {
    const results = songs.filter(song => song.toLowerCase().includes(query.toLowerCase()));
    displaySongs(results);
}

// Displays home content
function loadHomeContent() {
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    const playlists = [
        { name: "Top Hits", description: "The hottest tracks right now." },
        { name: "Chill Vibes", description: "Relax and unwind with these chill tunes." },
        { name: "Workout Mix", description: "Get pumped with this workout playlist." },
    ];

    playlists.forEach(playlist => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div class="card-image">
                <img src="cardss.jpg" alt="${playlist.name}">
            </div>
            <div class="card-content">
                <h3>${playlist.name}</h3>
                <p>${playlist.description}</p>
            </div>
        `;
        cardContainer.appendChild(card);
    });
    
}


// Function to start speech recognition
function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();


    recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript.trim();
        console.log('User said:', spokenText);
        document.getElementById('searchInput').value = spokenText; // Set search input value
        searchSongs(spokenText);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
    };
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to play, next, and previous buttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add an event listener for hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });


    // Assume currentSong is your audio element
    currentSong.addEventListener("ended", () => {
        console.log("Current song ended");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });



    // Add an event listener to previous button
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add an event listener to next button
    next.addEventListener("click", () => {
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event listener for volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseFloat(e.target.value) / 100;
    });

    // Add event listeners for search and home buttons
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const homeButton = document.getElementById("homeButton");

    // Search input listener for dynamic searching
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        searchSongs(query);
    });

    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query !== "") {
            searchSongs(query);
        }
    });


    

    // Like and Dislike button functionality
    const likeButton = document.getElementById("like");
    const dislikeButton = document.getElementById("dislike");

    likeButton.addEventListener("click", () => {
        if (likeButton.classList.contains("liked")) {
            likeButton.classList.remove("liked");
            console.log("Like removed");
        } else {
            likeButton.classList.add("liked");
            console.log("Song liked");
            alert("You liked the song");
        }
    });

    dislikeButton.addEventListener("click", () => {
        if (dislikeButton.classList.contains("disliked")) {
            dislikeButton.classList.remove("disliked");
            console.log("Dislike removed");
        } else {
            dislikeButton.classList.add("disliked");
            console.log("Song disliked");
            alert("You disliked the song");
        }
    });

    // Add event listener for the microphone button
    const micButton = document.getElementById("micButton");
    micButton.addEventListener("click", () => {
        startSpeechRecognition();
    });
}

// Call the main function to start the application
main();

// Select the SVG icon element
const searchIcon = document.getElementById('searchwalla');

// Add a click event listener to the SVG icon
searchIcon.addEventListener('click', function() {
    // Toggle visibility of search input field and button
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const micButton = document.getElementById('micButton');

    // Toggle display property
    searchInput.style.display = 'inline-block';
    searchButton.style.display = 'inline-block';
    micButton.style.display = 'inline-block';

    // Optionally, hide the SVG icon after it's clicked
    searchIcon.style.display = 'none';
});