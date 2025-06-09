export interface Database {
  public: {
    Tables: {
      // ... other tables ...
      loads: {
        Row: {
          // ... other fields ...
          status:
            | "new"
            | "assigned"
            | "accepted"
            | "refused"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "other_archived" // Added 'other_archived'
          // ... other fields ...
        }
        Insert: {
          // ... other fields ...
          status?:
            | "new"
            | "assigned"
            | "accepted"
            | "refused"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "other_archived" // Added 'other_archived'
          // ... other fields ...
        }
        Update: {
          // ... other fields ...
          status?:
            | "new"
            | "assigned"
            | "accepted"
            | "refused"
            | "in_progress"
            | "completed"
            | "cancelled"
            | "other_archived" // Added 'other_archived'
          // ... other fields ...
        }
      }
      // ... other tables ...
    }
  }
}
