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
        const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${encodeURIComponent(genre)}&type=album&limit=50`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch albums by genre: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to fetch albums by genre: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.albums || !data.albums.items) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid response structure from Spotify API');
        }

        // Log release dates for debugging
        console.log('Release dates before sorting:', data.albums.items.map(album => album.release_date));

        // Filter albums released in the last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const recentAlbums = data.albums.items.filter(album => {
            const releaseDate = new Date(album.release_date || '1970-01-01');
            return releaseDate >= oneYearAgo;
        });

        // Sort albums by release date (if available)
        const sortedAlbums = recentAlbums.sort((a, b) => {
            const dateA = new Date(a.release_date || '1970-01-01');
            const dateB = new Date(b.release_date || '1970-01-01');
            return dateB - dateA; // Descending order
        });

        // Log sorted albums for debugging
        console.log('Sorted recent albums:', sortedAlbums);

        return sortedAlbums;
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
        albumList.innerHTML = '';

        if (albums.length === 0) {
            console.log('No albums found for the specified genre and date filter.');
            albumList.innerHTML = '<li>No recent albums found for the specified genre.</li>';
            return;
        }

        albums.forEach(album => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = album.external_urls.spotify;
            link.textContent = `${album.name} by ${album.artists.map(artist => artist.name).join(', ')}`;
            listItem.appendChild(link);
            albumList.appendChild(listItem);
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
alert('Albums loaded successfully. Check the console for details.');

