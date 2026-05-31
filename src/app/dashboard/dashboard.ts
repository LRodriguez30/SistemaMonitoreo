import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatTableModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {
        const savedTheme = localStorage.getItem('theme');

        this.isDarkMode = savedTheme === 'dark';

        document.documentElement.classList.toggle(
            'dark-theme',
            this.isDarkMode
        );
        
        this.router.navigate(['/ventas'])
    }

    isActive(route: string): boolean {
        return this.router.url.startsWith('/' + route);
    }

    isDarkMode = false;

toggleTheme() {

  this.isDarkMode = !this.isDarkMode;

  document.documentElement.classList.toggle(
    'dark-theme',
    this.isDarkMode
  );

  localStorage.setItem(
    'theme',
    this.isDarkMode ? 'dark' : 'light'
  );
}
}