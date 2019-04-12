import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// we initialize the firebase application
admin.initializeApp();

import {
    restApiHandlerHttp
} from './restApi/httpRoute';

// google api end points
export const avazaHttp = functions.https.onRequest(restApiHandlerHttp);
