<script>
	import { authState, logout } from '$lib/stores/auth.js';

	function handleLogout() {
		logout();
	}

	function copyToken() {
		if ($authState.accessToken) {
			navigator.clipboard.writeText($authState.accessToken);
			alert('Access token copied to clipboard');
		}
	}
</script>

<div class="auth-status">
	{#if $authState.loading}
		<div class="status loading">
			<div class="spinner"></div>
			Processing authentication...
		</div>
	{:else if $authState.error}
		<div class="status error">
			<strong>Authentication Error:</strong>
			<p>{$authState.error}</p>
		</div>
	{:else if $authState.isAuthenticated}
		<div class="status success">
			<div class="status-header">
				<h3>✓ Authenticated</h3>
				<button on:click={handleLogout} class="logout-btn">Logout</button>
			</div>
			
			<div class="token-info">
				<div class="token-display">
					<strong>Access Token:</strong>
					<div class="token-value">
						<code>{$authState.accessToken ? $authState.accessToken.substring(0, 50) + '...' : 'No token'}</code>
						{#if $authState.accessToken}
							<button on:click={copyToken} class="copy-btn" title="Copy full token">📋</button>
						{/if}
					</div>
				</div>
				
				{#if $authState.refreshToken}
					<div class="refresh-token">
						<strong>Refresh Token:</strong> Available
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="status unauthenticated">
			<h3>Not Authenticated</h3>
			<p>Configure OAuth settings and start the authentication flow to test API calls.</p>
		</div>
	{/if}
</div>

<style>
	.auth-status {
		margin-bottom: 2rem;
	}

	.status {
		padding: 1rem;
		border-radius: 6px;
		border-left: 4px solid;
	}

	.status.loading {
		background: #e3f2fd;
		border-color: #2196f3;
		color: #1565c0;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.status.success {
		background: #e8f5e8;
		border-color: #4caf50;
		color: #2e7d32;
	}

	.status.error {
		background: #ffebee;
		border-color: #f44336;
		color: #c62828;
	}

	.status.unauthenticated {
		background: #fff3e0;
		border-color: #ff9800;
		color: #e65100;
	}

	.status-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.status-header h3 {
		margin: 0;
	}

	.logout-btn {
		padding: 0.5rem 1rem;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.logout-btn:hover {
		background: #c82333;
	}

	.token-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.token-display {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.token-value {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid #dee2e6;
	}

	code {
		flex: 1;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		word-break: break-all;
	}

	.copy-btn {
		padding: 0.25rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.copy-btn:hover {
		opacity: 1;
	}

	.refresh-token {
		color: #666;
		font-size: 0.9rem;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid #e3f2fd;
		border-top: 2px solid #2196f3;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>