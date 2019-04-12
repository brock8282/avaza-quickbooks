import * as rp from 'request-promise';
import * as dbService from '../data-services/firestore';
import { writeTimeSheetToQBooks } from './qbooksController';

import { settings } from '../config';
import { ITimeSheetEvent, IAuthCredential, IAvazaUserProfile } from '../interface';

const authPath = 'auth/avaza';

interface IAvazaTokenRedirectData {
    code: string;
    accountid: string;
    state: string
}

async function getAvazaAuthCredential(): Promise<IAuthCredential> {
    let credential: IAuthCredential = await dbService.docWithId$(authPath);

    const auth = JSON.parse(await getAuthCredentialsForAvaza(
        credential.refresh_token,
        'refresh_token'
    ));

    if (auth && auth.access_token) {
        credential = Object.assign({}, credential, auth);

        await dbService.set(authPath, credential);
    }

    return Promise.resolve(credential);
}

function getAuthCredentialsForAvaza(code: string, grant_type: string) {
    // Make a post request to Stripe's oauth token endpoint
    const options: any = {
        uri: 'https://any.avaza.com/oauth2/token',
        form: {
            grant_type,
            client_id: settings.avaza.clientid,
            client_secret: settings.avaza.secret
        }
    };

    if (grant_type === 'refresh_token') {
        options.form.refresh_token = code;
    } else {
        options.form.code = code;
    }

    return rp.post(options);
}

async function getUserProfile(userId: number, access_token: string): Promise<IAvazaUserProfile> {
    const options = {
        url: 'https://api.avaza.com/api/UserProfile',
        headers: { 'Authorization': `Bearer ${access_token}` }
    }

    try {
        const profilesObj: { Users: IAvazaUserProfile[] } = JSON.parse(await rp.get(options));
        const profile = profilesObj.Users.find((user: IAvazaUserProfile) => user.UserID === userId);

        if (profile) {
            return Promise.resolve(profile);
        } else {
            return Promise.reject();
        }
    } catch (e) {
        return Promise.reject();
    }
}

export const handleTokenRedirectForAvaza = async (req: any): Promise<any> => {
    const response: IAvazaTokenRedirectData = req.query;
    const auth = JSON.parse(await getAuthCredentialsForAvaza(response.code, 'authorization_code'));

    if (auth && auth.access_token) {
        const credential: IAuthCredential = auth;

        await dbService.set(authPath, credential);
        return Promise.resolve({ message: 'success' });
    } else {
        return Promise.reject({ message: 'failed' });
    }
}

export const handleTimesheetUpdate = async (req: any): Promise<any> => {
    const timeSheetEvents: ITimeSheetEvent[] = req.body;
    const avazaCredential: IAuthCredential = await getAvazaAuthCredential();

    for (const sheet of timeSheetEvents) {
        if (sheet.TimeSheetEntryApprovalStatusCode === 'Approved') {

            try {
                const profile: IAvazaUserProfile = await getUserProfile(
                    sheet.UserIDFK,
                    avazaCredential.access_token
                );

                await writeTimeSheetToQBooks(
                    profile.Email,
                    sheet
                );
            } catch (e) {
                console.log(e);
            }
        }
    }

    return Promise.resolve({ message: 'success' });
}
