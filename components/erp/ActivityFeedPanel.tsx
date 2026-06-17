"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  activityApi,
  type Activity,
  type ActivityMedia,
} from "@/lib/activityApi";

type Props = {
  role: "ADMIN" | "PRINCIPAL" | "TEACHER" | "STUDENT" | "PARENT";
  schoolId?: string;
};

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
function statusLabel(value?: string) {
  return (value || "PUBLISHED").replace(/_/g, " ");
}
function getMediaItems(activity?: Activity | null): ActivityMedia[] {
  const media =
    activity?.mediaList || activity?.media || activity?.mediaItems || [];
  return Array.isArray(media) ? media : [];
}
function isVideo(item: ActivityMedia) {
  return (
    String(item.mediaType || "").toUpperCase() === "VIDEO" ||
    String(item.contentType || "")
      .toLowerCase()
      .startsWith("video/")
  );
}
function mediaUrl(item: ActivityMedia) {
  const raw =
    item.url ||
    item.mediaUrl ||
    item.publicUrl ||
    item.signedUrl ||
    item.thumbnailUrl;
  if (!raw) return "";
  return raw.startsWith("http")
    ? raw
    : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}${raw}`;
}
function mediaSummary(activity?: Activity | null) {
  const media = getMediaItems(activity);
  const photos = Number(
    activity?.photoCount ?? media.filter((item) => !isVideo(item)).length,
  );
  const videos = Number(activity?.videoCount ?? media.filter(isVideo).length);
  const total = Number(
    activity?.mediaCount ?? (photos + videos || media.length),
  );
  return { total, photos, videos, media };
}
function visibilityLabel(value?: string) {
  return (value || "WHOLE_SCHOOL").replace(/_/g, " ");
}

export default function ActivityFeedPanel({ role, schoolId = "TST2" }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pending, setPending] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [expandedMediaId, setExpandedMediaId] = useState<
    string | number | null
  >(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [selectedGallery, setSelectedGallery] = useState<Activity | null>(null);
  const [showAllFeed, setShowAllFeed] = useState(false);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxActivity, setLightboxActivity] = useState<Activity | null>(
    null,
  );
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [error, setError] = useState("");

  const canCreate =
    role === "ADMIN" || role === "PRINCIPAL" || role === "TEACHER";
  const canApprove = role === "ADMIN" || role === "PRINCIPAL";

  const heroPillStyle: CSSProperties = {
  height: 42,
  minWidth: 118,
  padding: "0 20px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 14,
  lineHeight: 1,
  textDecoration: "none",
  whiteSpace: "nowrap",
  border: "1px solid rgba(255,255,255,.28)",
  background: "rgba(255,255,255,.12)",
  color: "#fff",
};

const heroGoldPillStyle: CSSProperties = {
  ...heroPillStyle,
  minWidth: 130,
  background: "linear-gradient(135deg, #f5bc42, #ffd76a)",
  color: "#10223a",
  borderColor: "rgba(255,255,255,.38)",
  boxShadow: "0 14px 34px rgba(245,188,66,.28)",
};

  async function hydrateMedia(list: Activity[]) {
    return Promise.all(
      list.map(async (activity) => {
        if (mediaSummary(activity).media.length) return activity;
        try {
          const media = await activityApi.media(schoolId, activity.id);
          return {
            ...activity,
            media,
            mediaList: media,
            mediaItems: media,
          } as Activity;
        } catch {
          return activity;
        }
      }),
    );
  }

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [feedData, pendingData] = await Promise.all([
        activityApi.feed(schoolId, 0, 30),
        canApprove
          ? activityApi.pending(schoolId).catch(() => [])
          : Promise.resolve([]),
      ]);
      setActivities(await hydrateMedia(feedData));
      setPending(pendingData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load school activities.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [schoolId, canApprove]);

  async function approveOnly(activityId: string | number) {
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
  async function rejectActivity(activityId: string | number) {
    try {
      setBusyId(activityId);
      await activityApi.reject(
        schoolId,
        activityId,
        "Rejected from web approval dashboard.",
      );
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reject activity.",
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
        err instanceof Error ? err.message : "Unable to approve activity.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const timelineYears = useMemo(() => {
    const years = new Set<string>();
    activities.forEach((activity) => {
      const date = new Date(activity.activityDate || activity.createdAt || "");
      years.add(
        Number.isNaN(date.getTime()) ? "Timeline" : String(date.getFullYear()),
      );
    });
    return Array.from(years);
  }, [activities]);

  const feedCards = showAllFeed ? activities : activities.slice(0, 5);
  const galleryCards = showAllGallery ? activities : activities.slice(0, 5);

  const MediaCarousel = ({
    activity,
    index,
    setIndex,
  }: {
    activity: Activity;
    index: number;
    setIndex: (value: number | ((current: number) => number)) => void;
  }) => {
    const summary = mediaSummary(activity);
    if (!summary.media.length)
      return (
        <div className="empty-card compact-empty">No media uploaded yet.</div>
      );
    const safeIndex = Math.max(0, Math.min(index, summary.media.length - 1));
    const item = summary.media[safeIndex];
    const url = mediaUrl(item);
    const video = isVideo(item);
    const previous = () =>
      setIndex((current) =>
        current <= 0 ? summary.media.length - 1 : current - 1,
      );
    const next = () =>
      setIndex((current) =>
        current >= summary.media.length - 1 ? 0 : current + 1,
      );
    const arrowStyle: CSSProperties = {
      width: 46,
      height: 46,
      borderRadius: 999,
      border: 0,
      background: summary.media.length <= 1 ? "#9AA4B2" : "#10223a",
      color: "#fff",
      fontSize: 22,
      fontWeight: 900,
      display: "grid",
      placeItems: "center",
      cursor: summary.media.length <= 1 ? "not-allowed" : "pointer",
      flex: "0 0 auto",
    };
    const mediaNode = url && video ? (
      <video
        src={url}
        controls
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          display: "block",
          background: "#eef4f9",
        }}
      />
    ) : url ? (
      <img
        src={url}
        alt={item.fileName || "Activity media"}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          display: "block",
          background: "#eef4f9",
        }}
      />
    ) : (
      <span style={{ fontSize: 48 }}>{video ? "🎥" : "📷"}</span>
    );
    return (
      <div
        className="media-lightbox-carousel"
        style={{
          display: "grid",
          gap: 12,
          width: "100%",
          margin: "8px auto 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            width: "100%",
          }}
        >
          <button
            type="button"
            style={arrowStyle}
            onClick={previous}
            aria-label="Previous media"
            disabled={summary.media.length <= 1}
          >
            ◀
          </button>
          <div
            className="media-lightbox-stage"
            style={{
              width: "min(420px, 62vw)",
              height: "260px",
              maxWidth: "420px",
              maxHeight: "260px",
              borderRadius: 18,
              background: "#eef4f9",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              flex: "0 1 420px",
            }}
          >
            {mediaNode}
          </div>
          <button
            type="button"
            style={arrowStyle}
            onClick={next}
            aria-label="Next media"
            disabled={summary.media.length <= 1}
          >
            ▶
          </button>
        </div>
        <div className="media-lightbox-caption" style={{ textAlign: "center" }}>
          <strong>
            {item.fileName || `${video ? "Video" : "Photo"} ${safeIndex + 1}`}
          </strong>
          <small style={{ display: "block", color: "#667085", fontWeight: 800 }}>
            {safeIndex + 1} of {summary.media.length} •{" "}
            {video ? "Video" : "Photo"}
          </small>
        </div>
      </div>
    );
  };

  const MediaIconGrid = ({
    activity,
    source,
  }: {
    activity: Activity;
    source: "feed" | "gallery" | "approval";
  }) => {
    const summary = mediaSummary(activity);
    if (!summary.media.length)
      return (
        <div className="empty-card compact-empty">No media uploaded yet.</div>
      );
    return (
      <div className="media-icon-grid vs-media-thumb-wall" aria-label="Activity media thumbnails" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 18, marginTop: 16 }}>
        {summary.media.map((item, idx) => {
          const url = mediaUrl(item);
          const video = isVideo(item);
          return (
            <button
              type="button"
              className="media-icon-tile vs-media-thumb-tile" style={{ border: 0, background: "transparent", textAlign: "center", cursor: "pointer", padding: 8, borderRadius: 14, display: "grid", gap: 6, justifyItems: "center", minHeight: 150 }}
              key={`${source}-${activity.id}-${idx}-${item.id || item.fileName || idx}`}
              onClick={() => {
                setLightboxActivity(activity);
                setLightboxIndex(idx);
              }}
            >
              <div className="media-icon-preview vs-media-thumb-box" style={{ width: 104, height: 92, borderRadius: 10, background: "#eef4f9", display: "grid", placeItems: "center", overflow: "hidden", position: "relative", border: "1px solid rgba(16,34,58,.08)" }}>
                {url && video ? (
                  <video src={url} muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : url ? (
                  <img src={url} alt={item.fileName || "Activity media"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span>{video ? "🎥" : "📷"}</span>
                )}
                {video ? <em>▶</em> : null}
              </div>
              <strong>
                {item.fileName || `${video ? "Video" : "Photo"} ${idx + 1}`}
              </strong>
              <small>{video ? "Video" : "Photo"}</small>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="activity-page">
      <section className="activity-hero">
        <div>
          <p className="eyebrow">School Activities & Memories</p>
          <h1>School Activity Feed</h1>
          <p>
            Share celebrations, classroom events, achievements and school
            memories with tenant-safe visibility for students and parents.
          </p>
        </div>
        <nav className="activity-actions" aria-label="Activities shortcuts">
          <a
  className="activity-hero-pill"
  style={heroPillStyle}
  href="#gallery"
>
            Gallery
          </a>
          <a
  className="activity-hero-pill"
  style={heroPillStyle}
  href="#memories"
>
            Memories
          </a>
          {canCreate ? (
            <Link
  className="activity-hero-pill activity-hero-pill-gold"
  style={heroGoldPillStyle}
  href="/school-activities/create"
  aria-label="Create new activity"
>
              Create New
            </Link>
          ) : null}
        </nav>
      </section>
      <section className="activity-stats">
        <div>
          <strong>{activities.length}</strong>
          <span>Published / visible</span>
        </div>
        <div>
          <strong>{pending.length}</strong>
          <span>Pending approvals</span>
        </div>
        <div>
          <strong>{timelineYears.length}</strong>
          <span>Timeline years</span>
        </div>
      </section>
      {error ? <div className="error-banner">{error}</div> : null}

      {canApprove && pending.length > 0 ? (
        <section className="activity-section">
          <div className="section-heading">
            <p className="eyebrow">Approval Queue</p>
            <h2>Teacher submitted activities</h2>
          </div>
          <div className="activity-grid">
            {pending.map((activity) => {
              const summary = mediaSummary(activity);
              const expanded = expandedMediaId === activity.id;
              return (
                <article
                  className="activity-card approval-card"
                  key={`pending-${activity.id}`}
                >
                  <div className="activity-card-media">
                    {summary.photos ? "📸" : summary.videos ? "🎥" : "📝"}
                  </div>
                  <div className="activity-card-body">
                    <div className="meta-row">
                      <span>{formatDate(activity.activityDate)}</span>
                      <span className="status-pill warning">
                        {statusLabel(activity.approvalStatus)}
                      </span>
                    </div>
                    <h3>{activity.title}</h3>
                    <p>{activity.description || "No description provided."}</p>
                    <div className="approval-metrics">
                      <strong>{summary.total} item(s)</strong>
                      <span>
                        {summary.photos} Photos • {summary.videos} Video
                      </span>
                      <span>
                        Visibility: {visibilityLabel(activity.visibilityType)}
                      </span>
                    </div>
                    <div className="approval-actions">
                      <button
                        className="secondary-action compact"
                        type="button"
                        onClick={() => {
                          setPreviewIndex(0);
                          setSelectedActivity(activity);
                        }}
                      >
                        Preview
                      </button>
                      <button
                        className="secondary-action compact"
                        type="button"
                        onClick={() =>
                          setExpandedMediaId(expanded ? null : activity.id)
                        }
                      >
                        View Media
                      </button>
                      <button
                        className="danger-action compact"
                        disabled={busyId === activity.id}
                        onClick={() => rejectActivity(activity.id)}
                      >
                        Reject
                      </button>
                      <button
                        className="success-action compact"
                        disabled={busyId === activity.id}
                        onClick={() => approveOnly(activity.id)}
                      >
                        Approve
                      </button>
                    </div>
                    {expanded ? (
                      <MediaIconGrid activity={activity} source="approval" />
                    ) : null}
                    <button
                      className="primary-action full"
                      disabled={busyId === activity.id}
                      onClick={() => approveAndPublish(activity.id)}
                    >
                      {busyId === activity.id
                        ? "Approving..."
                        : "Approve & Publish"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="activity-section">
        <div className="section-heading">
          <p className="eyebrow">Latest Feed</p>
          <h2>Recent school memories</h2>
        </div>
        {loading ? (
          <div className="empty-card">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="empty-card">
            <strong>No activities yet</strong>
            <span>
              Published activities will appear here for students and parents.
            </span>
          </div>
        ) : (
          <>
            <div className="activity-grid compact-grid">
              {feedCards.map((activity) => {
                const summary = mediaSummary(activity);
                return (
                  <button
                    className="activity-card compact-card clickable-card"
                    type="button"
                    key={activity.id}
                    onClick={() => {
                      setPreviewIndex(0);
                      setSelectedActivity(activity);
                    }}
                  >
                    <div className="activity-card-media compact-media">📸</div>
                    <div className="activity-card-body">
                      <div className="meta-row">
                        <span>{formatDate(activity.activityDate)}</span>
                        <span className="status-pill">
                          {statusLabel(activity.approvalStatus)}
                        </span>
                      </div>
                      <h3>{activity.title}</h3>
                      <p>{activity.description || "School activity update."}</p>
                      <div className="activity-metrics">
                        <span>👁 {activity.viewCount || 0} views</span>
                        <span>❤️ {activity.likeCount || 0} likes</span>
                        <span>🖼 {summary.total} media</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {activities.length > 5 ? (
              <button
                className="view-more"
                onClick={() => setShowAllFeed((v) => !v)}
              >
                {showAllFeed ? "Show Less" : "View More"}
              </button>
            ) : null}
          </>
        )}
      </section>

      <section className="activity-section" id="gallery">
        <div className="section-heading">
          <p className="eyebrow">Gallery</p>
          <h2>Photos and videos</h2>
        </div>
        <div className="gallery-grid compact-grid">
          {galleryCards.map((activity) => {
            const summary = mediaSummary(activity);
            return (
              <button
                className="gallery-tile compact-card clickable-card"
                type="button"
                key={`gallery-${activity.id}`}
                onClick={() => {
                  setGalleryIndex(0);
                  setSelectedGallery(activity);
                }}
              >
                <span>🖼️</span>
                <strong>{activity.title}</strong>
                <small>{summary.total} media files</small>
              </button>
            );
          })}
          {!activities.length ? (
            <div className="empty-card">
              Gallery will populate after activities are published.
            </div>
          ) : null}
        </div>
        {activities.length > 5 ? (
          <button
            className="view-more"
            onClick={() => setShowAllGallery((v) => !v)}
          >
            {showAllGallery ? "Show Less" : "View More"}
          </button>
        ) : null}
      </section>

      <section className="activity-section" id="memories">
        <div className="section-heading">
          <p className="eyebrow">School Memories</p>
          <h2>Timeline</h2>
        </div>
        <div className="timeline-card">
          {timelineYears.length ? (
            timelineYears.map((year) => <span key={year}>{year}</span>)
          ) : (
            <p>No timeline entries yet.</p>
          )}
        </div>
      </section>

      {selectedActivity ? (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedActivity(null)}
        >
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedActivity(null)}
            >
              ×
            </button>
            <p className="eyebrow">Activity Preview</p>
            <h2>{selectedActivity.title}</h2>
            <p className="detail-date">
              {formatDate(selectedActivity.activityDate)} •{" "}
              {statusLabel(selectedActivity.approvalStatus)}
            </p>
            <p>{selectedActivity.description || "No description provided."}</p>
            <div className="detail-metrics">
              <span>👁 {selectedActivity.viewCount || 0} views</span>
              <span>❤️ {selectedActivity.likeCount || 0} likes</span>
              <span>🖼 {mediaSummary(selectedActivity).total} media</span>
              <span>
                Visibility: {visibilityLabel(selectedActivity.visibilityType)}
              </span>
            </div>
            <MediaIconGrid activity={selectedActivity} source="feed" />
          </div>
        </div>
      ) : null}
      {selectedGallery ? (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedGallery(null)}
        >
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedGallery(null)}
            >
              ×
            </button>
            <p className="eyebrow">Gallery Media</p>
            <h2>{selectedGallery.title}</h2>
            <p className="detail-date">
              {mediaSummary(selectedGallery).total} media files
            </p>
            <MediaIconGrid activity={selectedGallery} source="gallery" />
          </div>
        </div>
      ) : null}
      {lightboxActivity ? (
        <div
          className="modal-backdrop media-viewer-backdrop"
          onClick={() => setLightboxActivity(null)}
        >
          <div
            className="media-viewer-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "white",
              borderRadius: 24,
              padding: 24,
              width: "min(680px, 86vw)",
              maxHeight: "84vh",
              overflowY: "auto",
              overflowX: "hidden",
              boxShadow: "0 30px 90px rgba(0,0,0,.28)",
            }}
          >
            <button
              className="modal-close"
              onClick={() => setLightboxActivity(null)}
            >
              ×
            </button>
            <MediaCarousel
              activity={lightboxActivity}
              index={lightboxIndex}
              setIndex={setLightboxIndex}
            />
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .activity-page {
          display: grid;
          gap: 22px;
        }
        .activity-hero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-end;
          border-radius: 28px;
          padding: 28px;
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
        h3 {
          margin: 0;
        }
        .activity-hero h1 {
          font-size: clamp(28px, 4vw, 44px);
          letter-spacing: -0.04em;
        }
        .activity-hero p:not(.eyebrow) {
          max-width: 720px;
          margin: 12px 0 0;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.6;
        }
        .activity-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  align-self: flex-start;
  min-width: 390px;
}
        .activity-actions > a {
          height: 42px !important;
          min-width: 118px !important;
          padding: 0 20px !important;
          border-radius: 999px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-decoration: none !important;
          font-weight: 900 !important;
        }
        .activity-hero-pill,
        .primary-action,
        .secondary-action {
          min-height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          line-height: 1;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background-color 0.18s ease,
            border-color 0.18s ease;
        }
        .activity-hero-pill {
          min-width: 118px;
          background: rgba(255, 255, 255, 0.12);
          color: white;
          box-shadow: 0 10px 26px rgba(8, 18, 32, 0.14);
        }
        .activity-hero-pill:hover,
        .primary-action:hover,
        .secondary-action:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.18);
          box-shadow: 0 16px 36px rgba(8, 18, 32, 0.2);
        }
        .activity-hero-pill-gold,
        .primary-action {
          background: linear-gradient(135deg, #f5bc42, #ffd76a);
          color: #10223a;
          border-color: rgba(255, 255, 255, 0.38);
          box-shadow: 0 14px 34px rgba(245, 188, 66, 0.28);
        }
        .activity-hero-pill-gold:hover,
        .primary-action:hover {
          background: linear-gradient(135deg, #f5bc42, #ffe08a);
          box-shadow: 0 18px 42px rgba(245, 188, 66, 0.36);
        }
        .secondary-action {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }
        .primary-action.full {
          width: 100%;
          margin-top: 14px;
        }
        .activity-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .activity-stats div,
        .activity-card,
        .empty-card,
        .timeline-card,
        .gallery-tile {
          border: 1px solid rgba(16, 34, 58, 0.08);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 14px 34px rgba(16, 34, 58, 0.07);
        }
        .activity-stats div {
          padding: 16px 18px;
          min-height: 92px;
        }
        .activity-stats strong {
          display: block;
          color: #10223a;
          font-size: 26px;
          font-weight: 900;
        }
        .activity-stats span {
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
          margin-bottom: 14px;
        }
        .section-heading h2 {
          color: #10223a;
          font-size: 24px;
          letter-spacing: -0.03em;
        }
        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .compact-grid {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 14px;
        }
        .activity-card {
          overflow: hidden;
          text-align: left;
        }
        .clickable-card {
          border: 0;
          cursor: pointer;
          font: inherit;
        }
        .clickable-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 38px rgba(16, 34, 58, 0.12);
        }
        .activity-card-media {
          min-height: 130px;
          display: grid;
          place-items: center;
          background: #edf3f8;
          font-size: 38px;
        }
        .compact-media {
          min-height: 86px;
          font-size: 30px;
        }
        .activity-card-body {
          padding: 14px;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          color: #667085;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .status-pill {
          border-radius: 999px;
          background: #e8f7ef;
          color: #157347;
          padding: 4px 9px;
          font-size: 11px;
          font-weight: 900;
        }
        .status-pill.warning {
          background: #fff6da;
          color: #946200;
        }
        .activity-card h3 {
          color: #10223a;
          font-size: 18px;
          letter-spacing: -0.02em;
        }
        .activity-card p {
          color: #667085;
          line-height: 1.45;
          margin: 6px 0 0;
        }
        .activity-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          color: #667085;
          font-size: 12px;
          font-weight: 800;
          margin-top: 10px;
        }
        .empty-card {
          display: grid;
          gap: 6px;
          padding: 24px;
          color: #667085;
        }
        .empty-card strong {
          color: #10223a;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .gallery-tile {
          min-height: 118px;
          padding: 16px;
          display: grid;
          align-content: end;
          gap: 6px;
          text-align: left;
        }
        .gallery-tile span {
          font-size: 30px;
        }
        .gallery-tile strong {
          color: #10223a;
        }
        .gallery-tile small {
          color: #667085;
          font-weight: 800;
        }
        .timeline-card {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 18px;
        }
        .timeline-card span {
          background: #10223a;
          color: white;
          border-radius: 999px;
          padding: 8px 12px;
          font-weight: 900;
        }
        .approval-actions {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }
        .compact {
          padding: 10px 12px;
        }
        .danger-action,
        .success-action {
          border: 0;
          border-radius: 999px;
          padding: 10px 12px;
          font-weight: 900;
          cursor: pointer;
        }
        .danger-action {
          background: #fdecec;
          color: #b42318;
        }
        .success-action {
          background: #dff7ea;
          color: #157347;
        }
        .approval-metrics {
          display: grid;
          gap: 4px;
          margin-top: 10px;
          color: #667085;
          font-weight: 800;
        }
        .approval-metrics strong {
          color: #10223a;
        }
        .media-carousel {
          width: min(380px, 48vw);
          max-width: 100%;
          margin: 14px auto 0;
          display: grid;
          gap: 10px;
        }
        .media-stage {
          width: 100%;
          height: 190px;
          border-radius: 18px;
          background: #eaf1f8;
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .media-stage img,
        .media-stage video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #eaf1f8;
        }
        .media-stage span {
          font-size: 42px;
        }
        .media-carousel-footer {
          display: grid;
          grid-template-columns: 44px 1fr 44px;
          gap: 10px;
          align-items: center;
        }
        .media-carousel-footer strong {
          display: block;
          color: #10223a;
          font-size: 15px;
        }
        .media-carousel-footer small {
          display: block;
          color: #667085;
          font-weight: 800;
          margin-top: 3px;
        }
        .carousel-button {
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 999px;
          background: #10223a;
          color: white;
          font-size: 28px;
          font-weight: 900;
          cursor: pointer;
        }
        .view-more {
          justify-self: start;
          margin-top: 14px;
          border: 0;
          border-radius: 999px;
          background: #10223a;
          color: white;
          font-weight: 900;
          padding: 11px 18px;
          cursor: pointer;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(8, 18, 32, 0.68);
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 24px;
        }
        .detail-modal {
          position: relative;
          max-width: 820px;
          width: min(820px, 90vw);
          max-height: 82vh;
          overflow: hidden;
          border-radius: 26px;
          background: white;
          padding: 22px;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
        }
        .modal-close {
          position: sticky;
          top: 0;
          float: right;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 999px;
          background: #10223a;
          color: white;
          font-size: 24px;
          font-weight: 900;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .detail-modal h2 {
          color: #10223a;
          font-size: 30px;
        }
        .detail-modal p {
          color: #475467;
          line-height: 1.55;
        }
        .detail-date {
          font-weight: 900;
        }
        .detail-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 12px 0;
          color: #667085;
          font-weight: 900;
        }
        .detail-metrics span {
          background: #f8fafc;
          border-radius: 999px;
          padding: 8px 12px;
        }
        @media (max-width: 760px) {
          .activity-hero {
            display: grid;
          }
          .activity-actions {
            justify-content: flex-start;
            align-self: auto;
            min-width: 0;
            margin-top: 0;
          }
          .activity-hero-pill-gold {
            min-width: 140px;
          }
          .activity-stats {
            grid-template-columns: 1fr;
          }
          .approval-actions {
            grid-template-columns: 1fr 1fr;
          }
          .activity-grid,
          .gallery-grid {
            grid-template-columns: 1fr;
          }
          .detail-modal {
            width: 92vw;
            padding: 18px;
          }
          .media-carousel {
            width: 78%;
          }
          .media-stage {
            height: 170px;
          }
        }

        .media-carousel {
          width: min(330px, 52%) !important;
          max-width: 330px !important;
          margin: 12px auto 0 !important;
          display: grid;
          gap: 8px;
        }
        .media-stage {
          height: 150px !important;
          max-height: 150px !important;
          position: relative !important;
          border-radius: 16px !important;
          background: #eaf1f8 !important;
          display: grid !important;
          place-items: center !important;
          overflow: hidden !important;
        }
        .media-stage img,
        .media-stage video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          background: #eaf1f8 !important;
        }
        .media-carousel-caption {
          text-align: center;
          color: #10223a;
        }
        .media-carousel-caption strong {
          display: block;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .media-carousel-caption small {
          display: block;
          color: #667085;
          font-size: 12px;
          font-weight: 800;
          margin-top: 2px;
        }
        .carousel-button {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 2 !important;
          width: 34px !important;
          height: 34px !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: #10223a !important;
          color: white !important;
          font-size: 24px !important;
          font-weight: 900 !important;
          cursor: pointer !important;
          display: grid !important;
          place-items: center !important;
          line-height: 1 !important;
        }
        .carousel-button-left {
          left: 8px !important;
        }
        .carousel-button-right {
          right: 8px !important;
        }
        .media-carousel-footer {
          display: none !important;
        }
        .detail-modal {
          overflow: hidden !important;
          max-width: 760px !important;
        }
        .detail-modal .media-carousel {
          width: min(330px, 52%) !important;
        }
        .detail-modal .media-stage {
          height: 150px !important;
        }
        @media (max-width: 760px) {
          .media-carousel,
          .detail-modal .media-carousel {
            width: 72% !important;
            max-width: 300px !important;
          }
          .media-stage,
          .detail-modal .media-stage {
            height: 140px !important;
          }
        }

        /* Windows-downloads style media icons + click-to-preview lightbox */
        .detail-modal {
          max-height: 82vh !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          max-width: 820px !important;
          width: min(820px, 90vw) !important;
        }
        .media-icon-grid {
          display: grid !important;
          grid-template-columns: repeat(
            auto-fill,
            minmax(118px, 1fr)
          ) !important;
          gap: 18px !important;
          margin-top: 16px !important;
          align-items: start !important;
        }
        .media-icon-tile {
          border: 0 !important;
          background: transparent !important;
          text-align: center !important;
          cursor: pointer !important;
          padding: 8px !important;
          border-radius: 14px !important;
          font: inherit !important;
          color: #10223a !important;
          display: grid !important;
          gap: 6px !important;
          justify-items: center !important;
          min-height: 150px !important;
        }
        .media-icon-tile:hover {
          background: #f1f5f9 !important;
          box-shadow: inset 0 0 0 1px rgba(16, 34, 58, 0.08) !important;
        }
        .media-icon-preview {
          width: 104px !important;
          height: 92px !important;
          border-radius: 10px !important;
          background: #eef4f9 !important;
          display: grid !important;
          place-items: center !important;
          overflow: hidden !important;
          position: relative !important;
          border: 1px solid rgba(16, 34, 58, 0.08) !important;
        }
        .media-icon-preview img,
        .media-icon-preview video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          background: #eef4f9 !important;
        }
        .media-icon-preview span {
          font-size: 34px !important;
        }
        .media-icon-preview em {
          position: absolute !important;
          right: 6px !important;
          bottom: 6px !important;
          background: #10223a !important;
          color: white !important;
          border-radius: 999px !important;
          width: 26px !important;
          height: 26px !important;
          display: grid !important;
          place-items: center !important;
          font-style: normal !important;
          font-size: 12px !important;
        }
        .media-icon-tile strong {
          font-size: 12px !important;
          font-weight: 900 !important;
          line-height: 1.2 !important;
          max-width: 112px !important;
          white-space: normal !important;
          overflow: hidden !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
        }
        .media-icon-tile small {
          color: #667085 !important;
          font-size: 11px !important;
          font-weight: 800 !important;
        }
        .media-viewer-backdrop {
          z-index: 1100 !important;
        }
        .media-viewer-modal {
          position: relative;
          background: white !important;
          border-radius: 24px !important;
          padding: 24px !important;
          width: min(720px, 86vw) !important;
          max-height: 84vh !important;
          overflow-y: auto !important;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28) !important;
        }
        .media-lightbox-carousel {
          display: grid !important;
          grid-template-columns: 48px minmax(220px, 1fr) 48px !important;
          grid-template-areas: "left stage right" "caption caption caption" !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 14px !important;
          margin: 34px auto 0 !important;
          width: 100% !important;
        }
        .media-lightbox-stage {
          grid-area: stage !important;
          width: 100% !important;
          max-width: 520px !important;
          height: 330px !important;
          border-radius: 18px !important;
          background: #eef4f9 !important;
          display: grid !important;
          place-items: center !important;
          overflow: hidden !important;
          margin: 0 auto !important;
        }
        .media-lightbox-stage img,
        .media-lightbox-stage video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          background: #eef4f9 !important;
        }
        .media-lightbox-stage span {
          font-size: 54px !important;
        }
        .media-lightbox-arrow {
          width: 46px !important;
          height: 46px !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: #10223a !important;
          color: white !important;
          font-size: 20px !important;
          font-weight: 900 !important;
          display: grid !important;
          place-items: center !important;
          cursor: pointer !important;
        }
        .media-lightbox-arrow:first-child {
          grid-area: left !important;
        }
        .media-lightbox-arrow:nth-child(3) {
          grid-area: right !important;
        }
        .media-lightbox-arrow:disabled {
          opacity: 0.35 !important;
          cursor: not-allowed !important;
        }
        .media-lightbox-caption {
          grid-area: caption !important;
          text-align: center !important;
          color: #10223a !important;
        }
        .media-lightbox-caption strong {
          display: block !important;
          font-size: 14px !important;
          font-weight: 900 !important;
        }
        .media-lightbox-caption small {
          display: block !important;
          color: #667085 !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          margin-top: 3px !important;
        }
        @media (max-width: 760px) {
          .media-icon-grid {
            grid-template-columns: repeat(
              auto-fill,
              minmax(96px, 1fr)
            ) !important;
            gap: 12px !important;
          }
          .media-icon-preview {
            width: 86px !important;
            height: 76px !important;
          }
          .media-icon-tile {
            min-height: 128px !important;
          }
          .media-viewer-modal {
            width: 92vw !important;
            padding: 18px !important;
          }
          .media-lightbox-carousel {
            grid-template-columns: 38px minmax(160px, 1fr) 38px !important;
            gap: 8px !important;
          }
          .media-lightbox-stage {
            height: 240px !important;
          }
          .media-lightbox-arrow {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
          }
        }

        /* final explicit lightbox: icon grid first, fit selected media in box with side arrows */
        .media-viewer-modal .media-lightbox-carousel {
          width: 100% !important;
          max-width: none !important;
        }
        .media-viewer-modal .media-lightbox-stage {
          width: min(420px, 62vw) !important;
          height: 260px !important;
          max-width: 420px !important;
          max-height: 260px !important;
          overflow: hidden !important;
        }
        .media-viewer-modal .media-lightbox-stage img,
        .media-viewer-modal .media-lightbox-stage video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          display: block !important;
        }
        @media (max-width: 760px) {
          .media-viewer-modal .media-lightbox-stage {
            width: min(260px, 58vw) !important;
            height: 190px !important;
          }
        }
      `}</style>
    </div>
  );
}
