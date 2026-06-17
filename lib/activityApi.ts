import { apiClient } from "./apiClient";

export type ActivityApprovalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED";
export type ActivityVisibilityType =
  | "WHOLE_SCHOOL"
  | "SELECTED_CLASSES"
  | "SELECTED_STUDENTS"
  | "STUDENT_PARENTS_ONLY";

export type ActivityMedia = {
  id?: string | number;
  activityId?: string | number;
  fileName?: string;
  contentType?: string;
  storageKey?: string;
  mediaType?: "PHOTO" | "VIDEO" | string;
  thumbnailKey?: string;
  fileSize?: number;
  sizeBytes?: number;
  displayOrder?: number;
  url?: string;
  mediaUrl?: string;
  publicUrl?: string;
  signedUrl?: string;
  thumbnailUrl?: string;
  uploadedAt?: string;
};

export type Activity = {
  id: string | number;
  schoolId?: string;
  title: string;
  description?: string;
  activityDate?: string;
  createdBy?: string | number;
  createdByName?: string;
  approvalStatus?: ActivityApprovalStatus | string;
  visibilityType?: ActivityVisibilityType | string;
  coverMediaId?: string | number;
  media?: ActivityMedia[];
  mediaItems?: ActivityMedia[];
  mediaList?: ActivityMedia[];
  mediaCount?: number;
  photoCount?: number;
  videoCount?: number;
  likeCount?: number;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateActivityPayload = {
  title: string;
  description: string;
  activityDate: string;
  visibilityType: ActivityVisibilityType;
  classIds?: Array<string | number>;
  studentIds?: Array<string | number>;
};

type ActivityListResponse =
  | Activity[]
  | { content?: Activity[]; activities?: Activity[]; data?: Activity[] };

function normalizeList(payload: ActivityListResponse): Activity[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.activities)) return payload.activities;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export const activityApi = {
  async feed(schoolId: string, page = 0, size = 30) {
    const payload = await apiClient<ActivityListResponse>("/api/feed", {
      schoolId,
      query: { page, size },
    });
    return normalizeList(payload);
  },

  async detail(schoolId: string, activityId: string | number) {
    return apiClient<Activity>(`/api/feed/${activityId}`, { schoolId });
  },

  async gallery(schoolId: string, page = 0, size = 60) {
    const payload = await apiClient<ActivityListResponse>("/api/feed/gallery", {
      schoolId,
      query: { page, size },
    });
    return normalizeList(payload);
  },

  async timeline(schoolId: string, page = 0, size = 80) {
    const payload = await apiClient<ActivityListResponse>(
      "/api/feed/timeline",
      {
        schoolId,
        query: { page, size },
      },
    );
    return normalizeList(payload);
  },

  async pending(schoolId: string) {
    const payload = await apiClient<ActivityListResponse>(
      "/api/activities/pending",
      { schoolId },
    );
    return normalizeList(payload);
  },

  create(schoolId: string, payload: CreateActivityPayload) {
    return apiClient<Activity>("/api/activities", {
      method: "POST",
      schoolId,
      body: JSON.stringify({ ...payload, schoolId }),
    });
  },

  teacherCreate(schoolId: string, payload: CreateActivityPayload) {
    return apiClient<Activity>("/api/teacher/activities", {
      method: "POST",
      schoolId,
      body: JSON.stringify({ ...payload, schoolId }),
    });
  },

  submit(schoolId: string, activityId: string | number, teacher = false) {
    const prefix = teacher ? "/api/teacher/activities" : "/api/activities";
    return apiClient<Activity>(`${prefix}/${activityId}/submit`, {
      method: "POST",
      schoolId,
    });
  },

  approve(
    schoolId: string,
    activityId: string | number,
    remarks = "Approved for publishing.",
  ) {
    return apiClient<Activity>(`/api/activities/${activityId}/approve`, {
      method: "POST",
      schoolId,
      body: JSON.stringify({ remarks }),
    });
  },

  reject(schoolId: string, activityId: string | number, remarks: string) {
    return apiClient<Activity>(`/api/activities/${activityId}/reject`, {
      method: "POST",
      schoolId,
      body: JSON.stringify({ remarks }),
    });
  },

  async uploadMedia(
    schoolId: string,
    activityId: string | number,
    files: FileList | File[],
    uploadedBy?: string | number,
  ) {
    const uploaded: ActivityMedia[] = [];
    const fileArray = Array.from(files || []);

    for (let index = 0; index < fileArray.length; index += 1) {
      const file = fileArray[index];
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "mediaType",
        file.type.startsWith("video/") ? "VIDEO" : "PHOTO",
      );
      formData.append("displayOrder", String(index));
      if (uploadedBy) formData.append("uploadedBy", String(uploadedBy));

      uploaded.push(
        await apiClient<ActivityMedia>(`/api/activities/${activityId}/media`, {
          method: "POST",
          schoolId,
          body: formData,
        }),
      );
    }

    return uploaded;
  },

  media(schoolId: string, activityId: string | number) {
    return apiClient<ActivityMedia[]>(`/api/activities/${activityId}/media`, {
      schoolId,
    });
  },

  deleteMedia(
    schoolId: string,
    activityId: string | number,
    mediaId: string | number,
  ) {
    return apiClient<void>(`/api/activities/${activityId}/media/${mediaId}`, {
      method: "DELETE",
      schoolId,
    });
  },

  publish(schoolId: string, activityId: string | number) {
    return apiClient<Activity>(`/api/activities/${activityId}/publish`, {
      method: "POST",
      schoolId,
    });
  },
};
