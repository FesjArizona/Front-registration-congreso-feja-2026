import { Component, OnInit } from '@angular/core';
import { StepperSidebarComponent } from '../../../shared/components/stepper-sidebar/stepper-sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopbarMobileComponent } from '../../../shared/components/topbar-mobile/topbar-mobile.component';
import { FooterBarComponent } from '../../../shared/components/footer-bar/footer-bar.component';

@Component({
  standalone: true,
  imports: [StepperSidebarComponent, CommonModule, RouterOutlet, TopbarMobileComponent, FooterBarComponent],
  selector: 'app-registration-layout',
  templateUrl: './registration-layout.component.html',
  styleUrls: ['./registration-layout.component.scss']
})
export class RegistrationLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
