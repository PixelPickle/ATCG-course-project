import {Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from './auth.service';
import {Subscription} from 'rxjs';
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) {}

  // Boolean Controls if in "Login Mode" or "Sign Up Mode"
  isLoginMode = true;

  // Boolean Controls if We Display a Loading Spinner
  isLoading = false;

  // Container for the Error Message Displayed when Alert Component is Created
  error: string = null;

  // Subscription for Alert Component
  private alertSubscription: Subscription;

  // Reference to HTML Element Where Alert Component Should be Rendered
  @ViewChild(PlaceholderDirective, {static: false}) alertHost: PlaceholderDirective;

  ngOnInit() {

    // Setup Subscription to Auth Store
    this.store.select('auth').subscribe( authState => {

      // When a New State is Emitted, Capture Loading Boolean
      this.isLoading = authState.loading;

      // When a New State is Emitted, Capture Auth Error Message (Could be null)
      this.error = authState.authError;

      // If Auth Error Message is not Null
      if (this.error) {

        // Call to Display the Auth Error We Received
        this.showErrorAlert(this.error);

      }
    } );

  }

  ngOnDestroy() {

    // If We Have a Subscription:
    if (this.alertSubscription) {

      // We Need to Unsubscribe From It
      this.alertSubscription.unsubscribe();
    }

  }

  onSwitchMode() {

    // Toggle the Login Mode Boolean Variable
    this.isLoginMode = !this.isLoginMode;

  }

  onSubmit(form: NgForm) {

    // Submit the form
    const email = form.value.email;
    const password = form.value.password;

    // Call Appropriate HTTP Request
    if (this.isLoginMode) {
      this.store.dispatch( new AuthActions.LoginRequest({email, password}) );
    } else {
      this.store.dispatch( new AuthActions.SignUpRequest({email, password}) );
    }

    form.reset();

  }

  private showErrorAlert( message: string ) {

    // Create a Factory to Make Alert Components
    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

    // Get Reference to the View Container
    const hostViewContainerRef = this.alertHost.viewContainerRef;

    // Clear the View Container
    hostViewContainerRef.clear();

    // Create an Alert Component using the Factory
    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);

    // Pass the Message to the New Component
    componentRef.instance.message = message;

    // Subscribe to the Closed Subject
    this.alertSubscription = componentRef.instance.closed.subscribe( () => {

      // When the Subject Emits, Unsubscribe Since the Component is Being Destroyed
      this.alertSubscription.unsubscribe();

      // When the Subject Emits, Clear the View Container
      hostViewContainerRef.clear();

    } );

  }

}
