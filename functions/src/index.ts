import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const sendGridMail = require('@sendgrid/mail');

// Initialize Send Grid Mail
sendGridMail.setApiKey(functions.config().sendgrid.key);

// Send an email using third party application, SendGrid Mail
/** Data Structure - Either provide text/html or a template ID for dynamic templates
  data = {
    to: 'recipient@example.org',
    from: 'sender@example.org',
    subject: 'Hello world',
    text: 'Hello plain world!',
    html: '<p>Hello HTML world!</p>',
    template_id: 3958383nffj393,
    dynamic_template_data: {
      "code" : 458692
    }
  }
**/
export const sendEmail = functions.https.onCall((data, context) => {
  new Promise((resolve, reject) => {
    sendGridMail.send(data, (error:any, result:any) => {
      if(error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  }).then((response) => {
    return { response: response };
  }).catch((error) => {
    throw new functions.https.HttpsError('unknown', error);
  });
});

// Mark a users email as verified
/** Date Structure
  data = user uid
**/
export const verifyUsersEmail = functions.https.onCall((data, context) => {
  new Promise((resolve, reject) => {
    admin.auth().updateUser(data, {
      emailVerified: true
    }).then((response) => {
      return { response: response };
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });
});

// Reset a users password
/** Date Structure
  data = {
    uid: 2309fkfk32,
    password: 43dgfjf29!
  }
**/
export const resetUsersPassword = functions.https.onCall((data, context) => {
  new Promise((resolve, reject) => {
    admin.auth().updateUser(data.uid, {
      password: data.password
    }).then((response) => {
      return { response: response };
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });
});