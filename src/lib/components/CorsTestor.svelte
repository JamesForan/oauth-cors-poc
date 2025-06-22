<script>
	import { authState } from '$lib/stores/auth.js';

	let testUrl = '';
	let testResults = [];
	let testing = false;

	async function testGithubApiCors() {
		testUrl = 'https://api.github.com/user';
		await testCorsAndAuth();
	}

	async function testCorsAndAuth() {
		if (!testUrl) {
			alert('Please enter a test URL');
			return;
		}

		testing = true;
		const result = {
			url: testUrl,
			timestamp: new Date().toISOString(),
			corsSupported: false,
			authRequired: false,
			status: null,
			error: null,
			responseHeaders: {},
			hasAuthToken: $authState.isAuthenticated
		};

		try {
			const headers = {};
			if ($authState.accessToken) {
				headers['Authorization'] = `Bearer ${$authState.accessToken}`;
			}

			const response = await fetch(testUrl, {
				method: 'GET',
				headers,
				mode: 'cors'
			});

			result.status = response.status;
			result.corsSupported = true;

			response.headers.forEach((value, key) => {
				result.responseHeaders[key] = value;
			});

			if (response.status === 401 || response.status === 403) {
				result.authRequired = true;
			}

			if (response.ok) {
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					try {
						const data = await response.json();
						result.responseData = data;
					} catch (e) {
						result.responseData = 'Could not parse JSON response';
					}
				} else {
					result.responseData = await response.text();
				}
			}

		} catch (error) {
			result.error = error.message;
			
			if (error.message.includes('CORS')) {
				result.corsSupported = false;
				result.error = 'CORS blocked - API does not allow browser requests from this origin';
			} else if (error.message.includes('Failed to fetch')) {
				result.error = 'Network error - check URL and network connectivity';
			}
		}

		testResults = [result, ...testResults];
		testing = false;
	}

	function clearResults() {
		testResults = [];
	}

	function getStatusColor(result) {
		if (result.error) return 'red';
		if (result.status >= 200 && result.status < 300) return 'green';
		if (result.status >= 400) return 'orange';
		return 'gray';
	}
</script>

<div class="cors-tester">
	<h2>CORS & API Tester</h2>
	
	<div class="test-form">
		<input 
			type="url" 
			bind:value={testUrl} 
			placeholder="Enter API endpoint URL to test" 
			disabled={testing}
		/>
		<button on:click={testCorsAndAuth} disabled={testing || !testUrl}>
			{testing ? 'Testing...' : 'Test API'}
		</button>
		<button on:click={testGithubApiCors} disabled={testing}>
			Test GitHub API (CORS Demo)
		</button>
		{#if testResults.length > 0}
			<button on:click={clearResults} disabled={testing}>Clear Results</button>
		{/if}
	</div>

	{#if $authState.isAuthenticated}
		<div class="auth-status success">
			✓ Authenticated - API calls will include Bearer token
		</div>
	{:else}
		<div class="auth-status warning">
			⚠ Not authenticated - API calls will be made without auth token
		</div>
	{/if}

	{#if testResults.length > 0}
		<div class="results">
			<h3>Test Results</h3>
			{#each testResults as result}
				<div class="result-item" style="border-left: 4px solid {getStatusColor(result)}">
					<div class="result-header">
						<strong>{result.url}</strong>
						<span class="timestamp">{new Date(result.timestamp).toLocaleTimeString()}</span>
					</div>
					
					<div class="result-details">
						<div class="detail-row">
							<span class="label">CORS Support:</span>
							<span class="value {result.corsSupported ? 'success' : 'error'}">
								{result.corsSupported ? '✓ Supported' : '✗ Blocked'}
							</span>
						</div>
						
						{#if result.status}
							<div class="detail-row">
								<span class="label">Status:</span>
								<span class="value">{result.status}</span>
							</div>
						{/if}
						
						{#if result.authRequired}
							<div class="detail-row">
								<span class="label">Auth Required:</span>
								<span class="value warning">⚠ Yes</span>
							</div>
						{/if}
						
						{#if result.error}
							<div class="detail-row">
								<span class="label">Error:</span>
								<span class="value error">{result.error}</span>
							</div>
						{/if}
						
						{#if Object.keys(result.responseHeaders).length > 0}
							<details>
								<summary>Response Headers</summary>
								<pre>{JSON.stringify(result.responseHeaders, null, 2)}</pre>
							</details>
						{/if}
						
						{#if result.responseData}
							<details>
								<summary>Response Data</summary>
								<pre>{typeof result.responseData === 'string' ? result.responseData : JSON.stringify(result.responseData, null, 2)}</pre>
							</details>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.cors-tester {
		max-width: 800px;
		margin: 0 auto;
	}

	.test-form {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	input[type="url"] {
		flex: 1;
		min-width: 300px;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 0.5rem 1rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.auth-status {
		padding: 0.5rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.auth-status.success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.auth-status.warning {
		background: #fff3cd;
		color: #856404;
		border: 1px solid #ffeaa7;
	}

	.results {
		margin-top: 2rem;
	}

	.result-item {
		background: #f8f9fa;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.timestamp {
		color: #666;
		font-size: 0.9em;
	}

	.result-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-row {
		display: flex;
		gap: 1rem;
	}

	.label {
		font-weight: bold;
		min-width: 120px;
	}

	.value.success {
		color: #28a745;
	}

	.value.error {
		color: #dc3545;
	}

	.value.warning {
		color: #ffc107;
	}

	details {
		margin-top: 0.5rem;
	}

	summary {
		cursor: pointer;
		font-weight: bold;
	}

	pre {
		background: #f1f1f1;
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
		white-space: pre-wrap;
		margin-top: 0.5rem;
	}
</style>