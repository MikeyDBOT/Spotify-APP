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
        const response = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=10', {
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

            const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=album&limit=${limit}&offset=${offset}`, {
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

            // Break if fewer items than the limit are returned (end of results)
            if (data.albums.items.length < limit) {
                break;
            }

            offset += limit; // Move to the next page
        }

        // Log release dates for debugging
        console.log('Release dates before sorting:', allAlbums.map(album => album.release_date));

        // If no albums are found, log a message
        if (allAlbums.length === 0) {
            console.log('No albums found for the specified genre.');
        }

        return allAlbums; // Return all albums without filtering
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

// Example call to display albums by genre
displayAlbums('metal');

