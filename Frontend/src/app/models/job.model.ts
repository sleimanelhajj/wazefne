export interface Job {
  id: number;
  client_id: string; // The user ID of the client who posted the job
  title: string;
  description: string;
  budget?: number;
  category: string;
  location: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;

  // Joined fields from the users table (returned by the backend GET requests)
  client_first_name?: string;
  client_last_name?: string;
  client_avatar?: string;
}

export interface JobBid {
  id: number;
  job_id: number;
  freelancer_id: string; // The user ID of the freelancer bidding
  proposal: string;
  proposed_rate: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;

  // Joined fields from the users table
  freelancer_first_name?: string;
  freelancer_last_name?: string;
  freelancer_avatar?: string;
  freelancer_title?: string;
  freelancer_rating?: number;
}
