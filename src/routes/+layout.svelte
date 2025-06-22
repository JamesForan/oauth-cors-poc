<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { handleOAuthCallback } from '$lib/oauth.js';
	import { authState } from '$lib/stores/auth.js';

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
		const error = urlParams.get('error');

		if (error) {
			console.error('OAuth error:', error);
			return;
		}

		if (code && state) {
			handleOAuthCallback(code, state)
				.then(() => {
					window.history.replaceState({}, document.title, window.location.pathname);
				})
				.catch(err => {
					console.error('OAuth callback error:', err);
				});
		}
	});
</script>

<main>
	<slot />
</main>

<style>
	main {
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}
</style>