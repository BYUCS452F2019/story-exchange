import { Review } from "../types/review";
import { Reservation } from "../types/reservation";

export interface Database {
  getStories(): Promise<any>;
  addStory(
    userID: number,
    url: string,
    title: string,
    genre: string,
    blurb: string,
    wordCount: number,
    desiredReviews: number,
    postingCost: number
  ): Promise<any>;
  getStoriesByUser(userID: number): Promise<any>;

  getBlankSearch(userID?: number): Promise<any>;
  searchStories(
    searchTerm: string,
    userToExclude?: string,
    includeReviewsFinished?: boolean
  ): Promise<any>;

  getReviewsByUser(userID: number): Promise<any>;
  getReviewsByStory(storyID: number): Promise<any>;
  addReview(review: Review, creditEarned: number): Promise<any>;
  rateReview(reviewID: number, rating: number): Promise<any>;

  getReservationsByUser(userID: number): Promise<Reservation[]>;
  addReservation(userID: number, storyID: number): Promise<any>;

  register(username: string, password: string): Promise<any>;
  loginUser(username: string, password: string): Promise<any>;
}
