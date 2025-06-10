const clientId = '9ef802757a9c46469b8a914f3f06a641';
const clientSecret = '529f6c9e934347e6b336723c175981b2';

//https://mikeydbot.github.io/Spotify-APP/

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
}

async function getLatestAlbums(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/search?q=genre:metal&type=album&limit=10', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    return data.albums.items;
}

async function displayAlbums() {
    const accessToken = await getAccessToken();
    const albums = await getLatestAlbums(accessToken);

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
}

displayAlbums();
