export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export interface CreateReviewRequest {
  reviewed_user_id: string;
  rating: number;
  comment?: string;
}

export interface CreateReviewResponse {
  success: boolean;
  review?: Review;
  message?: string;
}

export interface GetReviewsResponse {
  success: boolean;
  reviews: Review[];
}
