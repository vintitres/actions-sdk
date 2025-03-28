import axios from 'axios';
import jwt from 'jsonwebtoken';
import fs from 'fs';

require('dotenv').config();

const PRIVATE_KEY = fs.readFileSync(process.env.SALESFORCE_PRIVATE_KEY_PATH!, 'utf8');
const CLIENT_ID = process.env.SALESFORCE_CONSUMER_KEY; // The client ID of the connected app
const USERNAME = 'jaqb-zuqc@force.com';  // The Salesforce username associated with the connected app
const LOGIN_URL = 'https://login.salesforce.com'; // Use the sandbox URL if you're working with a sandbox: https://test.salesforce.com

const API_URL = 'https://power-speed-8849.lightning.force.com/services/data/v56.0/sobjects';

// Helper function for JWT Authentication
async function authenticateWithJWT(): Promise<string> {
    const payload = {
        iss: CLIENT_ID,  // The client ID of the connected app
        sub: USERNAME,   // The username of the Salesforce user
        aud: `${LOGIN_URL}/services/oauth2/token`,
        exp: Math.floor(Date.now() / 1000) + (60 * 5),  // Token expiration (5 minutes from now)
    };

    try {
        // Sign the JWT with the private key
        const signedJWT = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

        // Make a request to Salesforce to exchange the JWT for an access token
        const response = await axios.post(`${LOGIN_URL}/services/oauth2/token`, null, {
            params: {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: signedJWT,
            }
        });

        const accessToken = response.data.access_token;
        return accessToken;
    } catch (error) {
        console.error('Error during JWT authentication:', error);
        throw error;
    }
}

// Function to update Opportunity
async function updateOpportunity(recordId: string, updatedData: object): Promise<void> {
    try {
        const accessToken = await authenticateWithJWT();

        const updateUrl = `${API_URL}/Opportunity/${recordId}`;

        const response = await axios.patch(updateUrl, updatedData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Opportunity updated successfully:', response.data);
    } catch (error) {
        console.error('Error updating Opportunity:', error);
    }
}

// Function to update Lead
async function updateLead(recordId: string, updatedData: object): Promise<void> {
    try {
        const accessToken = await authenticateWithJWT();

        const updateUrl = `${API_URL}/Lead/${recordId}`;

        const response = await axios.patch(updateUrl, updatedData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Lead updated successfully:', response.data);
    } catch (error) {
        console.error('Error updating Lead:', error);
    }
}

// Example of usage for Opportunity
const opportunityRecordId = 'your-opportunity-record-id';
const opportunityUpdatedData = {
    StageName: 'Closed Won',
    Amount: 10000,
};

// updateOpportunity(opportunityRecordId, opportunityUpdatedData);

// Example of usage for Lead
const leadRecordId = '00Qfn0000004na7EAA';
const leadUpdatedData = {
    Status: 'Qualified',
    Company: 'New Company',
};

updateLead(leadRecordId, leadUpdatedData);



// import fs from 'fs';
// require('dotenv').config();

// const PRIVATE_KEY_ = fs.readFileSync('../actionsplay/private_pkcs8.key', 'utf8'); // Use PKCS#8 key

// console.log('Private key:', PRIVATE_KEY);
// console.log('Private key:', PRIVATE_KEY_);

// const payload = {
//     iss: 'YOUR_CLIENT_ID',
//     sub: 'YOUR_SALESFORCE_USERNAME',
//     aud: 'https://login.salesforce.com/services/oauth2/token',
//     exp: Math.floor(Date.now() / 1000) + (60 * 5), // Expires in 5 minutes
// };

// const signedJWT = jwt.sign(payload, PRIVATE_KEY_, { algorithm: 'RS256' });

// console.log('Signed JWT:', signedJWT);

