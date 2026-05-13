export type ProfileVisibility = {
  first_name: boolean;
  last_name: boolean;
  phone: boolean;
  email: boolean;
  location: boolean;
  specialty: boolean;
  bio: boolean;
  years_experience: boolean;
  links: boolean;
  daily_rate: boolean;
  website: boolean;
  skills: boolean;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  specialty_ids: string[];
  specialty_category_id: string | null;
  specialty_category_ids: string[];
  location: string | null;
  bio: string | null;
  x_handle: string;
  avatar_url: string | null;
  phone: string | null;
  years_experience: number | null;
  country_code: string | null;
  availability_status: "available" | "busy" | "unavailable" | "unset";
  skills: string[];
  daily_rate: string | null;
  website: string | null;
  visibility: ProfileVisibility;
  status: "pending" | "approved" | "rejected";
  is_admin: boolean;
  links: Record<string, string> | null;
  accept_sponsorship: boolean;
  accept_dms: boolean;
  accept_referrals: boolean;
  sponsored_by: string | null;
  sponsor_approved: boolean;
  onboarding_completed: boolean;
  looking_for: string | null;
  hidden_channel_ids: string[];
  created_at: string;
  updated_at: string;
  sponsor?: Profile;
};

export type SpecialtyCategory = {
  id: string;
  name: string;
  sector: string | null;
  sort_order: number;
};

export type Specialty = {
  id: string;
  category_id: string;
  name: string;
};

export type Invitation = {
  id: string;
  inviter_id: string;
  invited_x_handle: string;
  status: "pending" | "accepted" | "rejected";
  accepted_by: string | null;
  created_at: string;
  updated_at: string;
  inviter?: Profile;
};

export type Channel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string | null;
  is_private: boolean;
  read_permission: "all" | "admin_only";
  write_permission: "all" | "admin_only";
  created_at: string;
};

export type ChannelMember = {
  channel_id: string;
  user_id: string;
  joined_at: string;
};

export type Message = {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type MessageReaction = {
  message_id: string;
  user_id: string;
  emoji: string;
};

export type ChannelProposal = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  status: "open" | "approved" | "rejected";
  created_at: string;
  vote_count?: number;
  has_voted?: boolean;
};

export type ChannelVote = {
  proposal_id: string;
  user_id: string;
  created_at: string;
};

export type ForumCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  is_introduction: boolean;
};

export type ForumPost = {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: ForumCategory;
  tags?: ForumTag[];
};

export type ForumReply = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type ForumTag = {
  id: string;
  name: string;
  color: string | null;
};

export type SponsorshipRequest = {
  id: string;
  requester_id: string;
  sponsor_handle: string;
  sponsor_id: string | null;
  status: "pending" | "approved" | "rejected";
  attempt_number: number;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  sponsor?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  type: "chat_mention" | "forum_mention" | "forum_reply" | "sponsor_request" | "welcome";
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
};
