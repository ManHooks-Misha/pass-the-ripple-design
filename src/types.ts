// import { ReactNode, ComponentType } from "react";

export type UserProfile = {
    email : string,
    parent_email?: string,
    ripple_id?: string,
    nickname : string,
    date_of_birth?: string,
    terms_agreed?: boolean,
    role : "student" | "teacher" | "admin" | "child" | "user",
    avatar_id?: number | null,
    custom_avatar?: string | null,
    profile_image_path?: string | null,
    profile_image_url?: string | null,
    age_group?: string,
    id?: number,
    full_name?: string,
    [key: string]: any; // Allow additional properties
};

