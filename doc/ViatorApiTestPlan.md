# Viator API Integration Test Plan

This plan outlines a series of tests to verify the integration with the Viator API, starting with basic connectivity and progressing to data ingestion and updates.

## Phase 1: Basic Connectivity and Authentication

1.  **Test API Key and Base URL:**
    *   **Action:** Call the `/destinations` endpoint. This endpoint appears to be accessible without special permissions.
    *   **Expected Result:** A successful response (200 OK) with a list of destinations. This confirms the API key and base URL are valid.
    *   **Code:** `ViatorClient.testConnection()` (already implemented)
    *   **Verification:** Check console output for a successful response.

2.  **Verify Sandbox Environment:**
    *   **Action:** Ensure the `VIATOR_API_URL` in `.env` is set to `https://api.sandbox.viator.com/partner`.
    *   **Expected Result:** The environment variable is correctly set.
    *   **Code:** N/A - manual check of `.env` file.
    *   **Verification:** Read the `.env` file and confirm the value.

3.  **Verify Sandbox API Key:**
    *   **Action:** Ensure the `VIATOR_API_KEY` in `.env` is set to the correct sandbox API key.
    *   **Expected Result:** The environment variable is correctly set.
    *   **Code:** N/A - manual check of `.env` file.
    *   **Verification:** Read the `.env` file and confirm the value.

## Phase 2: Product Retrieval

1.  **Test `/products/modified-since` with minimal parameters:**
    *   **Action:** Call `/products/modified-since` with `count=5` and no `cursor` or `modified-since` parameters. This is the recommended initial call according to the documentation.
    *   **Expected Result:** A successful response (200 OK) with a small list of products (up to 5). This confirms basic access to the products endpoint.
    *   **Code:** Modify `initDb.ts` to call `viatorClient.getTours(1, 5)` and log the result.
    *   **Verification:** Check console output for a successful response and product data.

2.  **Test `/products/{product-code}` with a known product code:**
    *   **Action:** Call `/products/{product-code}` with a `productCode` obtained from a successful `/products/modified-since` response.
    *   **Expected Result:** A successful response (200 OK) with details for the specified product.
    *   **Code:** Modify `initDb.ts` or create a separate test script to call `viatorClient.getTour()` with a valid product code.
    *   **Verification:** Check console output for a successful response and product details.

## Phase 3: Data Ingestion and Updates

1.  **Test Full Ingestion (Small Batch):**
    *   **Action:** Run the `ingestViatorTours.ts` script with a small `limit` (e.g., 10) to ingest a limited number of tours.
    *   **Expected Result:** The script runs without errors, and the database is populated with the specified number of tours.
    *   **Code:** Modify `ingestViatorTours.ts` to use a small limit, and run the script.
    *   **Verification:** Check the database for the newly added tours.

2.  **Test Pagination:**
    *   **Action:** Modify `ingestViatorTours.ts` to handle the `nextCursor` parameter and fetch multiple pages of results.
    *   **Expected Result:** The script correctly fetches multiple pages of data and stops when there are no more pages.
    *   **Code:** Implement pagination logic in `ingestViatorTours.ts`.
    *   **Verification:** Check console output and database for data from multiple pages.

3.  **Test Full Ingestion (Large Batch):**
    *   **Action:** Run the `ingestViatorTours.ts` script with a larger `limit` (e.g., 100 or 500) to ingest a significant number of tours.
    *   **Expected Result:** The script runs without errors, and the database is populated with a large number of tours.
    *   **Code:** Modify `ingestViatorTours.ts` to use a larger limit, and run the script.
    *   **Verification:** Check the database for the newly added tours. Monitor for any errors or performance issues.

4.  **Test Updates (Modified-Since):**
    *   **Action:** After initial ingestion, modify some tour data in the Viator sandbox environment (if possible) and run the `ingestViatorTours.ts` script again.
    *   **Expected Result:** The script fetches only the modified tours and updates the database accordingly.
    *   **Code:** Requires a mechanism to track the `nextCursor` value between runs. This might involve storing it in a file or database.
    *   **Verification:** Check the database for updated tour information.

## Phase 4: Error Handling and Edge Cases

1.  **Test Invalid API Key:**
    *   **Action:** Temporarily set an invalid `VIATOR_API_KEY` in `.env` and run a test.
    *   **Expected Result:** A 401 Unauthorized error.
    *   **Code:** N/A - manual modification of `.env` file.
    *   **Verification:** Check console output for the expected error.

2.  **Test Invalid Endpoint:**
    *   **Action:** Call a non-existent endpoint (e.g., `/invalid-endpoint`).
    *   **Expected Result:** A 404 Not Found error.
    *   **Code:** Modify `ViatorClient.ts` temporarily to call an invalid endpoint.
    *   **Verification:** Check console output for the expected error.

3.  **Test Rate Limiting:**
    *   **Action:** Make a large number of rapid requests to an endpoint.
    *   **Expected Result:** A 429 Too Many Requests error.
    *   **Code:** Create a script to rapidly call an endpoint.
    *   **Verification:** Check console output for the expected error and the `RateLimit-*` headers.

4. **Test Timeout:**
    * **Action:**  If possible, simulate a slow response from the Viator API (this might require external tools).
    * **Expected Result:**  The client handles the timeout gracefully (either with a timeout error or by retrying).
    * **Code:**  Potentially modify `ViatorClient.ts` to include timeout handling.
    * **Verification:**  Check console output and application behavior.