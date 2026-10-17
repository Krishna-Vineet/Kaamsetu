// Skills available for workers and jobs

// Job status constants
export const JOB_STATUS = {
  POSTED: 'posted',
  ASSIGNED: 'assigned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Review types
export const REVIEW_TYPES = {
  WORKER_TO_CLIENT: 'worker-to-client',
  CLIENT_TO_WORKER: 'client-to-worker'
};

// User roles
export const USER_ROLES = {
  CLIENT: 'client',
  WORKER: 'worker'
};

// Skill display names
export const SKILL_DISPLAY_NAMES = {
  'electrician': 'Electrician',
  'plumber': 'Plumber',
  'carpenter': 'Carpenter',
  'painter': 'Painter',
  'cleaner': 'Cleaner',
  'mechanic': 'Mechanic',
  'gardener': 'Gardener',
  'cook': 'Cook',
  'driver': 'Driver',
  'security-guard': 'Security Guard'
};

// Job status display names
export const JOB_STATUS_DISPLAY_NAMES = {
  'posted': 'Posted',
  'assigned': 'Assigned',
  'active': 'Active',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

// Job status colors for UI
export const JOB_STATUS_COLORS = {
  'posted': 'blue',
  'assigned': 'yellow',
  'active': 'green',
  'completed': 'gray',
  'cancelled': 'red'
};