import { writable } from 'svelte/store';

export const authState = writable({
	isAuthenticated: false,
	accessToken: null,
	refreshToken: null,
	user: null,
	error: null,
	loading: false
});

export const oauthConfig = writable({
	clientId: '',
	redirectUri: '',
	authUrl: '',
	tokenUrl: '',
	scope: ''
});

export function setAuthConfig(config) {
	oauthConfig.set(config);
}

export function setAuthToken(tokenData) {
	authState.update(state => ({
		...state,
		isAuthenticated: true,
		accessToken: tokenData.access_token,
		refreshToken: tokenData.refresh_token,
		loading: false,
		error: null
	}));
}

export function setAuthError(error) {
	authState.update(state => ({
		...state,
		error,
		loading: false
	}));
}

export function setAuthLoading(loading) {
	authState.update(state => ({
		...state,
		loading
	}));
}

export function logout() {
	authState.set({
		isAuthenticated: false,
		accessToken: null,
		refreshToken: null,
		user: null,
		error: null,
		loading: false
	});
}