import { Component, OnInit } from '@angular/core';
import { StepperSidebarComponent } from '../../../shared/components/stepper-sidebar/stepper-sidebar.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [StepperSidebarComponent, CommonModule, RouterOutlet],
  selector: 'app-registration-layout',
  templateUrl: './registration-layout.component.html',
  styleUrls: ['./registration-layout.component.scss']
})
export class RegistrationLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
