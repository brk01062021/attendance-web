"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  activityApi,
  type Activity,
  type ActivityMedia,
} from "@/lib/activityApi";

type Props = {
  role: "ADMIN" | "PRINCIPAL";
  schoolId?: string;
};

type ModalState =
  | { type: "preview"; activity: Activity }
  | { type: "media"; activity: Activity }
  | null;

function formatDate(value?: string) {
  if (!value) return "Date not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function labelize(value?: string) {
  return (value || "WHOLE_SCHOOL")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mediaItems(activity: Activity): ActivityMedia[] {
  return activity.mediaList || activity.media || activity.mediaItems || [];
}

function mediaStats(activity: Activity) {
  const items = mediaItems(activity);
  const photos = Number(
    activity.photoCount ??
      items.filter(
        (item) =>
          String(item.mediaType || item.contentType || "")
            .toUpperCase()
            .includes("PHOTO") ||
          String(item.contentType || "").startsWith("image/"),
      ).length,
  );
  const videos = Number(
    activity.videoCount ??
      items.filter(
        (item) =>
          String(item.mediaType || item.contentType || "")
            .toUpperCase()
            .includes("VIDEO") ||
          String(item.contentType || "").startsWith("video/"),
      ).length,
  );
  const total = Number(
    activity.mediaCount ?? (photos + videos || items.length),
  );
  return { total, photos, videos, items };
}

function mediaUrl(item: ActivityMedia) {
  const possible =
    item.url ||
    item.mediaUrl ||
    item.publicUrl ||
    item.signedUrl ||
    item.thumbnailUrl ||
    item.storageKey ||
    item.thumbnailKey ||
    "";
  if (!possible) return "";
  if (
    possible.startsWith("http") ||
    possible.startsWith("data:") ||
    possible.startsWith("blob:")
  )
    return possible;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  return `${baseUrl}${possible.startsWith("/") ? possible : `/${possible}`}`;
}

export default function ActivityApprovalPanel({
  role,
  schoolId = "TST2",
}: Props) {
  const [pending, setPending] = useState<Activity[]>([]);
  const [published, setPublished] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  const canApprove = role === "ADMIN" || role === "PRINCIPAL";

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [pendingData, feedData] = await Promise.all([
        activityApi.pending(schoolId),
        activityApi.feed(schoolId, 0, 12).catch(() => []),
      ]);
      setPending(pendingData);
      setPublished(feedData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load activity approvals.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [schoolId]);

  async function approve(activityId: string | number) {
    try {
      setBusyId(activityId);
      await activityApi.approve(schoolId, activityId);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to approve activity.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function approveAndPublish(activityId: string | number) {
    try {
      setBusyId(activityId);
      await activityApi.approve(schoolId, activityId);
      await activityApi.publish(schoolId, activityId);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve and publish activity.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function reject(activityId: string | number) {
    const remarks = window.prompt(
      "Enter rejection reason for the teacher:",
      "Please review and resubmit with required corrections.",
    );
    if (!remarks) return;

    try {
      setBusyId(activityId);
      await activityApi.reject(schoolId, activityId, remarks);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reject activity.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const totalMedia = useMemo(
    () =>
      pending.reduce((sum, activity) => sum + mediaStats(activity).total, 0),
    [pending],
  );

  return (
    <div className="approval-page">
      <section className="approval-hero">
        <p className="eyebrow">School Activities & Memories</p>
        <h1>Pending Activity Approvals</h1>
        <p>
          Review teacher-submitted activities, validate visibility and media,
          then approve or publish.
        </p>
      </section>

      <section className="approval-stats">
        <div>
          <strong>{pending.length}</strong>
          <span>Pending approvals</span>
        </div>
        <div>
          <strong>{totalMedia}</strong>
          <span>Media waiting review</span>
        </div>
        <div>
          <strong>{published.length}</strong>
          <span>Published / visible</span>
        </div>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      <section className="approval-section">
        <div className="section-heading">
          <p className="eyebrow">Approval Queue</p>
          <h2>Teacher submitted activities</h2>
        </div>

        {loading ? (
          <div className="empty-card">Loading approvals...</div>
        ) : pending.length === 0 ? (
          <div className="empty-card">
            <strong>No pending activity approvals</strong>
            <span>Teacher-submitted activity requests will appear here.</span>
          </div>
        ) : (
          <div className="approval-grid">
            {pending.map((activity) => {
              const stats = mediaStats(activity);
              const busy = busyId === activity.id;
              return (
                <article className="approval-card" key={activity.id}>
                  <div className="approval-card-top">
                    <span>
                      {formatDate(activity.activityDate || activity.createdAt)}
                    </span>
                    <span className="status-pill">
                      {labelize(activity.approvalStatus)}
                    </span>
                  </div>
                  <h3>{activity.title}</h3>
                  <p>{activity.description || "No description provided."}</p>
                  <div className="media-summary">
                    <strong>{stats.total} item(s)</strong>
                    <span>
                      {stats.photos} Photos • {stats.videos} Video
                    </span>
                  </div>
                  <div className="visibility-pill">
                    {labelize(activity.visibilityType)}
                  </div>
                  {stats.items.length ? (
                    <div className="thumbnail-row">
                      {stats.items.slice(0, 5).map((item, index) => {
                        const src = mediaUrl(item);
                        const isVideo =
                          String(item.mediaType || item.contentType || "")
                            .toUpperCase()
                            .includes("VIDEO") ||
                          String(item.contentType || "").startsWith("video/");
                        return (
                          <div
                            className="thumb"
                            key={item.id || `${activity.id}-${index}`}
                          >
                            {src && !isVideo ? (
                              <img
                                src={src}
                                alt={item.fileName || `Media ${index + 1}`}
                              />
                            ) : (
                              <span>{isVideo ? "🎥" : "🖼️"}</span>
                            )}
                          </div>
                        );
                      })}
                      {stats.items.length > 5 ? (
                        <div className="thumb more">
                          +{stats.items.length - 5}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="approval-actions two-col">
                    <button
                      className="soft-action"
                      onClick={() => setModal({ type: "preview", activity })}
                    >
                      Preview
                    </button>
                    <button
                      className="gold-soft-action"
                      onClick={() => setModal({ type: "media", activity })}
                    >
                      View Media
                    </button>
                    <button
                      className="danger-action"
                      disabled={busy || !canApprove}
                      onClick={() => reject(activity.id)}
                    >
                      Reject
                    </button>
                    <button
                      className="success-action"
                      disabled={busy || !canApprove}
                      onClick={() => approve(activity.id)}
                    >
                      {busy ? "Working..." : "Approve"}
                    </button>
                  </div>
                  <button
                    className="primary-action"
                    disabled={busy || !canApprove}
                    onClick={() => approveAndPublish(activity.id)}
                  >
                    {busy ? "Publishing..." : "Approve & Publish"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {modal ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setModal(null)}>
              ×
            </button>
            {modal.type === "preview" ? (
              <PreviewModal activity={modal.activity} />
            ) : (
              <MediaModal
                activity={modal.activity}
                schoolId={schoolId}
                onChanged={load}
              />
            )}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .approval-page {
          display: grid;
          gap: 24px;
        }

        .approval-hero {
          border-radius: 28px;
          padding: 30px;
          background: linear-gradient(135deg, #081a2f, #102f50);
          color: white;
          box-shadow: 0 22px 60px rgba(8, 26, 47, 0.22);
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #d49b25;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        .approval-hero h1 {
          margin-bottom: 12px;
          font-size: clamp(30px, 4vw, 46px);
          letter-spacing: -0.04em;
        }

        .approval-hero p:not(.eyebrow) {
          margin-bottom: 0;
          max-width: 760px;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.6;
        }

        .approval-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .approval-stats div,
        .approval-card,
        .empty-card,
        .modal-card {
          border: 1px solid rgba(16, 34, 58, 0.08);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 45px rgba(16, 34, 58, 0.08);
        }

        .approval-stats div {
          padding: 20px;
        }

        .approval-stats strong {
          display: block;
          color: #10223a;
          font-size: 32px;
          font-weight: 900;
        }

        .approval-stats span,
        .empty-card span {
          color: #667085;
          font-weight: 800;
        }

        .error-banner {
          border-radius: 18px;
          background: #fff3f3;
          color: #b42318;
          padding: 14px 16px;
          font-weight: 800;
        }

        .section-heading {
          margin-bottom: 16px;
        }

        .section-heading h2 {
          color: #10223a;
          font-size: 26px;
          letter-spacing: -0.03em;
        }

        .approval-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 18px;
        }

        .approval-card {
          display: grid;
          gap: 14px;
          padding: 22px;
        }

        .approval-card-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          color: #667085;
          font-size: 12px;
          font-weight: 900;
        }

        .status-pill {
          border-radius: 999px;
          background: #fff6da;
          color: #946200;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 900;
        }

        .approval-card h3 {
          color: #10223a;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .approval-card p {
          margin-bottom: 0;
          color: #667085;
          line-height: 1.55;
        }

        .media-summary {
          display: grid;
          gap: 4px;
          color: #10223a;
        }

        .media-summary strong {
          font-size: 20px;
          font-weight: 950;
        }

        .media-summary span {
          color: #667085;
          font-weight: 900;
        }

        .visibility-pill {
          width: max-content;
          border: 1px solid rgba(16, 34, 58, 0.1);
          border-radius: 999px;
          background: #f8fafc;
          color: #10223a;
          padding: 10px 14px;
          font-weight: 900;
        }

        .thumbnail-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .thumb {
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 18px;
          background: #edf3f8;
          color: #10223a;
          font-weight: 900;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .approval-actions {
          display: grid;
          gap: 12px;
        }

        .two-col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        button {
          border: 0;
          border-radius: 18px;
          padding: 13px 16px;
          font: inherit;
          font-weight: 950;
          cursor: pointer;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .soft-action {
          background: #eaf2fb;
          color: #0b4f8f;
        }

        .gold-soft-action {
          background: #fff3ce;
          color: #805500;
        }

        .danger-action {
          background: #fdebed;
          color: #a41424;
        }

        .success-action {
          background: #dcf7e7;
          color: #107342;
        }

        .primary-action {
          width: 100%;
          background: #f5bc42;
          color: #10223a;
        }

        .empty-card {
          display: grid;
          gap: 6px;
          padding: 28px;
          color: #667085;
        }

        .empty-card strong {
          color: #10223a;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(4, 13, 26, 0.68);
        }

        .modal-card {
          position: relative;
          width: min(980px, 100%);
          max-height: 84vh;
          overflow: auto;
          padding: 24px;
        }

        .modal-close {
          position: sticky;
          top: 0;
          float: right;
          z-index: 3;
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 999px;
          background: #10223a;
          color: white;
          font-size: 26px;
          line-height: 1;
          box-shadow: 0 12px 24px rgba(16, 34, 58, 0.22);
        }

        @media (max-width: 780px) {
          .approval-stats,
          .two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function PreviewModal({ activity }: { activity: Activity }) {
  const stats = mediaStats(activity);
  return (
    <div className="preview-modal">
      <p className="modal-eyebrow">Activity Preview</p>
      <h2>{activity.title}</h2>
      <p>{activity.description || "No description provided."}</p>
      <div className="modal-grid">
        <div>
          <strong>Date</strong>
          <span>{formatDate(activity.activityDate || activity.createdAt)}</span>
        </div>
        <div>
          <strong>Visibility</strong>
          <span>{labelize(activity.visibilityType)}</span>
        </div>
        <div>
          <strong>Media</strong>
          <span>{stats.total} item(s)</span>
        </div>
        <div>
          <strong>Breakdown</strong>
          <span>
            {stats.photos} Photos • {stats.videos} Video
          </span>
        </div>
      </div>
      <style jsx>{`
        .modal-eyebrow {
          color: #d49b25;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        h2 {
          margin: 0 46px 10px 0;
          color: #10223a;
          font-size: 34px;
          letter-spacing: -0.04em;
        }
        p {
          color: #667085;
          line-height: 1.6;
        }
        .modal-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }
        .modal-grid div {
          display: grid;
          gap: 6px;
          border-radius: 18px;
          background: #f8fafc;
          padding: 16px;
        }
        strong {
          color: #10223a;
        }
        span {
          color: #667085;
          font-weight: 800;
        }
        @media (max-width: 700px) {
          .modal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function MediaModal({
  activity,
  schoolId,
  onChanged,
}: {
  activity: Activity;
  schoolId: string;
  onChanged: () => Promise<void>;
}) {
  const [items, setItems] = useState<ActivityMedia[]>(mediaItems(activity));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [video, setVideo] = useState<ActivityMedia | null>(null);

  const stats = useMemo(() => {
    const photos = items.filter((item) => !isVideoMedia(item)).length;
    const videos = items.filter((item) => isVideoMedia(item)).length;
    return { total: items.length, photos, videos };
  }, [items]);

  async function refreshMedia() {
    const fresh = await activityApi.media(schoolId, activity.id);
    setItems(fresh);
    await onChanged();
  }

  async function addAdminMedia(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    try {
      setBusy(true);
      setMessage("Uploading admin/principal media...");
      await activityApi.uploadMedia(schoolId, activity.id, files);
      await refreshMedia();
      setMessage("Media added for review.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to upload media.",
      );
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function removeMedia(item: ActivityMedia) {
    if (!item.id) return;
    const confirmed = window.confirm(
      `Delete ${item.fileName || "this media item"} from this activity?`,
    );
    if (!confirmed) return;
    try {
      setBusy(true);
      setMessage("Deleting media...");
      await activityApi.deleteMedia(schoolId, activity.id, item.id);
      await refreshMedia();
      if (video?.id === item.id) setVideo(null);
      setMessage("Media deleted from this activity.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to delete media.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="media-modal">
      <p className="modal-eyebrow">Media Review</p>
      <h2>{activity.title}</h2>
      <p>
        {stats.total} item(s) • {stats.photos} Photos • {stats.videos} Video
      </p>

      <div className="admin-media-tools">
        <div>
          <strong>Admin / Principal media controls</strong>
          <span>
            Delete unsuitable teacher media or add approved photos/videos before
            publishing.
          </span>
        </div>
        <label className="upload-button">
          Add Photos / Videos
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={addAdminMedia}
            disabled={busy}
          />
        </label>
      </div>

      {message ? <div className="media-message">{message}</div> : null}

      {items.length === 0 ? (
        <div className="empty-media">No media persisted for this activity.</div>
      ) : (
        <div className="media-grid">
          {items.map((item, index) => {
            const src = mediaUrl(item);
            const isVideo = isVideoMedia(item);
            return (
              <div className="media-tile" key={item.id || index}>
                <button
                  className={`media-preview ${isVideo ? "clickable-video" : ""}`}
                  onClick={() => (isVideo ? setVideo(item) : undefined)}
                  title={
                    isVideo ? "Open video preview" : item.fileName || "Photo"
                  }
                  type="button"
                >
                  {src && !isVideo ? (
                    <img
                      src={src}
                      alt={item.fileName || `Media ${index + 1}`}
                    />
                  ) : (
                    <span>{isVideo ? "🎥" : "🖼️"}</span>
                  )}
                  {isVideo ? <em>Tap to play</em> : null}
                </button>
                <strong>{item.fileName || `Media ${index + 1}`}</strong>
                <small>{isVideo ? "Video" : "Photo"}</small>
                <button
                  className="delete-media"
                  disabled={busy || !item.id}
                  onClick={() => removeMedia(item)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {video ? (
        <div className="video-backdrop" role="dialog" aria-modal="true">
          <div className="video-card">
            <button
              className="video-close"
              onClick={() => setVideo(null)}
              type="button"
            >
              ×
            </button>
            <p className="modal-eyebrow">Video Preview</p>
            <h3>{video.fileName || "Activity video"}</h3>
            <video controls autoPlay src={mediaUrl(video)} />
            <div className="video-actions">
              <button
                className="soft-action"
                onClick={() => setVideo(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="danger-action"
                disabled={busy || !video.id}
                onClick={() => removeMedia(video)}
                type="button"
              >
                Delete Video
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .modal-eyebrow {
          color: #d49b25;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        h2 {
          margin: 0 58px 8px 0;
          color: #10223a;
          font-size: 34px;
          letter-spacing: -0.04em;
        }
        h3 {
          margin: 0 56px 12px 0;
          color: #10223a;
          font-size: 24px;
        }
        p {
          color: #667085;
          font-weight: 900;
        }
        .admin-media-tools {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          border-radius: 22px;
          background: #f8fafc;
          padding: 16px;
          margin: 16px 0;
        }
        .admin-media-tools div {
          display: grid;
          gap: 4px;
        }
        .admin-media-tools strong {
          color: #10223a;
        }
        .admin-media-tools span {
          color: #667085;
          font-weight: 800;
        }
        .upload-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 178px;
          border-radius: 18px;
          background: #f5bc42;
          color: #10223a;
          padding: 13px 16px;
          font-weight: 950;
          cursor: pointer;
        }
        .upload-button input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .media-message {
          border-radius: 16px;
          background: #eef7ff;
          color: #0b4f8f;
          padding: 12px 14px;
          font-weight: 900;
          margin-bottom: 14px;
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }
        .media-tile {
          display: grid;
          gap: 8px;
          border-radius: 22px;
          background: #f8fafc;
          padding: 12px;
        }
        .media-preview {
          position: relative;
          width: 100%;
          min-height: 150px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 18px;
          background: #edf3f8;
          color: #10223a;
          font-size: 42px;
          padding: 0;
        }
        .media-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-preview em {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 10px;
          border-radius: 999px;
          background: rgba(16, 34, 58, 0.82);
          color: #fff;
          font-size: 12px;
          font-style: normal;
          font-weight: 900;
          padding: 6px 10px;
        }
        .clickable-video {
          cursor: pointer;
        }
        strong {
          color: #10223a;
          overflow-wrap: anywhere;
        }
        small {
          color: #667085;
          font-weight: 900;
        }
        .delete-media {
          background: #fdebed;
          color: #a41424;
          padding: 10px 12px;
          border-radius: 14px;
        }
        .empty-media {
          border-radius: 18px;
          background: #f8fafc;
          color: #667085;
          padding: 18px;
          font-weight: 900;
        }
        .video-backdrop {
          position: fixed;
          inset: 0;
          z-index: 140;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(4, 13, 26, 0.76);
        }
        .video-card {
          position: relative;
          width: min(860px, 100%);
          border-radius: 28px;
          background: white;
          padding: 22px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
        }
        .video-card video {
          width: 100%;
          max-height: 60vh;
          border-radius: 20px;
          background: #000;
        }
        .video-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 999px;
          background: #10223a;
          color: white;
          font-size: 26px;
          line-height: 1;
        }
        .video-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 14px;
        }
        .soft-action {
          background: #eaf2fb;
          color: #0b4f8f;
        }
        .danger-action {
          background: #fdebed;
          color: #a41424;
        }
        @media (max-width: 700px) {
          .admin-media-tools,
          .video-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

function isVideoMedia(item: ActivityMedia) {
  return (
    String(item.mediaType || item.contentType || "")
      .toUpperCase()
      .includes("VIDEO") || String(item.contentType || "").startsWith("video/")
  );
}
