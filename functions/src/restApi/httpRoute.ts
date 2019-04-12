import {
    handleTokenRedirectForAvaza,
    handleTimesheetUpdate
} from './avazacontroller';

import {
    handleTokenRedirectForQuickbooks,
    getQBooksAuthUri
} from './qbooksController';

import { app } from '../api';
import * as helpers from '../helpers';
import * as express from 'express';

const router = express.Router();

// avaza auth redirect
router.get('/avazaRedirect', async (req: any, res: any) => {
    helpers.defaultHandler(
        handleTokenRedirectForAvaza(req),
        res, { success: 200, error: 400 }
    );
});

// quickbooks auth redirect
router.get('/qbooksAuthUri', async (req: any, res: any) => {
    getQBooksAuthUri(res);
});

// quickbooks auth redirect
router.get('/quickbooksRedirect', async (req: any, res: any) => {
    helpers.defaultHandler(
        handleTokenRedirectForQuickbooks(req),
        res, { success: 200, error: 400 }
    );
});

// This endpoint handles redirect for the timesheet update
router.post('/timesheetHook', async (req: any, res: any) => {
    helpers.defaultHandler(
        handleTimesheetUpdate(req),
        res, { success: 200, error: 400 }
    );
});

// Expose Express API as a single Cloud Function:
export let restApiHandlerHttp = app.use('/api', router);
