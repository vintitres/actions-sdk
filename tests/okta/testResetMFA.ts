import assert from "node:assert";
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { runAction } from "../../src/app"; // Import runAction

dotenv.config(); // Load .env file

async function runTest() {
  const oktaAuthToken = process.env.OKTA_AUTH_TOKEN;
  const oktaDomain = process.env.OKTA_DOMAIN; // e.g., https://yourdomain.okta.com
  const testUserId = process.env.OKTA_TEST_USER_ID;

  if (!oktaAuthToken || !oktaDomain || !testUserId) {
    console.warn(
      "OKTA_AUTH_TOKEN, OKTA_DOMAIN, or OKTA_TEST_USER_ID environment variables are not set. Skipping Okta tests."
    );
    return;
  }

  const authParams = { authToken: oktaAuthToken, baseUrl: oktaDomain };

  console.log("Resetting all MFA factors for the user...");
  const resetResult = await runAction("resetMFA", "okta", authParams, {
    userId: testUserId,
  });

  assert(resetResult, "Response should not be null");

  if (!resetResult.success) {
    console.error("Failed to reset MFA factors:", resetResult.error);
    return;
  }
  console.log("Successfully reset all MFA factors for user.");

  console.log("Okta resetMFA tests completed successfully.");
}

runTest().catch((error) => {
  if (error instanceof Error) {
    console.error("Okta testResetMFA failed:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
  process.exit(1);
});
