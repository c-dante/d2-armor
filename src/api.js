// some client ids
const config = {
	// clientId: '30606',
	clientId: '30607',
	state: btoa(Math.random()),
};

const formData = new FormData();
formData.append('grant_type', 'authorization_code');
formData.append('client_id', '30606');

export const getAuthUrl = () => `https://www.bungie.net/en/oauth/authorize?client_id=${config.clientId}&response_type=code&state=${config.state}`;

export const connect = () => fetch(
	'https://www.bungie.net/platform/app/oauth/token/',
	{
		method: 'POST',
		headers: new Headers({
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'application/x-www-form-urlencoded',
		}),
		body: formData
	}
);

// https://github.com/DestinyItemManager/bungie-api-ts