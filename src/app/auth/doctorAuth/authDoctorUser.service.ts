import { map } from 'rxjs/operators';
//import { AShoppingCartItemsComponent } from './../../mainwindow/a-inventory-window/a-shopping-cart-window/a-shopping-cart-items/a-shopping-cart-items.component';
import { Router } from '@angular/router';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
//import { AuthData } from './auth-data.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthDoctorData } from './doctorAuth-model';
import { Token } from '@angular/compiler/src/ml_parser/lexer';

@Injectable({providedIn: 'root'})
export class AuthDoctorUserService {

  isAuthenticated = false;
  private token : string;
  private tokenTimer : any;
  private authStatusListener  = new Subject<boolean>();
  doctors: Array<any> = [];
  private doctorUpdated = new Subject<AuthDoctorData[]>();
  private currentUserSubject: BehaviorSubject<AuthDoctorData>;
  public currentUser: Observable<AuthDoctorData>;
  private name;
  private contact;
  private email;
  private docId;


  constructor(private http: HttpClient, private router: Router){
    this.currentUserSubject = new BehaviorSubject<AuthDoctorData>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
  }

  createDoctorUser(name: string , contact: string , docId: string ,email: string ,password: string ){
    const authDoctorData :AuthDoctorData = {name:name , contact:contact , docId:docId , email:email , password:password};
    this.http.post("http://localhost:3000/api/doctorUser/doctorSignup",authDoctorData)
      .subscribe(response =>{
        console.log(response);
      });

  }


  login(email: string, password){
    const authDoctorData :AuthDoctorData = {name: name , contact: null , docId: null , email: email , password: password};
    this.http.post<{token: string, expiresIn: number, name:string, contact: string, email:string,docId:string}>("http://localhost:3000/api/doctorUser/doctorLogin",authDoctorData)
      .subscribe(response =>{
        const token= response.token;
        this.token=token;
        if(token){
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate,email);
          this.saveAuthData(token, expirationDate );
          this.name = response.name;
          this.contact = response.contact;
          this.email = response.email;
          this.docId = response.docId;
          console.log(this.name,this.docId,this.contact,this.email);
          //this.aShoppingCartItemsComponent.onViewUserEmail(email);
          this.router.navigate(['/shoppingcart']);

        }



      });
      return this.http.get<{name: string , contact: string , docId: string, email: string}>
    ('http://localhost:3000/api/doctorUser/shoppingcart/'+email);

  }


  private setAuthTimer(duration : number){
    console.log("setting timer " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }


  private saveAuthData(token: string, expirationDate: Date){
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
  }


  logout(){
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/doctorLogin']);

  }

  private clearAuthData(){
    localStorage.removeItem("token");
    localStorage.removeItem("expiration")
  }



  getToken(){
    return this.token;
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  private getAuthData(){
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    if(!token || !expirationDate){
      return;
    }
    return{
      token: token,
      expirationDate : new Date(expirationDate)
    }
  }

  getDoctors(){
    this.doctors.push([this.name,this.contact,this.email,this.docId]);
    return(this.doctors);
  }
  // getDoctors(id: string) {
  //   return this.http.get<{userId:string,role:string}>("http://localhost:3000/api/user/profile/"+id);
  //  }

  getCurrentDoctor(){
    return this.currentUserSubject.value;
  }

//   getAll() {
//     return this.http.get<AuthDoctorData[]>('http://localhost:3000/api/doctorUser');
// }


  /////////////////////////////////////////////////////////////

  // interface TokenResponse {
  //   token: string;
  // }

  // export interface TokenPayload {
  //   email: string;
  //   password: string;
  //   name?: string;
  // }

  // private request(method: 'post'|'get', type: 'login'|'register'|'profile', user?: Token): Observable<any> {
  //   let base;

  //   if (method === 'post') {
  //     base = this.http.post(`/api/${type}`, user);
  //   } else {
  //     base = this.http.get(`/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }});
  //   }

  //   const request = base.pipe(
  //     map((data: TokenResponse) => {
  //       if (data.token) {
  //         this.saveToken(data.token);
  //       }
  //       return data;
  //     })
  //   );

  //   return request;
  // }

  // public profile(): Observable<any> {
  //   return this.request('get', 'profile');
  // }



};
