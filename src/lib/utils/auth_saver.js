let logged_in = false;
let login_time = null;
let access_token = null;
let expires_in = null;
let expires_at = null;
let refresh_token = null;
let refresh_token_expires_in = null;
let scope = null;
let token_type = null;

const LS_STRING = "gmail_paoiwsfpaouwnrapwoeif";

// write the response
export function write(res) {
	try {
		logged_in = true;
		login_time = Date.now();
		access_token = res.access_token;
		expires_in = res.expires_in;
		expires_at = Date.now() + res.expires_in * 1000;
		refresh_token = res.refresh_token;
		refresh_token_expires_in = res.refresh_token_expires_in;
		scope = res.scope;
		token_type = res.token_type;

		localStorage.setItem(
			LS_STRING,
			JSON.stringify({
				logged_in,
				login_time,
				access_token,
				expires_in,
				expires_at,
				refresh_token,
				refresh_token_expires_in,
				scope,
				token_type,
			}),
		);

		return true;
	} catch (error) {
		console.error("Couldn't write auth token data");
		console.error(error);
		return false;
	}
}

export function write_from_ls() {
	try {
		const data = JSON.parse(localStorage.getItem(LS_STRING) ?? "null");
		({
			logged_in,
			login_time,
			access_token,
			expires_in,
			expires_at,
			refresh_token,
			refresh_token_expires_in,
			scope,
			token_type,
		} = data ?? {});
		return true;
	} catch (error) {
		console.error("Couldn't remember token from ls");
		console.error(error);
		return false;
	}
}

export function read() {
	if (logged_in && Date.now() < expires_at) {
		return {
			access_token,
			token_type,
			logged_in,
		};
	} else {
		console.error(
			`Trying to read with invalid token data. logged in? ${logged_in}. Token expired? ${Date.now() >= expires_at}`,
		);
		return null;
	}
}
