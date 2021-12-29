import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PortalModule } from '@angular/cdk/portal';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WindowComponent } from './window/window.component';
import { IconComponent } from './icon/icon.component';
import { DragDirective } from './services/drag.directive';
import { appComponents } from './apps';
import { KHZPipe } from './services/khz.pipe';

@NgModule({
	declarations: [
		AppComponent,
		WindowComponent,
		IconComponent,
		DragDirective,
		KHZPipe,
		...appComponents,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		CommonModule,
		PortalModule,
		HttpClientModule
	],
	providers: [],
	entryComponents: [
		...appComponents,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
