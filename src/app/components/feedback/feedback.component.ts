import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent {
  rating: number = 0; // Stores selected rating
  hoveredRating: number = 0; // Stores temporary hover rating
  stars = Array(5).fill(0); // Creates an array of 5 elements for stars

  setRating(value: number): void {
    this.rating = value; // Set the clicked rating
  }

  hoverRating(value: number): void {
    this.hoveredRating = value; // Change color on hover
  }

  resetHover(): void {
    this.hoveredRating = 0; // Reset color on mouse leave
  }
}
