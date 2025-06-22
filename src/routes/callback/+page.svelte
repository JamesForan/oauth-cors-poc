<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { handleOAuthCallback } from '$lib/oauth.js';
	import { authState } from '$lib/stores/auth.js';

	let status = 'processing';
	let error = null;

	onMount(async () => {
		console.log('Callback page mounted');
		console.log('URL:', $page.url.href);
		console.log('Method:', $page.route.id);
		
		try {
			const urlParams = new URLSearchParams($page.url.search);
			const code = urlParams.get('code');
			const state = urlParams.get('state');
			const errorParam = urlParams.get('error');

			if (errorParam) {
				throw new Error(`OAuth error: ${errorParam}`);
			}

			if (!code) {
				throw new Error('No authorization code received');
			}

			if (!state) {
				throw new Error('No state parameter received');
			}

			await handleOAuthCallback(code, state);
			status = 'success';
			
			// Redirect back to main page after successful authentication
			setTimeout(() => {
				goto('/');
			}, 2000);
			
		} catch (err) {
			status = 'error';
			error = err.message;
		}
	});
</script>

<svelte:head>
	<title>OAuth Callback - OAuth CORS POC</title>
</svelte:head>

<div class="callback-container">
	{#if status === 'processing'}
		<div class="status processing">
			<div class="spinner"></div>
			<h2>Processing OAuth callback...</h2>
			<p>Please wait while we complete your authentication.</p>
		</div>
	{:else if status === 'success'}
		<div class="status success">
			<div class="success-icon">✓</div>
			<h2>Authentication Successful!</h2>
			<p>You will be redirected back to the main page in a moment.</p>
			<button on:click={() => goto('/')}>Continue to App</button>
		</div>
	{:else if status === 'error'}
		<div class="status error">
			<div class="error-icon">✗</div>
			<h2>Authentication Failed</h2>
			<p class="error-message">{error}</p>
			<button on:click={() => goto('/')}>Return to App</button>
		</div>
	{/if}
</div>

<style>
	.callback-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8f9fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.status {
		background: white;
		padding: 3rem;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
		max-width: 400px;
		width: 90%;
	}

	.status h2 {
		margin: 1rem 0;
		color: #333;
	}

	.status p {
		color: #666;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #007bff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.success-icon {
		width: 60px;
		height: 60px;
		background: #28a745;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: bold;
		margin: 0 auto 1rem;
	}

	.error-icon {
		width: 60px;
		height: 60px;
		background: #dc3545;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: bold;
		margin: 0 auto 1rem;
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 1rem;
		border-radius: 4px;
		border: 1px solid #f5c6cb;
		margin: 1rem 0;
		font-family: monospace;
		font-size: 0.9rem;
	}

	button {
		background: #007bff;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover {
		background: #0056b3;
	}

	.error button {
		background: #dc3545;
	}

	.error button:hover {
		background: #c82333;
	}
</style>