import { assert } from "node:console";
import { runAction } from "../src/app";

async function runTest() {
    const result = await runAction(
        "getRowByFieldValue",
        "snowflake",
        { apiKey: "" }, // authParams
        {
            databaseName: "RAMP_DEMO",
            accountName: "LYBHROH-NDB34197.us-west-2",
            user: "RIABALLI",
            tableName: "EXAMPLE_USERS",
            fieldName: "COMPANY",
            fieldValue: "Ramp.com",
        }
    );

}

runTest().catch(console.error);
