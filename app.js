const clientId = '9ef802757a9c46469b8a914f3f06a641';
const clientSecret = '529f6c9e934347e6b336723c175981b2';

//https://mikeydbot.github.io/Spotify-APP/

async function getAccessToken(clientId, clientSecret) {
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
        const response = await fetch('https://api.spotify.com/v1/search?offset=0&limit=20&query=year%3A2025%20genre%3Ametal&type=track&locale=en-GB,en-US;q%3D0.9,en;q%3D0.8', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch new releases: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch new releases: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.albums || !data.albums.items) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid response structure from Spotify API');
        }

        return data.albums.items;
    } catch (error) {
        console.error('Error fetching new releases:', error);
        throw error;
    }
}

async function getAlbumsByGenre(accessToken, genre) {
    try {
        let allAlbums = [];
        let offset = 0;
        const limit = 50;

        console.log(`Fetching albums for genre: ${genre}`); // Debugging log

        while (true) {
            const query = genre ? `genre:${encodeURIComponent(genre)}` : ''; // Removed all filters for testing
            console.log(`API Query: ${query}`); // Debugging log

            const response = await fetch(`https://api.spotify.com/v1/search?offset=0&limit=20&query=year%3A2025%20genre%3Ametal&type=track&locale=en-GB,en-US;q%3D0.9,en;q%3D0.8`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to fetch albums by genre: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch albums by genre: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            console.log('API Response:', data); // Debugging log

            if (!data.albums || !data.albums.items) {
                console.error('Invalid response structure:', data);
                throw new Error('Invalid response structure from Spotify API');
            }

            allAlbums = allAlbums.concat(data.albums.items);

            // Break if there is no next page
            if (!data.albums.next) {
                break;
            }

            offset += limit; // Move to the next page
        }

        // Log release dates for debugging
        console.log('Release dates before filtering:', allAlbums.map(album => album.release_date));

        // Filter albums released in the current year and month
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // Months are 0-based

        const filteredAlbums = allAlbums.filter(album => {
            const releaseDate = new Date(album.release_date);
            return releaseDate.getFullYear() === currentYear && (releaseDate.getMonth() + 1) === currentMonth;
        });

        // Log filtered albums for debugging
        console.log('Filtered albums for current year and month:', filteredAlbums);

        return filteredAlbums; // Return filtered albums
    } catch (error) {
        console.error('Error fetching albums by genre:', error);
        throw error;
    }
}

async function displayAlbums(genre) {
    try {
        const accessToken = await getAccessToken(clientId, clientSecret);
        console.log('Access Token:', accessToken); // Debugging log

        const albums = await getAlbumsByGenre(accessToken, genre);
        console.log('Albums:', albums); // Debugging log

        const albumList = document.getElementById('album-list');
        albumList.innerHTML = ''; // Clear the list before appending new items

        if (albums.length === 0) {
            console.log('No albums found for the specified genre and date filter.');
            albumList.innerHTML = '<li>No recent albums found for the specified genre.</li>';
            return;
        }

        albums.forEach((album, index) => {
            console.log(`Appending album ${index + 1}:`, album.name); // Debugging log for each album
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = album.external_urls.spotify;
            link.textContent = `${album.name} by ${album.artists.map(artist => artist.name).join(', ')}`;
            listItem.appendChild(link);
            albumList.appendChild(listItem); // Append each item to the list
        });

        console.log('Album list updated successfully.');
    } catch (error) {
        console.error('Error displaying albums:', error);
        const albumList = document.getElementById('album-list');
        albumList.innerHTML = '<li>Error loading albums. Please try again later.</li>';
    }
}

async function displayPayload() {
    try {
        const body = new URLSearchParams();
        body.append('grant_type', 'client_credentials');

        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
            },
            body: body.toString(),
        });

        if (!tokenResponse.ok) {
            console.error(`Failed to fetch access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
            throw new Error(`Failed to fetch access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const response = await fetch('https://api.spotify.com/v1/search?offset=0&limit=20&query=year%3A2025%20genre%3Ametal&type=track&locale=en-GB,en-US;q%3D0.9,en;q%3D0.8', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Payload:', data); // Debugging log

        const payloadList = document.getElementById('payload-list');
        payloadList.innerHTML = ''; // Clear the list before appending new items

        if (!data.tracks || !data.tracks.items) {
            console.log('No data found in the payload.');
            payloadList.innerHTML = '<li>No data found.</li>';
            return;
        }

        data.tracks.items.forEach((item) => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = item.external_urls.spotify;
            link.textContent = `${item.name} by ${item.artists.map(artist => artist.name).join(', ')}`;
            listItem.appendChild(link);
            payloadList.appendChild(listItem);
        });

        console.log('Payload list updated successfully.');
    } catch (error) {
        console.error('Error displaying payload:', error);
        const payloadList = document.getElementById('payload-list');
        payloadList.innerHTML = '<li>Error loading data. Please try again later.</li>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayPayload();
});

