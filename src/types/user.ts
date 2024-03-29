import { Story } from './story';
import { ReviewReservation } from './review_reservation';

export class User {
  private name: string;
  private password: string;
  private postedStories: Story[];
  private reservedStories: ReviewReservation[];
  private credit: number;

  constructor(
    name: string,
    password: string,
    postedStories: Story[] = [],
    reservedStories: ReviewReservation[] = [],
    credit: number = 0
  ) {
    this.name = name;
    this.password = password;
    this.postedStories = postedStories;
    this.reservedStories = reservedStories;
    this.credit = credit;
  }

  public getPostedStories(): Story[] {
    return this.postedStories;
  }

  public getReservedStories(): ReviewReservation[] {
    return this.reservedStories.filter(
      review => review.reviewCompleted == null
    );
  }

  public getReviewedStories(): ReviewReservation[] {
    return this.reservedStories.filter(
      review => review.reviewCompleted != null
    );
  }

  public getCredit(): number {
    return this.credit;
  }

  public addCredit(newCredit: number) {
    this.credit += newCredit;
  }

  public getName(): string {
    return this.name;
  }

  public addReservedStory(review: ReviewReservation) {
    this.reservedStories.unshift(review);
  }
}
