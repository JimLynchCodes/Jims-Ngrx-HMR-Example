import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {MainEffects} from "./state-management/effects/main.effects";
import {EffectsModule} from "@ngrx/effects";
import { removeNgStyles, createNewHosts, createInputTransfer, bootloader } from '@angularclass/hmr'


import 'rxjs/add/operator/take';

import {
  Action,
  ActionReducer,
  combineReducers,
  Store,
  StoreModule
} from '@ngrx/store';
import { compose } from '@ngrx/core/compose';
import { ButtonsContainerComponent } from './routes/main/buttons-container/buttons-container.component';
import { ButtonsComponent } from './routes/main/buttons/buttons/buttons.d.component';
import {mainStoreReducer} from "./state-management/reducers/main.reducer";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {AngularFireModule} from "angularfire2/angularfire2";
import {AuthProviders, AuthMethods, firebaseAuthConfig} from "angularfire2/index";
import {MainState} from "./state-management/states/main.state";
import {stateSetter} from "./state-management/hmr/state-setter";


export const firebaseConfig = {
  apiKey: "AIzaSyDwCrWWdMH0nu9y7Dz6gxK0RPXsheO5KeA",
  authDomain: "qa-cypherapp.firebaseapp.com",
  databaseURL: "https://qa-cypherapp.firebaseio.com",
  storageBucket: "qa-cypherapp.appspot.com",
  messagingSenderId: "78542650498"

};


type StoreType = {
  state: MainState,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

@NgModule({
  declarations: [
    AppComponent,
    ButtonsContainerComponent,
    ButtonsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    StoreModule.provideStore({mainStoreReducer:mainStoreReducer,
                              stateSetter:stateSetter}),
    EffectsModule.run(MainEffects),
    StoreDevtoolsModule.instrumentOnlyWithExtension(),
    AngularFireModule.initializeApp(firebaseConfig, {
      provider: AuthProviders.Anonymous,
      method: AuthMethods.Anonymous
    })

  ],
  providers: [],
  bootstrap: [AppComponent,
   ]
})
export class AppModule {
  constructor(public appRef:ApplicationRef, private _store:Store<any>) {
  }

  hmrOnInit(store:StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));

    // set state
    // restore state by dispatch a SET_ROOT_STATE action
    if (store.state) {
      this._store.dispatch(<Action>{type: 'SET_ROOT_STATE', payload: store.state});
    }

    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store:StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    this._store.take(1).subscribe(s => store.state = s);

    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);

    // save input values
    store.restoreInputValues = createInputTransfer();

    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store:StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}
