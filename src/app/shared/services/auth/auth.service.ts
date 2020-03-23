import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { User } from '../../../shared/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;

  constructor( public afAuth: AngularFireAuth, public afStore: AngularFirestore, public router: Router ) {
    this.user = this.afAuth.authState.pipe(switchMap(user => {
      if(user) {
        return this.afStore.doc<User>(`users/${user.uid}`).valueChanges();
      } else {
        return of(null);
      }
    }));
  }

  RegisterWithEmail( email:string, password:string ) {
    return new Promise((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(email, password).then((response:any) => {
        this.UpdateUserData(response.user).then(() => {
          this.SendVerificationEmail().then(() => {
            resolve(response.user);
          }).catch((error:any) => {
            reject(error);
          });
        }).catch((error:any) => {
          reject(error);
        });
      }).catch((error:any) => {
        reject(error);
      });
    });
  }

  LoginWithEmail( email: string, password:string ) {
    return new Promise((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(email, password).then((response:any) => {
        this.UpdateUserData(response.user).then(() => {
          resolve(response.user);
        });
      }).catch((error:any) => {
        reject(error);
      });
    });
  }

  UpdateUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user?.displayName,
      photoURL: user?.photoURL
    }
    const authUser = firebase.auth().currentUser;
    authUser.updateProfile({'displayName' : user?.displayName, 'photoURL' : user?.photoURL});
    return userRef.set(data, { merge: true });
  }

  ResetPassword(email) {
    return new Promise((resolve, reject) => {
      this.afAuth.sendPasswordResetEmail(email).then((response:any) => {

      }).catch((error:any) => {
        reject(error);
      });
    });
  }

  SignOut() {
    return new Promise((resolve, reject) => {
      this.afAuth.signOut().then(() => {
        this.user = null;
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  SendVerificationEmail() {
    return new Promise((resolve, reject) => {
      const actionCodeSettings = {
        url: window.location.origin+'/sign-in/verified/'+firebase.auth().currentUser.email
      }
      const user = firebase.auth().currentUser;
      user.sendEmailVerification(actionCodeSettings).then(() => {
        resolve('done');
      }).catch((error) => {
        reject(error);
      });
    });
  }

}
