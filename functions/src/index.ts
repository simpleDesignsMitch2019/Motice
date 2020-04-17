import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const sendGridMail = require('@sendgrid/mail');

// Initialize Send Grid Mail
sendGridMail.setApiKey(functions.config().sendgrid.key);

// Initialize modules that have different keys based on whether it's live or testing
const live = false;
let stripeKey: string;

let stripeSigningSecret: string;
if(live) {
  stripeKey = functions.config().stripe.live;
  stripeSigningSecret = functions.config().stripe.signingsecret;
} else {
  stripeKey = functions.config().stripe.test;
  stripeSigningSecret = functions.config().stripe.signingsecrettest;
}
const stripe = require('stripe')(stripeKey);

// Setup new companies automatically when created based off of templates
export const newCompanySetup = functions.firestore.document('companies/{companyId}').onCreate((snap, context) => {

  return new Promise((resolve, reject) => {

    // Get Default Branding Settings
    admin.firestore().collection('defaults').doc('company_settings').collection('branding').get().then((dataSnapshot) => {

      // Create Branding Records
      dataSnapshot.forEach((branding) => {
        snap.ref.collection('settings').doc('branding').set(branding.data(), {merge: true}).then((data) => { console.log(data); }).catch((error) => { console.log(error); });
      });

    }).then(() => {

      // Get Default Calendar Settings
      admin.firestore().collection('defaults').doc('company_settings').collection('calendar').get().then((dataSnapshot) => {
        // Create Calendar Records
        dataSnapshot.forEach((calendar) => {
          snap.ref.collection('settings').doc('calendar').set(calendar.data(), {merge: true}).then((data) => { console.log(data); }).catch((error) => { console.log(error); });
        });

      }).then(() => {

        // Get Default Chart of Accounts
        admin.firestore().collection('defaults').doc('company_settings').collection('chart_of_accounts').get().then((dataSnapshot) => {
          // Create Chart of Account Records
          dataSnapshot.forEach((account) => {
            snap.ref.collection('COAS').doc(account.id).set(account.data(), {merge: true}).then((data) => { console.log(data); }).catch((error) => { console.log(error); });
          });

        }).then(() => {

          resolve('all-records-created');

        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    }).catch((error) => {
      reject(error);
    });

  });

});

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
/** Data Structure
  data = user uid
  **/
  export const verifyUsersEmail = functions.https.onCall((data, context) => {
    new Promise((resolve, reject) => {
      admin.auth().updateUser(data, {
        emailVerified: true
      }).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    }).then((response) => {
      return { response: response };
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Reset a users password
/** Data Structure
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
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    }).then((response) => {
      return { response: response };
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Create a Stripe Subscription Customer -- **NOT CONNECT**
/** Data Structure
  data = {
    payment_method: 'pm_1FU2bgBF6ERF9jhEQvwnA7sX',
    email : 'jenny.rose@example.com',
  }
  **/
  export const createStripeSubscriptionCustomer = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.customers.create({
        payment_method: data.payment_method,
        email: data.email,
        invoice_settings: {
          default_payment_method: data.payment_method
        }
      }).then((response:any) => {
        resolve(response);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });


  // Create a Stripe Subscription -- **NOT CONNECT**
/** Data Structure
  data = {
    customer: 'cus_Gk0uVzT2M4xOKD',
    plan : 'plan_FSDjyHWis0QVwl'
  }
  **/
  export const createStripeSubscription = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.subscriptions.create({
        customer: data.customer,
        items: [{ plan: data.plan }]
      }).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Update a Stripe Subscription -- **NOT CONNECT**
  export const updateStripeSubscription = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.subscriptions.update(data.subscription, data.content).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Cancel a Stripe Subscription -- **NOT CONNECT**
  export const cancelStripeSubscription = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.subscriptions.del(data.subscription).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Get Stripe Customer -- **NOT CONNECT**
  /** Data Structure
    data = {
      customer: 'cus_Gk0uVzT2M4xOKD'
    }
  **/
  export const getStripeCustomer = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.customers.retrieve(data.customer).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Get Stripe Payment Method -- **NOT CONNECT**
  /** Data Structure
    data = {
      method: 'pm_1GTDNaD0VuJwGAwCankp5joL'
    }
  **/
  export const getStripePaymentMethod = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.paymentMethods.retrieve(data.method).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Get Stripe Customer Payment Methods -- **NOT CONNECT**
  /** Data Structure
    data = {
      customer: 'cus_Gk0uVzT2M4xOKD'
    }
  **/
  export const getStripeCustomerPaymentMethods = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.paymentMethods.list({customer: data.customer, type: 'card'}).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Get Stripe Charges -- **NOT CONNECT**
  /** Data Structure
    data = {
      customer: 'cus_Gk0uVzT2M4xOKD'
    }
  **/
  export const getStripeCharges = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.charges.list({'customer':data.customer}).then((resp:any) => {
        resolve(resp);
      }).catch((error:any) => {
        reject(error);
      })
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });

  // Add Payment Method -- **NOT CONNECT**
  /** Data Structure
    data = {
      customer: 'cus_Gk0uVzT2M4xOKD'
      method : 'pm_1FU2bgBF6ERF9jhEQvwnA7sX'
    }
  **/
  export const addStripePaymentMethod = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.paymentMethods.attach(data.method, {customer: data.customer}).then((response:any) => {
          resolve(response);
        }).catch((error:any) => {
          reject(error);
        });
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });  

  // Delete Payment Method -- **NOT CONNECT**
  /** Data Structure
    data = {
      customer: 'cus_Gk0uVzT2M4xOKD'
      method : 'pm_1FU2bgBF6ERF9jhEQvwnA7sX'
    }
  **/
  export const deleteStripePaymentMethod = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
      stripe.paymentMethods.detach(data.method).then((response:any) => {
          resolve(response);
        }).catch((error:any) => {
          reject(error);
        });
    }).then((response) => {
      return response;
    }).catch((error) => {
      throw new functions.https.HttpsError('unknown', error);
    });
  });  

  // Listen For Stripe Webhooks And React -- **NOT CONNECT**
  /** Data Structure
    Varies based on webhook. Refer to Stripe Documentation
  **/
  export const StripeWebhookNonConnect = functions.https.onRequest((request, response) => {
    const sig = request.headers['stripe-signature'];
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(request.rawBody, sig, stripeSigningSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch(event.type) {
      case 'customer.created':
      admin.firestore().collection('users').where('email', '==', event.data.object.email).limit(1).get().then((querySnapshot) => {
        if(!querySnapshot.empty) {
          const uid = querySnapshot.docs[0].id;
          admin.firestore().collection('users').doc(uid).update({
            'stripeCustomerId' : event.data.object.id
          }).then((result) => {
            response.status(200).send({processed: true});
          }).catch((error) => {
            response.status(400).send({error: error});
          })
        } else {
          response.status(200).send({error: 'No Customer Defined.'});
        }
      }).catch((error: any) => {
        response.status(400).send({error: error});
      });
      break;
      case 'customer.subscription.created':
      admin.firestore().collection('users').where('stripeCustomerId', '==', event.data.object.customer).limit(1).get().then((querySnapshot) => {
        if(!querySnapshot.empty) {
          const uid = querySnapshot.docs[0].id;
          admin.firestore().collection('users').doc(uid).update({
            'subscriptionId' : event.data.object.id,
          }).then(() => {
            admin.firestore().collection('subscriptions').doc(event.data.object.id).create(event.data.object).then((res) => {
              response.status(200).send({processed: true});
            }).catch((error: any) => {
              response.status(400).send({error: error});
            });
          }).catch((error: any) => {
            response.status(400).send({error: error});
          });
        } else {
          response.status(200).send({error: 'No Customer Defined.'});
        }
      }).catch((error: any) => {
        response.status(400).send({error: error});
      });
      break;
      case 'customer.subscription.trial_will_end':
      admin.firestore().collection('subscriptions').doc(event.data.object.id).update(event.data.object).then((res) => {
        response.status(200).send({processed: true});
      }).catch((error: any) => {
        response.status(400).send({error: error});
      });
      break;
      case 'customer.subscription.updated':
      admin.firestore().collection('subscriptions').doc(event.data.object.id).update(event.data.object).then((res) => {
        response.status(200).send({processed: true});
      }).catch((error: any) => {
        response.status(400).send({error: error});
      });
      break;
      case 'customer.subscription.deleted':
      admin.firestore().collection('subscriptions').doc(event.data.object.id).delete().then((res) => {
        admin.firestore().collection('users').where('stripeCustomerId', '==', event.data.object.customer).limit(1).get().then((querySnapshot) => {
          if(!querySnapshot.empty) {
            const uid = querySnapshot.docs[0].id;
            admin.firestore().collection('users').doc(uid).update({
              'subscriptionId' : null,
              'stripeCustomerId' : null
            }).then(() => {
              response.status(200).send({processed: true});
            }).catch((error: any) => {
              response.status(400).send({error: error});
            });
          } else {
            response.status(200).send({error: 'No Customer Defined.'});
          }
        }).catch((error: any) => {
          response.status(400).send({error: error});
        });
      }).catch((error: any) => {
        response.status(400).send({error: error});
      });
      break;
      default:
      // Unexpected event type
      response.status(200).send({error: 'Unexpected Event Type Recieved'});
      break;
    }
  });


