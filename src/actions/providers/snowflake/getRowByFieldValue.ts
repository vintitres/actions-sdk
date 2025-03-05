import snowflake from "snowflake-sdk";
import {
  AuthParamsType,
  snowflakeGetRowByFieldValueFunction,
  snowflakeGetRowByFieldValueOutputType,
  snowflakeGetRowByFieldValueParamsType,
} from "../../autogen/types";
import crypto from "crypto";

const getRowByFieldValue: snowflakeGetRowByFieldValueFunction = async ({
  params,
  authParams,
}: {
  params: snowflakeGetRowByFieldValueParamsType;
  authParams: AuthParamsType;
}): Promise<snowflakeGetRowByFieldValueOutputType> => {
  const { databaseName, tableName, fieldName, warehouse, fieldValue, user, accountName } = params;
  const { apiKey: privateKey } = authParams;
  if (!privateKey) {
    throw new Error("Private key is required");
  }
  const buffer: Buffer = Buffer.from(privateKey);

  const privateKeyObject = crypto.createPrivateKey({
    key: buffer,
    format: "pem",
    passphrase: "password",
  });

  const privateKeyCorrectFormat = privateKeyObject.export({
    format: "pem",
    type: "pkcs8",
  });

  const privateKeyCorrectFormatString = privateKeyCorrectFormat.toString();

  if (!accountName || !user || !databaseName || !warehouse || !tableName || !fieldName || !fieldValue) {
    throw new Error("Account name and user are required");
  }

  // Set up a connection using snowflake-sdk
  const connection = snowflake.createConnection({
    account: accountName,
    username: user,
    privateKey: privateKeyCorrectFormatString,
    authenticator: "SNOWFLAKE_JWT",
    role: "ACCOUNTADMIN", // If you have specific role requirements
    warehouse: warehouse, // Similarly for warehouse
    database: databaseName,
    schema: "PUBLIC",
  });

  try {
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) {
          console.error("Unable to connect:", err.message);
          return reject(err);
        }
        console.log("Successfully connected to Snowflake.");
        resolve(conn);
      });
    });

    const query = `SELECT * FROM ${databaseName}.PUBLIC.${tableName} WHERE ${fieldName} = ?`;
    const binds = [fieldValue];

    return await new Promise<snowflakeGetRowByFieldValueOutputType>((resolve, reject) => {
      connection.execute({
        sqlText: query,
        binds: binds,
        complete: (err, stmt, rows) => {
          if (err) {
            return reject(err);
          }
          if (!rows) {
            return {
              row: {
                rowContents: {},
              },
            };
          }
          return resolve({
            row: {
              rowContents: rows[0],
            },
          });
        },
      });
    });
  } catch (error) {
    console.error("An error occurred while executing the query:", error);
    throw error;
  } finally {
    connection.destroy(err => {
      if (err) {
        console.log("Failed to disconnect:", err);
      } else {
        console.log("Disconnected from Snowflake.");
      }
    });
  }
};

export default getRowByFieldValue;
