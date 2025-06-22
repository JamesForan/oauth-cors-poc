import { get } from 'svelte/store';
import { oauthConfig, setAuthToken, setAuthError, setAuthLoading } from './stores/auth.js';

export function generateCodeVerifier() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode.apply(null, array))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

export async function generateCodeChallenge(verifier) {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

export function generateState() {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode.apply(null, array))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

export async function initiateOAuth() {
	const config = get(oauthConfig);

	if (!config.clientId || !config.authUrl || !config.redirectUri) {
		throw new Error('OAuth configuration incomplete');
	}

	const codeVerifier = generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);
	const state = generateState();

	localStorage.setItem('oauth_code_verifier', codeVerifier);
	localStorage.setItem('oauth_state', state);

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		scope: config.scope || 'openid',
		state: state,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256'
	});

	const authUrl = `${config.authUrl}?${params.toString()}`;
	window.location.href = authUrl;
}

export async function handleOAuthCallback(code, state) {
	let config = get(oauthConfig);
	
	// If store is empty, try to load from localStorage
	if (!config.tokenUrl) {
		const savedConfig = localStorage.getItem('oauth_config');
		if (savedConfig) {
			try {
				config = JSON.parse(savedConfig);
			} catch (e) {
				console.warn('Failed to parse saved OAuth config:', e);
			}
		}
	}
	
	const storedState = localStorage.getItem('oauth_state');
	const codeVerifier = localStorage.getItem('oauth_code_verifier');

	if (state !== storedState) {
		throw new Error('Invalid state parameter');
	}

	if (!codeVerifier) {
		throw new Error('Code verifier not found');
	}

	setAuthLoading(true);

	try {
		console.log("Config", config)
		const tokenResponse = await fetch(config.tokenUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
				'User-Agent': 'oauth-cors-poc-app',
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				client_id: config.clientId,
				code: code,
				redirect_uri: config.redirectUri,
				code_verifier: codeVerifier
			})
		});

		if (!tokenResponse.ok) {
			throw new Error(`Token exchange failed: ${tokenResponse.status}`);
		}

		const tokenData = await tokenResponse.json();
		setAuthToken(tokenData);

		localStorage.removeItem('oauth_code_verifier');
		localStorage.removeItem('oauth_state');

		return tokenData;
	} catch (error) {
		setAuthError(error.message);
		throw error;
	}
}