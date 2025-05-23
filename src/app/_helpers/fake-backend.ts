﻿import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';

// array in local storage for accounts

const accountsKey = 'accountsKey';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];
// console.log('accounts: ', accounts)

// for removing the accounts key and value
// accounts = localStorage.removeItem(accountsKey)


const departmentKey = 'departments'
let departments = JSON.parse(localStorage.getItem(departmentKey)) || []
// console.log('departments: ', departments)

// for removing the accounts key and value
// departments = localStorage.removeItem(departmentKey)



@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    constructor(private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;

        return handleRoute();                                                                                                  

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getList(accounts, accountsKey)
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getById(accounts, accountsKey)
                case url.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                // departments
                case url.endsWith('/departments') && method === 'POST':
                    return createDepartment();
                case url.endsWith('/departments') && method === 'GET':
                    return getList(departments, departmentKey)
                case url.match(/\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'GET':
                // return getDepartmentById();
                    return getById(departments, departmentKey)
                case url.match(/\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { email, password } = body;
            const emailExist = accounts.find(x => x.email === email)
            if(!emailExist) return error('email doesnt exist')

            const account = accounts.find(x => x.email === email && x.password === password);
            if (!account) return error('password is incorrect');

            const isActive = accounts.find(x => x.email === email && x.password === password && x.isActive)
            if(!isActive) return error('Account is inActive. Please contact system Administrator!') 

            const isVerified = accounts.find(x => x.email === email && x.password === password && x.isVerified)
            if(!isVerified){
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4> 
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
                return error('Email is not verified')
            } 

            // const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);
            // if(!account) return error('hell nah')

            // add refresh token to account
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                // ...basicAccountDetails(account),
                ...basicDetails(accountsKey, account),
                jwtToken: generateJwtToken(account)
            });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();
            
            if (!refreshToken) return unauthorized();

            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            
            if (!account) return unauthorized();

            // replace old refresh token with a new one and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                // ...basicAccountDetails(account),
                ...basicDetails(accountsKey, account),
                jwtToken: generateJwtToken(account)
            });

        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();
            
            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            
            // revoke token and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function register() {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                // display email already registered "email" in alert
                setTimeout(() => {
                    alertService.info(`
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);

                // always return ok() response to prevent email enumeration
                return ok();
            }


            // assign account id and a few other properties then save
            account.id = newId(accounts);
            if (account.id === 1) {
                // first registered account is an admin
                account.role = Role.Admin;
                account.isVerified = true
            } else {
                account.role = Role.User;
                account.isVerified = false
            }
            account.isActive = true
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display verification email in alert

            if(account.id === 1){
                setTimeout(() => {
                    alertService.info(`
                        <h4>First user login</h4>
                        <p>you can login directly as first user where role is admin and account is verified</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
            }
            else{
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4>
                        <p>Thanks for registering!</p>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
            }

            return ok();
        }
        
        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);
            
            if (!account) return error('Verification failed');
            
            // set is verified flag to true if token is valid
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);
            
            // always return ok() response to prevent email enumeration
            if (!account) return ok();
            
            // create reset token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display password reset email in alert
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertService.info(`
                    <h4>Reset Password Email</h4>
                    <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }
        
        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );
            
            if (!account) return error('Invalid token');
            
            return ok();
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );
            
            if (!account) return error('Invalid token');
            
            // update password and remove reset token
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function getList(list, key){
            if (!isAuthenticated()) return unauthorized();
            return ok(list.map(x => basicDetails(key, x)));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                console.log('email already registered')
                return error(`Email ${account.email} is already registered`);
            }

            // assign account id and a few other properties then save
            account.id = newId(accounts);
            account.dateCreated = new Date().toISOString();
            account.isVerified = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccount() {
            if (!isAuthenticated()) return unauthorized();

            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can update own profile and admin accounts can update all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // only update password if included
            if (!params.password) {
                delete params.password;
            }
            // don't save confirm password
            delete params.confirmPassword;

            // update and save account
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // return ok(basicAccountDetails(account));
            return ok(basicDetails(accountsKey, account));
        }

        function deleteAccount() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can delete own account and admin accounts can delete any account
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // delete account then save
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }

        function deleteDepartment(){
            if (!isAuthenticated()) return unauthorized();

            if (!isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            departments = departments.filter(x => x.id !== idFromUrl())
            localStorage.setItem(departmentKey, JSON.stringify(departments))
            return ok()
        }
        
        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize()); 
                // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function basicDetails(key, list){
            if(key === 'accountsKey'){
                const { id, title, firstName, lastName, email, role, dateCreated, isVerified, isActive } = list;
                return { id, title, firstName, lastName, email, role, dateCreated, isVerified, isActive };
            }
            else if(key === 'departments'){
                const { id, name, description } = list;
                return { id, name, description };
            }
        }

        function isAuthenticated() {
            return !!currentAccount();
        }

        function isAuthorized(role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newId(list) {
            return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            // check if jwt token is in auth header
            const authHeader = headers.get('Authorization');
            if (!authHeader.startsWith('Bearer fake-jwt-token')) return;

            // check if token is expired
            const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
            const tokenExpired = Date.now() > (jwtToken.exp * 1000);
            if (tokenExpired) return;

            const account = accounts.find(x => x.id === jwtToken.id);
            return account;
        }           

        function generateJwtToken(account) {
            // create token that expires in 15 minutes
            const tokenPayload = { 
                exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
                // exp: 1,
                id: account.id
            }
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

        function generateRefreshToken() {
            const token = new Date().getTime().toString();

            // add token cookie that expires in 7 days
            const expires = new Date(Date.now() + 7*24*60*60*1000).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
            
            return token;
        }

        function getRefreshToken() {
            // get refresh token from cookie
            return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
        }

        // department functions
        function createDepartment(){
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const department = body;

            if(departments.find(x => x.name === department.name)){
                return error('name already registered. pag pili ug lain bithc')
            }

            department.id = newId(departments)
            departments.push(department)
            localStorage.setItem(departmentKey, JSON.stringify(departments))
            return ok()
        }

        function updateDepartment(){
            if (!isAuthenticated()) return unauthorized();
            let params = body
            let department = departments.find(x => x.id === idFromUrl())

            Object.assign(department, params)
            localStorage.setItem(departmentKey, JSON.stringify(departments))
            console.log(`updating department`)
            return ok(basicDetails(departmentKey, department))
        }

        function getById(listType, key){
            if (!isAuthenticated()) return unauthorized();
            
            let list = listType.find(x => x.id === idFromUrl())

            if (key === 'accountsKey' && list.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            return ok(basicDetails(key, list))
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};