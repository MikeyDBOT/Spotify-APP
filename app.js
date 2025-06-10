const clientId = '9ef802757a9c46469b8a914f3f06a641';
const clientSecret = '529f6c9e934347e6b336723c175981b2';

//https://mikeydbot.github.io/Spotify-APP/

async function getAccessToken() {
    try {
        const body = new URLSearchParams();
        body.append('grant_type', 'client_credentials');

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
            },
            body: body.toString(),
        });

        if (!response.ok) {
            console.error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

async function getLatestAlbums(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/search?q=genre:metal&type=album&limit=10', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch albums: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch albums: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.albums || !data.albums.items) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid response structure from Spotify API');
        }

        return data.albums.items;
    } catch (error) {
        console.error('Error fetching albums:', error);
        throw error;
    }
}

async function displayAlbums() {
    try {
        const accessToken = await getAccessToken();
        console.log('Access Token:', accessToken); // Debugging log

        const albums = await getLatestAlbums(accessToken);
        console.log('Albums:', albums); // Debugging log

        const albumList = document.getElementById('album-list');
        albumList.innerHTML = '';

        albums.forEach(album => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = album.external_urls.spotify;
            link.textContent = `${album.name} by ${album.artists.map(artist => artist.name).join(', ')}`;
            listItem.appendChild(link);
            albumList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error displaying albums:', error);
        const albumList = document.getElementById('album-list');
        albumList.innerHTML = '<li>Error loading albums. Please try again later.</li>';
    }
}

displayAlbums();
