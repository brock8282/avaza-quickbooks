const functions = require('firebase-functions');
const config = functions.config();

export const settings = {
    avaza: {
        clientid: config.avaza.clientid,
        secret: config.avaza.secret
    },
    qbooks: {
        sandbox: {
            clientid: config.qbooks.sandbox.clientid,
            secret: config.qbooks.sandbox.secret,
            redirecturi: config.qbooks.sandbox.redirecturi,
            companyId: 123146326717784 // this is for the sandbox company
        }
    }
}
