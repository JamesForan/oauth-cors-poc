<script>
	let token = "";
	let apiUrl = "";
	let testing = false;
	let results = [];
	let decodedToken = null;
	let tokenInfo = null;
	let selectedOrg = "";
	let selectedLocation = "";

	function decodeJWT(token) {
		try {
			const parts = token.split(".");
			if (parts.length !== 3) {
				throw new Error("Invalid JWT format");
			}

			const header = JSON.parse(
				atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")),
			);
			const payload = JSON.parse(
				atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
			);

			const now = Math.floor(Date.now() / 1000);
			const isExpired = payload.exp && payload.exp < now;
			const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
			const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;

			return {
				header,
				payload,
				isExpired,
				expiresAt,
				issuedAt,
				timeUntilExpiry: payload.exp ? payload.exp - now : null,
			};
		} catch (error) {
			return { error: error.message };
		}
	}

	$: if (token) {
		decodedToken = decodeJWT(token);
		if (!decodedToken.error) {
			tokenInfo = {
				valid: true,
				expired: decodedToken.isExpired,
				expiresAt: decodedToken.expiresAt,
				issuedAt: decodedToken.issuedAt,
				timeUntilExpiry: decodedToken.timeUntilExpiry,
				subject: decodedToken.payload.sub,
				audience: decodedToken.payload.aud,
				issuer: decodedToken.payload.iss,
				scopes: decodedToken.payload.scope || decodedToken.payload.scp,
				userOrgs: decodedToken.payload.userOrgs || [],
				userLocations: decodedToken.payload.userLocations || [],
			};
		} else {
			tokenInfo = { valid: false, error: decodedToken.error };
		}
	} else {
		decodedToken = null;
		tokenInfo = null;
	}

	async function testAPI() {
		if (!token || !apiUrl) {
			alert("Please enter both token and API URL");
			return;
		}

		if (!selectedOrg || !selectedLocation) {
			alert("Please select both organization and location");
			return;
		}

		if (tokenInfo && tokenInfo.expired) {
			if (!confirm("Token appears to be expired. Continue anyway?")) {
				return;
			}
		}

		testing = true;
		const result = {
			url: apiUrl,
			timestamp: new Date().toISOString(),
			tokenExpired: tokenInfo?.expired || false,
			corsSupported: false,
			status: null,
			error: null,
			responseHeaders: {},
			responseData: null,
		};

		try {
			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					SelectedOrganization: selectedOrg,
					SelectedLocation: selectedLocation,
				},
			});

			result.status = response.status;
			result.corsSupported = true;

			response.headers.forEach((value, key) => {
				result.responseHeaders[key] = value;
			});

			if (response.ok) {
				const contentType = response.headers.get("content-type");
				if (contentType && contentType.includes("application/json")) {
					try {
						result.responseData = await response.json();
					} catch (e) {
						result.responseData = "Could not parse JSON response";
					}
				} else {
					result.responseData = await response.text();
				}
			} else {
				try {
					result.responseData = await response.text();
				} catch (e) {
					result.responseData = `HTTP ${response.status} ${response.statusText}`;
				}
			}
		} catch (error) {
			result.error = error.message;

			if (
				error.message.includes("CORS") ||
				error.message.includes("cross-origin")
			) {
				result.corsSupported = false;
				result.error =
					"CORS blocked - API does not allow browser requests from this origin";
			} else if (error.message.includes("Failed to fetch")) {
				result.error =
					"Network error - check URL and network connectivity";
			}
		}

		results = [result, ...results];
		testing = false;
	}

	function clearResults() {
		results = [];
	}

	function getStatusColor(result) {
		if (result.error) return "red";
		if (result.status >= 200 && result.status < 300) return "green";
		if (result.status >= 400) return "orange";
		return "gray";
	}

	function formatTimeUntil(seconds) {
		if (seconds <= 0) return "Expired";
		if (seconds < 60) return `${seconds}s`;
		if (seconds < 3600)
			return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	}
</script>

<div class="token-tester">
	<h2>Token API Tester</h2>

	<div class="input-section">
		<div class="input-group">
			<label for="token">OAuth Token:</label>
			<textarea
				id="token"
				bind:value={token}
				placeholder="Paste your OAuth/JWT token here"
				rows="3"
			></textarea>
		</div>

		<div class="input-group">
			<label for="apiUrl">API Endpoint URL:</label>
			<input
				id="apiUrl"
				type="url"
				bind:value={apiUrl}
				placeholder="https://api.example.com/endpoint"
			/>
		</div>

		<!-- Organization and Location Selection -->
		{#if tokenInfo && tokenInfo.valid && (tokenInfo.userOrgs.length > 0 || tokenInfo.userLocations.length > 0)}
			<div class="selection-section">
				{#if tokenInfo.userOrgs.length > 0}
					<div class="input-group">
						<label for="orgSelect">Select Organization:</label>
						<select id="orgSelect" bind:value={selectedOrg}>
							<option value="">-- Select Organization --</option>
							{#each tokenInfo.userOrgs as org}
								<option value={org}>{org}</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if tokenInfo.userLocations.length > 0}
					<div class="input-group">
						<label for="locationSelect">Select Location:</label>
						<select
							id="locationSelect"
							bind:value={selectedLocation}
						>
							<option value="">-- Select Location --</option>
							{#each tokenInfo.userLocations as location}
								<option value={location.locationId}
									>{location.locationId}</option
								>
							{/each}
						</select>
					</div>
				{/if}
			</div>
		{/if}

		<div class="button-group">
			<button on:click={testAPI} disabled={testing || !token || !apiUrl}>
				{testing ? "Testing..." : "Test API"}
			</button>
			{#if results.length > 0}
				<button on:click={clearResults} disabled={testing}
					>Clear Results</button
				>
			{/if}
		</div>
	</div>

	<!-- Token Information Display -->
	{#if tokenInfo}
		<div class="token-info">
			<h3>Token Information</h3>
			{#if tokenInfo.valid}
				<div class="token-details">
					<div class="detail-row">
						<span class="label">Status:</span>
						<span
							class="value {tokenInfo.expired
								? 'error'
								: 'success'}"
						>
							{tokenInfo.expired ? "✗ Expired" : "✓ Valid"}
						</span>
					</div>

					{#if tokenInfo.expiresAt}
						<div class="detail-row">
							<span class="label">Expires:</span>
							<span class="value"
								>{tokenInfo.expiresAt.toLocaleString()}</span
							>
						</div>
					{/if}

					{#if tokenInfo.timeUntilExpiry !== null}
						<div class="detail-row">
							<span class="label">Time Until Expiry:</span>
							<span
								class="value {tokenInfo.expired ? 'error' : ''}"
							>
								{formatTimeUntil(tokenInfo.timeUntilExpiry)}
							</span>
						</div>
					{/if}

					{#if tokenInfo.issuedAt}
						<div class="detail-row">
							<span class="label">Issued:</span>
							<span class="value"
								>{tokenInfo.issuedAt.toLocaleString()}</span
							>
						</div>
					{/if}

					{#if tokenInfo.subject}
						<div class="detail-row">
							<span class="label">Subject:</span>
							<span class="value">{tokenInfo.subject}</span>
						</div>
					{/if}

					{#if tokenInfo.issuer}
						<div class="detail-row">
							<span class="label">Issuer:</span>
							<span class="value">{tokenInfo.issuer}</span>
						</div>
					{/if}

					{#if tokenInfo.scopes}
						<div class="detail-row">
							<span class="label">Scopes:</span>
							<span class="value">{tokenInfo.scopes}</span>
						</div>
					{/if}

					{#if decodedToken}
						<details>
							<summary>Full Token Payload</summary>
							<pre>{JSON.stringify(
									decodedToken.payload,
									null,
									2,
								)}</pre>
						</details>
					{/if}
				</div>
			{:else}
				<div class="token-error">
					<span class="error">✗ Invalid token: {tokenInfo.error}</span
					>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Test Results -->
	{#if results.length > 0}
		<div class="results">
			<h3>Test Results</h3>
			{#each results as result}
				<div
					class="result-item"
					style="border-left: 4px solid {getStatusColor(result)}"
				>
					<div class="result-header">
						<strong>{result.url}</strong>
						<span class="timestamp"
							>{new Date(
								result.timestamp,
							).toLocaleTimeString()}</span
						>
					</div>

					<div class="result-details">
						{#if result.tokenExpired}
							<div class="detail-row">
								<span class="label">Token Status:</span>
								<span class="value warning"
									>⚠ Token was expired when called</span
								>
							</div>
						{/if}

						<div class="detail-row">
							<span class="label">CORS Support:</span>
							<span
								class="value {result.corsSupported
									? 'success'
									: 'error'}"
							>
								{result.corsSupported
									? "✓ Supported"
									: "✗ Blocked"}
							</span>
						</div>

						{#if result.status}
							<div class="detail-row">
								<span class="label">Status:</span>
								<span class="value">{result.status}</span>
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
								<pre>{JSON.stringify(
										result.responseHeaders,
										null,
										2,
									)}</pre>
							</details>
						{/if}

						{#if result.responseData}
							<details>
								<summary>Response Data</summary>
								<pre>{typeof result.responseData === "string"
										? result.responseData
										: JSON.stringify(
												result.responseData,
												null,
												2,
											)}</pre>
							</details>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.token-tester {
		max-width: 900px;
		margin: 0 auto;
	}

	.input-section {
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.input-group {
		margin-bottom: 1rem;
	}

	.input-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}

	textarea,
	input[type="url"],
	select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: monospace;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	.selection-section {
		background: #e8f4f8;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #b3d9e6;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
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

	.token-info {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.token-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.token-error {
		color: #dc3545;
	}

	.detail-row {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.label {
		font-weight: bold;
		min-width: 140px;
		flex-shrink: 0;
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
		font-size: 0.9em;
	}
</style>
