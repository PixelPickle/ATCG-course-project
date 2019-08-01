import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService} from './auth.service';
import {Observable, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {AlertComponent} from '../shared/alert/alert.component';
import {PlaceholderDirective} from '../shared/placeholder/placeholder.directive';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  @ViewChild(PlaceholderDirective, {static: false}) alertHost: PlaceholderDirective;

  private subscription: Subscription;

  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>) {}

  ngOnInit() {


    this.store.select('auth').subscribe( authState => {
      // New Store Method
      this.isLoading = authState.loading;
      this.error = authState.authError;

      if (this.error) {
        this.showErrorAlert(this.error);
      }
    } );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    // Submit the form
    const email = form.value.email;
    const password = form.value.password;

    // Container for the Observable Returned by the HTTP Request
    // let authObservable: Observable<AuthResponseData>;

    // Start Loading
    // this.isLoading = true;

    // Call Appropriate HTTP Request
    if (this.isLoginMode) {
      // authObservable = this.authService.login(email, password);
      this.store.dispatch( new AuthActions.LoginRequest({email, password}) );
    } else {
      // authObservable = this.authService.signUp(email, password);
      this.store.dispatch( new AuthActions.SignUpRequest({email, password}) );
    }

    // authObservable.subscribe(
    //   (responseData) => {
    //     console.log(responseData);
    //     this.isLoading = false;
    //     this.router.navigate(['/recipes']);
    //   },
    //   (errorMessage) => {
    //     console.log(errorMessage);
    //     this.error = errorMessage;
    //     this.showErrorAlert(errorMessage);
    //     this.isLoading = false;
    //   });

    form.reset();
  }

  onClosedError() {
    this.error = null;
  }

  private showErrorAlert( message: string ) {
    // const alertComponent = new AlertComponent(); <-- This doesn't work, not how Angular does it.

    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

    const hostViewContainerRef = this.alertHost.viewContainerRef;

    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);

    componentRef.instance.message = message;
    this.subscription = componentRef.instance.closed.subscribe( () => {
      this.subscription.unsubscribe();
      hostViewContainerRef.clear();
    } );
  }
}
