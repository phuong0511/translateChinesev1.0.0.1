# Firebase Authentication Setup

There is a 400 Bad Request error when trying to sign in or sign up. This usually indicates an issue with your Firebase project's configuration.

Please follow these steps to resolve the issue:

## 1. Enable Email/Password Sign-in Provider

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  In the left-hand menu, go to **Authentication**.
4.  Click on the **Sign-in method** tab.
5.  If **Email/Password** is not enabled, click on it.
6.  Enable the provider and click **Save**.

![Enable Email/Password Provider](https://firebase.google.com/docs/auth/images/auth-providers.png)

## 2. Check your API Key and `.env.local` file

1.  Make sure you have a `.env.local` file in the root of your project.
2.  This file should contain your Firebase project's configuration, as shown in `.env.example`.
3.  Double-check that the values for `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc., are correct. You can find these values in your Firebase project settings.

## 3. Check API Key Restrictions

If you have set up API key restrictions, make sure that the key allows requests from `localhost` for development.

1.  Go to the [Google Cloud Console API & Services](https://console.cloud.google.com/apis/credentials).
2.  Select your project.
3.  Find your API key and click on it to edit.
4.  Under **Application restrictions**, make sure you have **HTTP referrers (web sites)** selected, and that `http://localhost:*` is included in the list of allowed referrers.

After following these steps, the authentication errors should be resolved.
