import * as cors from 'cors';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';

function corsMiddleware(req: any, res: any, next: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
}

export const app = express(); // Initializes express app for easy routing

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// here we configure the default middle ware for the app
app.use(corsMiddleware);

// Categorize CRUD request corectly
app.use(methodOverride('_method'));

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
