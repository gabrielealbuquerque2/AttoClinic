import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "attoclinic-5cbb6"
    });

export const firebaseAuth = getAuth(firebaseApp);
