import { signInWithEmailAndPassword } from 'firebase/auth'
import {auth} from '../firebase'

export const login = (email , password)=>{
    return signInWithEmailAndPassword(auth, email , password)
}

export const logout = ()=>{
    return auth.signOut();
}