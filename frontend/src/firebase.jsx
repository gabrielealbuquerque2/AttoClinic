import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBdrFYVNaMPKElt3jz-0nDt5_4IZNY0Eao",
  authDomain: "attoclinic-5cbb6.firebaseapp.com",
  projectId: "attoclinic-5cbb6",
  storageBucket: "attoclinic-5cbb6.firebasestorage.app",
  messagingSenderId: "312203856680",
  appId: "1:312203856680:web:18b938f8dcc90b91a3de1d",
  measurementId: "G-QZME91K1NS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app) // cria  a instancia de autenticacao
export {auth, app} // exporta pra usar em outros arquivos 