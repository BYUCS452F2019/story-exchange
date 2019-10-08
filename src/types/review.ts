export class Review {
  reviewID: string;
  reviewerID: string;
  storyID: string;
  reviewText: string;
  dateReserved: Date;
  reviewCompleted: Date | null;
  stars: number;

  constructor(
    reviewID: string,
    reviewerID: string,
    storyID: string,
    reviewText: string,
    dateReserved: Date,
    reviewCompleted: Date | null,
    stars: number
  ) {
    this.reviewID = reviewID;
    this.reviewerID = reviewerID;
    this.storyID = storyID;
    this.reviewText = reviewText;
    this.dateReserved = dateReserved;
    this.reviewCompleted = reviewCompleted;
    this.stars = stars;
  }
}
