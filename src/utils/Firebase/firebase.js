import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage'

import config from '../../../firebaseConfig';

class Firebase {
  constructor() {
    
    if (!app.apps.length) {
      app.initializeApp(config);
    }

    /* Helper */

    this.fieldValue = app.firestore.FieldValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.firestore();
    this.functions = app.functions();

    /* Social Sign In Method Provider */

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();

    /* storage */
    this.storage = app.storage()
  }

  // *** storage url ***

  uploadImage = (uid, subfile, fileName, file) => this.storage.ref().child(`${uid}/${subfile}/${fileName}`).put(file)
  downloadImage = (fullpath) => this.storage.ref(fullpath).getDownloadURL()

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    this.auth.signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    this.auth.signInWithPopup(this.twitterProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: window.location.href,
    });

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  getCurrentUserId = () => this.auth.currentUser.uid

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then(snapshot => {
            const dbUser = snapshot.data();
            this.uid = authUser.uid

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = uid => this.db.collection('users').doc(uid);

  users = () => this.db.collection('users');

  posts = () => this.db.collection('posts');

  post = post => this.posts().where('slug', '==', post.slug);

  // *** user in firestore **
  getUser = uid => this.db.collection('users').doc(uid).get()
  updateUser = (uid, param) => this.db.collection('users').doc(uid).update(param)

  // *** pavilion register ****

  savePavilionBasicInfo = (data, uid) => this.db.collection('pavilion-basic').doc(uid).set(data)
  
  saveTemporaryPavilionAdvanceInfo = (data, uid) => this.db.collection('pavilion-temporary-save-info').doc(uid).set(data)
  getTemporaryPavilionAdvanceInfo = (uid) => this.db.collection('pavilion-temporary-save-info').doc(uid).get()

  savePavilionAdvanceInfo = (data, uid) => this.db.collection('pavilion-advance-info').doc(uid).set(data)


  // ** use for admin only **
  getPavilionAdvanceInfo = () => this.db.collection('pavilion-advance-info').get()
}

let firebase;

function getFirebase(app, auth, database) {
  if (!firebase) {
    firebase = new Firebase(app, auth, database);
  }

  return firebase;
}

export default getFirebase;
