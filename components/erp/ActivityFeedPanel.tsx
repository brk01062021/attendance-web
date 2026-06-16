'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { activityApi, type Activity } from '@/lib/activityApi';

type Props = {
  role: 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';
  schoolId?: string;
};

function formatDate(value?: string) {
  if (!value) return 'Date not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusLabel(value?: string) {
  return (value || 'PUBLISHED').replace(/_/g, ' ');
}

function mediaCount(activity: Activity) {
  return activity.media?.length || activity.mediaItems?.length || 0;
}

export default function ActivityFeedPanel({ role, schoolId = 'TST2' }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pending, setPending] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState('');

  const canCreate = role === 'ADMIN' || role === 'PRINCIPAL' || role === 'TEACHER';
  const canApprove = role === 'ADMIN' || role === 'PRINCIPAL';

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [feedData, pendingData] = await Promise.all([
        activityApi.feed(schoolId, 0, 30),
        canApprove ? activityApi.pending(schoolId).catch(() => []) : Promise.resolve([]),
      ]);
      setActivities(feedData);
      setPending(pendingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load school activities.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [schoolId, canApprove]);

  async function approveAndPublish(activityId: string | number) {
    try {
      setBusyId(activityId);
      await activityApi.approve(schoolId, activityId);
      await activityApi.publish(schoolId, activityId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve activity.');
    } finally {
      setBusyId(null);
    }
  }

  const timelineYears = useMemo(() => {
    const years = new Set<string>();
    activities.forEach((activity) => {
      const date = new Date(activity.activityDate || activity.createdAt || '');
      years.add(Number.isNaN(date.getTime()) ? 'Timeline' : String(date.getFullYear()));
    });
    return Array.from(years);
  }, [activities]);

  return (
    <div className="activity-page">
      <section className="activity-hero">
        <div>
          <p className="eyebrow">School Activities & Memories</p>
          <h1>Private school activity feed</h1>
          <p>
            Share celebrations, classroom events, achievements and school memories with tenant-safe visibility for
            students and parents.
          </p>
        </div>
        <div className="activity-actions">
          <Link className="secondary-action" href="/school-activities#gallery">Gallery</Link>
          <Link className="secondary-action" href="/school-activities#memories">Memories</Link>
          {canCreate ? <Link className="primary-action" href="/school-activities/create">Create Activity</Link> : null}
        </div>
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
            {pending.map((activity) => (
              <article className="activity-card" key={`pending-${activity.id}`}>
                <div className="activity-card-media">📝</div>
                <div className="activity-card-body">
                  <div className="meta-row">
                    <span>{formatDate(activity.activityDate)}</span>
                    <span className="status-pill warning">{statusLabel(activity.approvalStatus)}</span>
                  </div>
                  <h3>{activity.title}</h3>
                  <p>{activity.description || 'No description provided.'}</p>
                  <button className="primary-action full" disabled={busyId === activity.id} onClick={() => approveAndPublish(activity.id)}>
                    {busyId === activity.id ? 'Approving...' : 'Approve & Publish'}
                  </button>
                </div>
              </article>
            ))}
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
            <span>Published activities will appear here for students and parents.</span>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map((activity) => (
              <article className="activity-card" key={activity.id}>
                <div className="activity-card-media">📸</div>
                <div className="activity-card-body">
                  <div className="meta-row">
                    <span>{formatDate(activity.activityDate)}</span>
                    <span className="status-pill">{statusLabel(activity.approvalStatus)}</span>
                  </div>
                  <h3>{activity.title}</h3>
                  <p>{activity.description || 'School activity update.'}</p>
                  <div className="activity-metrics">
                    <span>👁 {activity.viewCount || 0} views</span>
                    <span>❤️ {activity.likeCount || 0} likes</span>
                    <span>🖼 {mediaCount(activity)} media</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="activity-section" id="gallery">
        <div className="section-heading">
          <p className="eyebrow">Gallery</p>
          <h2>Photos and videos</h2>
        </div>
        <div className="gallery-grid">
          {activities.slice(0, 8).map((activity) => (
            <div className="gallery-tile" key={`gallery-${activity.id}`}>
              <span>🖼️</span>
              <strong>{activity.title}</strong>
              <small>{mediaCount(activity)} media files</small>
            </div>
          ))}
          {!activities.length ? <div className="empty-card">Gallery will populate after activities are published.</div> : null}
        </div>
      </section>

      <section className="activity-section" id="memories">
        <div className="section-heading">
          <p className="eyebrow">School Memories</p>
          <h2>Timeline</h2>
        </div>
        <div className="timeline-card">
          {timelineYears.length ? timelineYears.map((year) => <span key={year}>{year}</span>) : <p>No timeline entries yet.</p>}
        </div>
      </section>

      <style jsx>{`
        .activity-page {
          display: grid;
          gap: 24px;
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
          gap: 10px;
        }

        .primary-action,
        .secondary-action {
          border: 0;
          border-radius: 999px;
          padding: 12px 18px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
        }

        .primary-action {
          background: #f5bc42;
          color: #10223a;
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
          gap: 16px;
        }

        .activity-stats div,
        .activity-card,
        .empty-card,
        .timeline-card,
        .gallery-tile {
          border: 1px solid rgba(16, 34, 58, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 45px rgba(16, 34, 58, 0.08);
        }

        .activity-stats div {
          padding: 20px;
        }

        .activity-stats strong {
          display: block;
          color: #10223a;
          font-size: 32px;
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
          margin-bottom: 16px;
        }

        .section-heading h2 {
          color: #10223a;
          font-size: 26px;
          letter-spacing: -0.03em;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }

        .activity-card {
          overflow: hidden;
        }

        .activity-card-media {
          min-height: 150px;
          display: grid;
          place-items: center;
          background: #edf3f8;
          font-size: 44px;
        }

        .activity-card-body {
          padding: 18px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          color: #667085;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 10px;
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
          font-size: 20px;
          letter-spacing: -0.02em;
        }

        .activity-card p {
          color: #667085;
          line-height: 1.55;
        }

        .activity-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: #667085;
          font-size: 12px;
          font-weight: 800;
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

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .gallery-tile {
          min-height: 160px;
          padding: 18px;
          display: grid;
          align-content: end;
          gap: 8px;
        }

        .gallery-tile span {
          font-size: 38px;
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
          padding: 20px;
        }

        .timeline-card span {
          border-radius: 999px;
          background: #10223a;
          color: white;
          padding: 9px 14px;
          font-weight: 900;
        }

        @media (max-width: 780px) {
          .activity-hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .activity-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
