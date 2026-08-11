import { PUBLIC_GMAIL_CLIENT, PUBLIC_GMAIL_SECRET, PUBLIC_API_KEY } from "$env/static/public";

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = PUBLIC_GMAIL_CLIENT;
const CLIENT_SECRET = PUBLIC_GMAIL_SECRET;
const API_KEY = PUBLIC_API_KEY;

// src/lib/utils/gmail_auth.js

import { start, onUrl } from "@fabianlars/tauri-plugin-oauth";
import { openUrl } from "@tauri-apps/plugin-opener";

const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

// --- Step 1: PKCE helpers ---

// Turns raw bytes into a URL-safe string (Google requires this exact encoding)
function base64url(buffer) {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

// The "verifier": a random secret string, unique to this one login attempt
function generateVerifier() {
	const randomBytes = crypto.getRandomValues(new Uint8Array(32));
	return base64url(randomBytes);
}

// The "challenge": a hash of the verifier — safe to send to Google up front,
// since a hash can't be reversed back into the original verifier
async function generateChallenge(verifier) {
	const encoded = new TextEncoder().encode(verifier);
	const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
	return base64url(hashBuffer);
}

// --- Step 2-7: the actual login flow ---

export async function login() {
	// Step 2: spin up a temporary server on your own machine, get its port
	const port = await start({ ports: [1421] });
	const redirectUri = `http://localhost:${port}`;

	// Step 1 (continued): create this login attempt's one-time secret pair
	const verifier = generateVerifier();
	const challenge = await generateChallenge(verifier);

	// Build the URL that will show Google's real login screen
	const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	authUrl.search = new URLSearchParams({
		client_id: CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: SCOPE,
		access_type: "offline", // ask for a refresh_token, not just a short-lived token
		prompt: "consent",
		code_challenge: challenge, // sending the HASH, not the secret itself
		code_challenge_method: "S256",
	}).toString();

	// Step 3: open this in the REAL system browser, not inside the Tauri window
	await openUrl(authUrl.toString());

	// Step 5: wait for Google to redirect back to our temporary local server
	return new Promise((resolve, reject) => {
		onUrl(async (redirectedUrl) => {
			// Step 6a: pull the authorization code out of the redirect URL
			const code = new URL(redirectedUrl).searchParams.get("code");
			if (!code) {
				reject(new Error("No authorization code in redirect"));
				return;
			}
			// Step 6b-7: trade the code + verifier for real tokens
			const tokens = await exchangeCodeForTokens(code, redirectUri, verifier);
			resolve(tokens);
		});
	});
}

async function exchangeCodeForTokens(code, redirectUri, verifier) {
	const response = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code,
			code_verifier: verifier, // proving we're the same app that started this
			grant_type: "authorization_code",
			redirect_uri: redirectUri,
		}),
	});
	return response.json(); // { access_token, refresh_token, expires_in, ... }
}
