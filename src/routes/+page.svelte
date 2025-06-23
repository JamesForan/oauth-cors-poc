<script>
	import OAuthConfig from '$lib/components/OAuthConfig.svelte';
	import AuthStatus from '$lib/components/AuthStatus.svelte';
	import CorsTestor from '$lib/components/CorsTestor.svelte';
	import TokenTester from '$lib/components/TokenTester.svelte';
</script>

<svelte:head>
	<title>OAuth CORS POC</title>
	<meta name="description" content="OAuth authentication and CORS testing proof of concept" />
</svelte:head>

<div class="container">
	<header>
		<h1>OAuth & CORS Testing POC</h1>
		<p>
			This proof of concept tests OAuth authentication flows and CORS restrictions 
			for API calls from the browser. Configure your OAuth provider, authenticate, 
			and then test API endpoints to determine CORS support.
		</p>
	</header>

	<section class="auth-section">
		<OAuthConfig />
		<AuthStatus />
	</section>

	<section class="testing-section">
		<TokenTester />
		<div style="margin-top: 3rem;">
			<CorsTestor />
		</div>
	</section>

	<footer>
		<h3>How it works:</h3>
		<ol>
			<li><strong>Configure OAuth:</strong> Enter your OAuth provider's client ID, authorization URL, and token URL</li>
			<li><strong>Authenticate:</strong> Click "Start OAuth Flow" to authenticate with your provider</li>
			<li><strong>Test APIs:</strong> Enter API endpoint URLs to test CORS support and authentication requirements</li>
			<li><strong>Analyze Results:</strong> View detailed results including CORS status, response headers, and auth requirements</li>
		</ol>

		<h4>Features:</h4>
		<ul>
			<li>OAuth 2.0 + PKCE flow implementation</li>
			<li>Automatic token management in Svelte stores</li>
			<li>CORS detection and error reporting</li>
			<li>Bearer token inclusion in API requests</li>
			<li>Response header and data inspection</li>
		</ul>
	</footer>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	header h1 {
		color: #333;
		margin-bottom: 1rem;
	}

	header p {
		color: #666;
		font-size: 1.1rem;
		line-height: 1.6;
		max-width: 600px;
		margin: 0 auto;
	}

	.auth-section {
		margin-bottom: 3rem;
	}

	.testing-section {
		margin-bottom: 3rem;
	}

	footer {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		margin-top: 3rem;
	}

	footer h3, footer h4 {
		color: #333;
		margin-top: 0;
	}

	footer ol, footer ul {
		color: #666;
		line-height: 1.6;
	}

	footer li {
		margin-bottom: 0.5rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		header p {
			font-size: 1rem;
		}
	}
</style>