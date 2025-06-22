<script>
	import { onMount } from 'svelte';
	import { oauthConfig, setAuthConfig } from '$lib/stores/auth.js';
	import { initiateOAuth } from '$lib/oauth.js';

	let config = {
		clientId: '',
		redirectUri: typeof window !== 'undefined' ? (window.location.origin + '/callback') : 'http://localhost:5174/callback',
		authUrl: '',
		tokenUrl: '',
		scope: 'openid profile email'
	};

	let showConfig = false;

	// Load config from localStorage on mount
	onMount(() => {
		const savedConfig = localStorage.getItem('oauth_config');
		if (savedConfig) {
			try {
				const parsed = JSON.parse(savedConfig);
				config = { ...config, ...parsed };
				// Also update the store
				setAuthConfig(config);
			} catch (e) {
				console.warn('Failed to parse saved OAuth config:', e);
			}
		}
	});

	function saveConfig() {
		// Save to store
		setAuthConfig(config);
		// Save to localStorage
		localStorage.setItem('oauth_config', JSON.stringify(config));
		showConfig = false;
	}

	function startOAuth() {
		if (!config.clientId || !config.authUrl || !config.tokenUrl) {
			alert('Please configure OAuth settings first');
			showConfig = true;
			return;
		}
		
		// Save config before starting OAuth
		setAuthConfig(config);
		localStorage.setItem('oauth_config', JSON.stringify(config));
		initiateOAuth();
	}

	function loadExampleConfig() {
		config = {
			...config,
			clientId: 'your-client-id',
			authUrl: 'https://example.com/oauth/authorize',
			tokenUrl: 'https://example.com/oauth/token',
			scope: 'openid profile email'
		};
	}
</script>

<div class="oauth-config">
	<div class="config-header">
		<h2>OAuth Configuration</h2>
		<button on:click={() => showConfig = !showConfig}>
			{showConfig ? 'Hide' : 'Show'} Config
		</button>
	</div>

	{#if showConfig}
		<div class="config-form">
			<div class="form-group">
				<label for="clientId">Client ID *</label>
				<input 
					id="clientId"
					type="text" 
					bind:value={config.clientId} 
					placeholder="Your OAuth client ID"
					required
				/>
			</div>

			<div class="form-group">
				<label for="redirectUri">Redirect URI</label>
				<input 
					id="redirectUri"
					type="url" 
					bind:value={config.redirectUri} 
					placeholder="http://localhost:5174/callback"
				/>
				<small>This should match your OAuth provider's redirect URI configuration</small>
			</div>

			<div class="form-group">
				<label for="authUrl">Authorization URL *</label>
				<input 
					id="authUrl"
					type="url" 
					bind:value={config.authUrl} 
					placeholder="https://provider.com/oauth/authorize"
					required
				/>
			</div>

			<div class="form-group">
				<label for="tokenUrl">Token URL *</label>
				<input 
					id="tokenUrl"
					type="url" 
					bind:value={config.tokenUrl} 
					placeholder="https://provider.com/oauth/token"
					required
				/>
			</div>

			<div class="form-group">
				<label for="scope">Scope</label>
				<input 
					id="scope"
					type="text" 
					bind:value={config.scope} 
					placeholder="openid profile email"
				/>
			</div>

			<div class="form-actions">
				<button type="button" on:click={saveConfig} class="primary">
					Save Configuration
				</button>
				<button type="button" on:click={loadExampleConfig} class="secondary">
					Load Example
				</button>
			</div>
		</div>
	{/if}

	<div class="oauth-actions">
		<button on:click={startOAuth} class="oauth-button">
			Start OAuth Flow
		</button>
		<p class="oauth-help">
			Click to initiate OAuth authentication with the configured provider
		</p>
	</div>
</div>

<style>
	.oauth-config {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.config-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.config-form {
		background: white;
		padding: 1.5rem;
		border-radius: 6px;
		margin-bottom: 1rem;
		border: 1px solid #dee2e6;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}

	input[type="text"],
	input[type="url"] {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	input[type="text"]:focus,
	input[type="url"]:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}

	small {
		display: block;
		margin-top: 0.25rem;
		color: #6c757d;
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button.primary {
		background: #007bff;
		color: white;
	}

	button.primary:hover {
		background: #0056b3;
	}

	button.secondary {
		background: #6c757d;
		color: white;
	}

	button.secondary:hover {
		background: #545b62;
	}

	.oauth-actions {
		text-align: center;
	}

	.oauth-button {
		background: #28a745;
		color: white;
		font-size: 1.1rem;
		padding: 1rem 2rem;
	}

	.oauth-button:hover {
		background: #218838;
	}

	.oauth-help {
		margin-top: 0.5rem;
		color: #6c757d;
		font-size: 0.9rem;
	}
</style>