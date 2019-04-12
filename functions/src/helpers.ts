export interface ResponseStatus {
    success: number,
    error: number
}

// Default handling of response
export const defaultHandler = (promise: Promise<any>, res: any, responseStatus?: ResponseStatus): void => {
    promise
        .then(data => {
            res.status(responseStatus ? responseStatus.success : 200).send(data);
        })
        .catch(err => {
            res.status(responseStatus ? responseStatus.error : 400).send(err);
        });
}
