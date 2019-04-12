import { IObjectMap } from '../interface';
import * as firebase from 'firebase/app';

export type QuerySnapshot = firebase.firestore.QuerySnapshot;

const admin = require('firebase-admin');

export const auth = admin.auth();

export const get = () => {
    return admin;
}

export const collection = (colRef: string): any => {
    return admin.firestore().collection(colRef);
}

export const doc = (docRef: string): any => {
    return admin.firestore().doc(docRef);
}

export const getNewId = (): string => {
    return admin.firestore().collection('_').doc().id;
}

export const add = (colRef: string, data: IObjectMap<any>): Promise<any> => {
    data.log = Object.assign({}, data.log, {
        createdAt: new Date(),
        updatedAt: new Date()
    });

    return collection(colRef).add(data);
}

export const set = (docRef: string, data: IObjectMap<any>): Promise<any> => {
    data.log = {
        createdAt: new Date(),
        updatedAt: new Date()
    };

    return doc(docRef).set(data);
}

export const update = (docRef: string, data: IObjectMap<any>): Promise<any> => {
    if (data.log) {
        data.log.updatedAt = new Date();
    }

    return doc(docRef).update(data);
}

export const transformDoc = (snapshot: any): IObjectMap<any> => {
    const data: IObjectMap<any> = snapshot.data();

    if (data) {
        data.id = snapshot.id;
    }

    return data;
}

export const transformCollection = (snapshots: QuerySnapshot): IObjectMap<any>[] => {
    const results: any[] = [];
    snapshots.forEach((snap: any) => results.push(transformDoc(snap)));

    return results;
}

export const docWithId$ = (docRef: string) => {
    return doc(docRef).get().then((snap: any) => transformDoc(snap));
}

export const colWithIds$ = (colRef: string, queryFn?: Function): Promise<any> => {
    if (queryFn) {
        return queryFn(collection(colRef)).get().then((snapshots: QuerySnapshot) => {
            return transformCollection(snapshots);
        });
    } else {
        return collection(colRef).get().then((snapshots: QuerySnapshot) => {
            return transformCollection(snapshots);
        });
    }
}

export const docsFromId = (colRef: string, ids: string[]): Promise<any[]> => {
    if (ids.length === 0) {
        return Promise.resolve([]);
    } else {
        return new Promise(async (resolve) => {
            const refs = ids.map(id => {
                return doc(`${colRef}/${id}`);
            });

            const snapshots = await admin.firestore().getAll(...refs);
            resolve(transformCollection(snapshots));
        });
    }
}
