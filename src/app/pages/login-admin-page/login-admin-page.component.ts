import { SnackbarService } from './../../core/services/snackbar.service';
import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/core/services/storage.service';
import { AMBIENTE } from 'src/app/core/util/constants';
import { environment } from '../../environments/environment';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-admin-page',
  templateUrl: './login-admin-page.component.html',
  styleUrls: ['./login-admin-page.component.css']
})
export class LoginAdminPageComponent implements OnInit {

  constructor(private storageService:StorageService,
    private userService:UserService, private router: Router) { }

  ngOnInit(): void {
    if(this.userService.isLogged()){
      this.router.navigate(['/admin']);
    }
  }

  loginGoogle(): void {
    this.storageService.setItem(AMBIENTE, "admin");
    window.location.href=`${environment.apiUrl}/oauth2/authorization/google`;
  }

  loginFacebook(): void {
    this.storageService.setItem(AMBIENTE, "admin");
    window.location.href=`${environment.apiUrl}/oauth2/authorization/facebook`;
  }

}
