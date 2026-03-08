export interface Job {
  id?: number;
  client_id: string; // UUID from users table
  title: string;
  description: string;
  budget?: number; // Optional
  category: string;
  location: string;
  status?: "open" | "in_progress" | "completed" | "cancelled";
  created_at?: Date;
  updated_at?: Date;
}

export interface JobBid {
  id?: number;
  job_id: number;
  freelancer_id: string; // UUID from users table
  proposal: string;
  proposed_rate: number;
  status?: "pending" | "accepted" | "rejected";
  created_at?: Date;
}

// Data Transfer Objects (DTOs) for API requests
export interface CreateJobDTO {
  title: string;
  description: string;
  budget?: number;
  category: string;
  location: string;
}

export interface CreateJobBidDTO {
  proposal: string;
  proposed_rate: number;
}
