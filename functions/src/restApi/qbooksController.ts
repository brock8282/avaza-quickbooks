import * as dbService from '../data-services/firestore';
import * as rp from 'request-promise';
import { settings } from '../config';
import { Base64 } from 'js-base64';
import {
    IObjectMap,
    IAuthCredential,
    IQbooksEmployee,
    ITimeSheetEvent,
    ITimeTracking
} from '../interface';
import { addMinutes } from 'date-fns';

const OAuthClient = require('intuit-oauth');
const authPath = 'auth/qbooks';

// Instance of qbooks client
const oauthClient = new OAuthClient({
    clientId: settings.qbooks.sandbox.clientid,
    clientSecret: settings.qbooks.sandbox.secret,
    environment: 'sandbox',
    redirectUri: settings.qbooks.sandbox.redirecturi
});

function getNewTokenManually(token: string) {
    // Make a post request to Stripe's oauth token endpoint
    const options: any = {
        uri: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        headers: { 'Authorization': `Basic ${Base64.encode(settings.qbooks.sandbox.clientid + ":" + settings.qbooks.sandbox.secret)}` },
        form: {
            grant_type: 'refresh_token',
            refresh_token: token
        }
    };

    return rp.post(options);
}

async function getNewAuthTokens(token: string): Promise<IObjectMap<any>> {
    return new Promise(async (resolve, reject) => {
        try {
            const auth = JSON.parse(await getNewTokenManually(token));
            resolve(auth);
        } catch (e) {
            reject(e);
        }
    });
}

export const getAuthCredentialFromDB = async (): Promise<IAuthCredential> => {
    let credential: IAuthCredential = await dbService.docWithId$(authPath);

    // we get auth from refresh token
    const auth = await getNewAuthTokens(credential.refresh_token);

    if (auth && auth.access_token) {
        credential = Object.assign({}, credential, auth);

        await dbService.set(authPath, credential);
    }

    return Promise.resolve(credential);
}


function getAuthCredentialsFromUrl(url: string): Promise<IObjectMap<any>> {
    return new Promise((resolve, reject) => {
        // Parse the redirect URL for authCode and exchange them for tokens
        const parseRedirect = url;

        // Exchange the auth code retrieved from the **req.url** on the redirectUri
        oauthClient.createToken(parseRedirect)
            .then(function (authResponse: any) {
                resolve(authResponse.getJson());
            })
            .catch(function (e: any) {
                reject(e);
            });
    });
}

async function getUserProfile(email: string, token: string): Promise<IQbooksEmployee> {
    return new Promise(async (resolve, reject) => {
        const baseUrl = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;
        const query = encodeURIComponent("SELECT * from Employee Where PrimaryEmailAddr =" + "'" + email + "'");
        const uri = `${baseUrl}v3/company/${settings.qbooks.sandbox.companyId}/query?query=${query}&minorversion=4`;

        const options: any = {
            uri,
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        };

        try {
            const res: { QueryResponse: { Employee: IQbooksEmployee[] } } = JSON.parse(await rp.get(options));
            resolve(res.QueryResponse.Employee && res.QueryResponse.Employee[0]);
        } catch (e) {
            reject(e);
        }
    });
}

export const getQBooksAuthUri = (res: any) => {
    // AuthorizationUri
    const authUri = oauthClient.authorizeUri({
        scope: [
            OAuthClient.scopes.Accounting,
            // OAuthClient.scopes.TimeTracking,
            OAuthClient.scopes.OpenId,
            OAuthClient.scopes.Profile,
            OAuthClient.scopes.Email,
            OAuthClient.scopes.Phone,
            OAuthClient.scopes.Address
        ],
        state: ''
    });

    res.redirect(authUri);
}

export const handleTokenRedirectForQuickbooks = async (req: any): Promise<any> => {
    if (!req.query.error) {
        const auth: any = await getAuthCredentialsFromUrl(req.url);

        if (auth && auth.access_token) {
            const credential: IAuthCredential = auth;

            await dbService.set(authPath, credential);
            return Promise.resolve({ message: 'success' });
        } else {
            return Promise.reject({ message: 'failed' });
        }
    } else {
        return Promise.resolve({ message: req.query.error })
    }
}

export const writeTimeSheetToQBooks = async (userEmail: string, avazaTimeSheet: ITimeSheetEvent): Promise<any> => {
    try {
        const credential: IAuthCredential = await getAuthCredentialFromDB();
        const profile: IQbooksEmployee = await getUserProfile(userEmail, credential.access_token);

        if (profile) {
            const now = new Date();

            const timeActivity: ITimeTracking = {
                NameOf: 'Employee',
                EmployeeRef: {
                    value: profile.Id,
                    name: profile.DisplayName
                },
                StartTime: now.toDateString(),
                EndTime: addMinutes(now, avazaTimeSheet.Duration).toDateString()
            }

            // @TODO create a time activity for the employee
            // https://sandbox-quickbooks.api.intuit.com/v3/company/<companyID>/timeactivity?minorversion=4
            console.log(timeActivity);
        } else {
            console.log('No profile found');
        }
    } catch (e) {
        console.log(e);
    }

    return Promise.resolve(true);
}