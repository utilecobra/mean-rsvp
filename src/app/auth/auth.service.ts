import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AUTH_CONFIG } from './auth.config';
import * as auth0 from 'auth0-js';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class AuthService {
  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token id_token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });
  userProfile: any;
  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
  isAdmin: boolean;
  refreshSub: Subscription;

  constructor(private router: Router) {
    const lsProfile = localStorage.getItem('profile');

    if (this.tokenValid) {
      this.userProfile = JSON.parse(lsProfile);
      this.isAdmin = localStorage.getItem('isAdmin') === 'true';
      this.setLoggedIn(true);
      this.scheduleRenewal();
    } else if (!this.tokenValid && lsProfile) {
      this.logout();
    }
  }

  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  login(redirect?: string) {
    const _redirect = redirect ? redirect : this.router.url;
    localStorage.setItem('authRedirect', _redirect);
    this._auth0.authorize();
  }

  handleAuth() {
    this._auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this._getProfile(authResult);
      } else if (err) {
        this._clearRedirect();
        this.router.navigate(['/']);
        console.error(`Error authenticating: ${err.error}`);
      }
      this.router.navigate(['/']);
    });
  }

  private _getProfile(authResult) {
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
        this.router.navigate([localStorage.getItem('authRedirect') || '/']);
        this._clearRedirect();
      } else if (err) {
        console.error(`Error authenticating: ${err.error}`);
      }
      this._redirect();
      this._clearRedirect();
    });
  }

  private _redirect() {
    const fullRedirect = decodeURI(localStorage.getItem('authRedirect'));
    const redirectArr = fullRedirect.split('?tab=');
    const navArr = [redirectArr[0] || '/'];
    const tabObj = redirectArr[1] ? { queryParams: { tab: redirectArr[1] } } : null;

    if (!tabObj) {
      this.router.navigate(navArr);
    } else {
      this.router.navigate(navArr, tabObj);
    }
  }

  private _clearRedirect() {
    localStorage.removeItem('authRedirect');
  }

  private _setSession(authResult, profile?) {
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);

    if (profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
      this.userProfile = profile;
      this.isAdmin = this._checkAdmin(profile);
      localStorage.setItem('isAdmin', this.isAdmin.toString());
    }

    this.setLoggedIn(true);

    this.scheduleRenewal();
  }

  private _checkAdmin(profile) {
    const roles = profile[AUTH_CONFIG.NAMESPACE] || [];
    return roles.indexOf('admin') > -1;
  }

  logout(noRedirect?: boolean) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('authRedirect');
    localStorage.removeItem('isAdmin');
    this._clearRedirect();
    this.userProfile = undefined;
    this.isAdmin = undefined;
    this.setLoggedIn(false);

    this.unscheduleRenewal();

    if (noRedirect !== true) {
      this.router.navigate(['/']);
    }
  }

  get tokenValid(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  renewToken() {
    this._auth0.checkSession({},
      (err, authResult) => {
        if (authResult && authResult.accessToken) {
          this._setSession(authResult);
        } else if (err) {
          console.warn(`Could not renew token: ${err.errorDescription}`);
          // Log out without redirecting to clear auth data
          this.logout(true);
          // Log in again
          this.login();
        }
      }
    );
  }

  scheduleRenewal() {
    // If user isn't authenticated, do nothing
    if (!this.tokenValid) { return; }
    // Unsubscribe from previous expiration observable
    this.unscheduleRenewal();
    // Create and subscribe to expiration observable
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    const expiresIn$ = Observable.of(expiresAt)
      .mergeMap(
        expires => {
          const now = Date.now();
          // Use timer to track delay until expiration
          // to run the refresh at the proper time
          return Observable.timer(Math.max(1, expires - now));
        }
      );

    this.refreshSub = expiresIn$
      .subscribe(
        () => {
          this.renewToken();
          this.scheduleRenewal();
        }
      );
  }

  unscheduleRenewal() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

}
