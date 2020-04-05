import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import * as firebase from 'firebase/app';
import { User } from '../../../shared/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;

  constructor( public messageService: MessageService, public afAuth: AngularFireAuth, public afStore: AngularFirestore, public afFunctions: AngularFireFunctions, public router: Router ) {
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
            this.messageService.add({severity:'error', summary:'', detail:error.message});
            reject(error);
          });
        }).catch((error:any) => {
          this.messageService.add({severity:'error', summary:'', detail:error.message});
          reject(error);
        });
      }).catch((error:any) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  LoginWithEmail( email: string, password:string ) {
    return new Promise((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(email, password).then((response:any) => {
        this.router.navigateByUrl('/dashboard');
        this.UpdateUserData(response.user).then(() => {
          resolve(response.user);
        });
      }).catch((error:any) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  SignOut() {
    return new Promise((resolve, reject) => {
      this.afAuth.signOut().then(() => {
        this.user = null;
        this.router.navigateByUrl('/auth/login');
        localStorage.removeItem('activeCompany');
        resolve();
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  UpdateUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const data: User = {
      uid: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      displayName: user?.displayName,
      photoURL: user?.photoURL
    }
    const authUser = firebase.auth().currentUser;
    authUser.updateProfile({'displayName' : user?.displayName, 'photoURL' : user?.photoURL});
    if(user.company) {
      data['company'] = user.company;
    }
    return userRef.set(data, { merge: true });
  }

  UpdateUserEmail(email) {
    return new Promise((resolve, reject) => {
      const authUser = firebase.auth().currentUser;
      authUser.updateEmail(email).then(() => {
        this.SendVerificationEmail().then(() => {
          this.router.navigateByUrl('/auth/verify');
          resolve();
        }).catch((error) => {
          this.messageService.add({severity:'error', summary:'', detail:error.message});
          reject(error);
        });
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  UpdateUserPassword(password) {
    return new Promise((resolve, reject) => {
      const authUser = firebase.auth().currentUser;
      authUser.updatePassword(password).then(() => {
        this.SignOut();
        resolve();
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  SendResetPasswordEmail(email) {
    return new Promise((resolve, reject) => {
      const code = Math.floor(100000 + Math.random() * 900000);
      const data = {
        "to" : email,
        "from" : "noReply@motice.io",
        "subject" : "Motice: Reset Password",
        "template_id" : "d-f9a8781dab344c718dec50497821093f",
        dynamic_template_data: {
          "link" : window.location.href + '/' + code
        }
      }
      const sendEmail = firebase.functions().httpsCallable('sendEmail');
      sendEmail(data).then((emailResponse) => {
        this.afStore.collection('users').ref.where('email', '==', email).limit(1).get().then((querySnapshot) => {
          const uid = querySnapshot.docs[0].id;
          this.afStore.collection('users').doc(uid).set({
            "verificationCode" : code,
            "verificationCodeCreated" : new Date()
          }, { merge: true }).then((dbResponse) => {
            this.messageService.add({severity:'success', summary:'Email Sent!', detail:'Check your inbox for further instructions.'});
            resolve();
          });
        });
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  CheckPasswordResetCode(code) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('users').ref.where('verificationCode', '==', parseInt(code)).limit(1).get().then((querySnapshot) => {
        if(!querySnapshot.empty) {
          const uid = querySnapshot.docs[0].id;
          const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${uid}`);
          userRef.get().subscribe((dataSnapshot) => {
            const codeCreatedDate = new Date(dataSnapshot.data().verificationCodeCreated.seconds*1000);
            const todaysDate = new Date();
            if(compareDate(codeCreatedDate)) {
              const storedCode = parseInt(dataSnapshot.data().verificationCode);
              const inputCode = parseInt(code);
              if(storedCode == code) {
                resolve();
              } else {
                this.messageService.add({severity:'error', summary:'', detail:'The provided code is incorrect.'});
                reject('incorrect_code');
              }
            } else {
              this.messageService.add({severity:'error', summary:'', detail:'The provided code is expired, please request a new one.'});
              reject('expired_code');
            }
          });
        } else {
          reject('no_code_assigned');
        }
      });
    });
  }

  CompletePasswordReset(code, password) {
    return new Promise((resolve, reject) => {
      this.afStore.collection('users').ref.where('verificationCode', '==', parseInt(code)).limit(1).get().then((querySnapshot) => {
        if(!querySnapshot.empty) {
          const uid = querySnapshot.docs[0].id;
          const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${uid}`);
          userRef.get().subscribe((dataSnapshot) => {
            const codeCreatedDate = new Date(dataSnapshot.data().verificationCodeCreated.seconds*1000);
            const todaysDate = new Date();
            if(compareDate(codeCreatedDate)) {
              const storedCode = parseInt(dataSnapshot.data().verificationCode);
              const inputCode = parseInt(code);
              if(storedCode == code) {
                const resetPassword = firebase.functions().httpsCallable('resetUsersPassword');
                resetPassword({uid, password}).then((response) => {
                  userRef.update({'verificationCode' : null, 'verificationCodeCreated' : null});
                  this.router.navigateByUrl('/auth/login');
                  resolve();
                }).catch((error) => {
                  this.messageService.add({severity:'error', summary:'', detail:error.message});
                  reject(error);
                });
              } else {
                this.messageService.add({severity:'error', summary:'', detail:'The provided code is incorrect.'});
              }
            } else {
              this.messageService.add({severity:'error', summary:'', detail:'The provided code is expired, please request a new one.'});
            }
          });
          resolve();
        } else {
          reject('no_code_assigned');
        }
      });
    });
  }

  SendVerificationEmail() {
    return new Promise((resolve, reject) => {
      const code = Math.floor(100000 + Math.random() * 900000);
      const user = firebase.auth().currentUser;
      const data = {
        "to": user.email,
        "from": "noReply@motice.io",
        "subject": "Motice: Verify your email address",
        "template_id": "d-83ff4eab7fe84e48a1e762352aea94d5",
        dynamic_template_data: {
          "code": code
        }
      }
      const sendEmail = firebase.functions().httpsCallable('sendEmail');
      sendEmail(data).then((emailResponse) => {
        const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
        userRef.set({
          "verificationCode" : code,
          "verificationCodeCreated" : new Date()
        }, { merge: true }).then((dbResponse) => {
          this.messageService.add({severity:'success', summary:'Email Sent!', detail:'Check your inbox for further instructions.'});
          resolve();
        });
      }).catch((error) => {
        this.messageService.add({severity:'error', summary:'', detail:error.message});
        reject(error);
      });
    });
  }

  CompleteEmailVerification(code) {
    return new Promise((resolve, reject) => {
      const user = firebase.auth().currentUser;
      const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
      userRef.get().subscribe((dataSnapshot) => {
        const codeCreatedDate = new Date(dataSnapshot.data().verificationCodeCreated.seconds*1000);
        const todaysDate = new Date();
        if(compareDate(codeCreatedDate)) {
          const storedCode = parseInt(dataSnapshot.data().verificationCode);
          const inputCode = parseInt(code);
          if(storedCode == code) {
            const verifyEmail = firebase.functions().httpsCallable('verifyUsersEmail');
            verifyEmail(user.uid).then((response) => {
              userRef.update({'emailVerified' : true, 'verificationCode' : null, 'verificationCodeCreated' : null});
              this.messageService.add({severity:'success', summary:'Email Verified!', detail:'You have successfully verified your email.'});
              resolve();
            }).catch((error) => {
              reject(error);
            });
          } else {
            this.messageService.add({severity:'error', summary:'', detail:'The provided code is incorrect.'});
          }
        } else {
          this.messageService.add({severity:'error', summary:'', detail:'The provided code is expired, please request a new one.'});
        }
      });
    });
  }

}

function compareDate(createdDate: Date) {
  let crDate = new Date(createdDate.getTime() + 5*60000);
  let todaysDate = new Date();
  let same = createdDate.getTime() === todaysDate.getTime();
  if(same)
    return false;
  if(crDate > todaysDate) 
    return true
  if(crDate < todaysDate)
    return false
}
