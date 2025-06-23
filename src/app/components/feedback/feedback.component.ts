import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeedbackService,Feedback } from '../../services/feedback/feedback.service';
import { UserService,User } from '../../services/user/user.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  rating: number = 0;
  hoveredRating: number = 0;
  stars = Array(5).fill(0);

  comment: string = '';
  feedbackList: Feedback[] = [];
  user!: User;

  isLoading: boolean = true;
  logo = 'images/images ui/nile brand.png';

  constructor(private feedbackService: FeedbackService, private userService: UserService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    this.userService.getMe().subscribe({
      next: (res) => {
        this.user = res;
        this.fetchFeedbacks();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  fetchFeedbacks(): void {
    this.feedbackService.getAllFeedback().subscribe({
      next: (res) => {
        this.feedbackList = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  setRating(value: number): void {
    this.rating = value;
  }

  hoverRating(value: number): void {
    this.hoveredRating = value;
  }

  resetHover(): void {
    this.hoveredRating = 0;
  }

  submitFeedback(): void {
    if (this.comment.trim() && this.rating > 0) {
      this.isLoading = true;
      this.feedbackService.createFeedback(this.comment, this.rating).subscribe({
        next: () => {
          this.comment = '';
          this.rating = 0;
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }

  getUserImageUrl(image: string): string {
    return this.userService.getUserImageUrl(image);
  }
}
