export class ReviewReservation {
  userID: string;
  storyID: string;

  constructor(userID: string, storyID: string) {
    this.userID = userID;
    this.storyID = storyID;
  }
}
