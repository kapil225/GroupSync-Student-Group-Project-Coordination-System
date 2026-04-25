/**
 * CommentThread.jsx — V4 FIXED
 * 
 * BUG FIXES:
 *   1. Comments now save correctly to Firestore (was failing silently)
 *   2. Comments persist after refresh (proper array handling)
 *   3. Each comment linked to taskId + userId
 *   4. Input validation prevents empty comments
 *   5. Permission check: only owner/assignee can comment
 *   6. Shows proper error for unauthorized users
 */

import { useState } from 'react';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, canCommentOnTask, isProjectOwner } from '../../utils/helpers';
import { Send, Trash2, Lock } from 'lucide-react';
import './CommentThread.css';

export default function CommentThread({ task }) {
  const { dispatch } = useGroup();
  const { user } = useAuth();
  const group = useActiveGroup();

  const [text, setText] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [sending, setSending] = useState(false);

  // FIX: Ensure comments is always an array
  const comments = Array.isArray(task?.comments) ? task.comments : [];

  // V4: Permission check
  const hasPermission = group && user && canCommentOnTask(group, task, user.uid);
  const ownerMode = group && user && isProjectOwner(group, user.uid);

  const findMember = (memberId) => group?.members?.find((m) => m.id === memberId);

  /**
   * V4 FIXED: Send comment with validation
   */
  const handleSend = async () => {
    // Validate input
    if (!text.trim()) return;
    if (!authorId) { alert('Please select who you are posting as.'); return; }
    if (sending) return; // Prevent double-submit

    setSending(true);
    try {
      await dispatch({
        type: 'ADD_COMMENT',
        payload: {
          groupId: group.id,
          taskId: task.id,
          authorId: authorId,
          text: text.trim(),
        },
      });
      setText(''); // Clear on success
    } catch (e) {
      console.error('Failed to send comment:', e);
      alert('Failed to send comment. Please try again.');
    }
    setSending(false);
  };

  const handleDelete = (commentId) => {
    dispatch({
      type: 'DELETE_COMMENT',
      payload: { groupId: group.id, taskId: task.id, commentId },
    });
  };

  // V4: Get members who can post (owner sees all, member sees only themselves)
  const postableMembers = ownerMode
    ? (group?.members || [])
    : (group?.members || []).filter((m) => m.userId === user?.uid);

  return (
    <div className="comment-thread">
      <h4 className="comment-thread__title">
        Discussion
        {comments.length > 0 && <span className="comment-thread__count">{comments.length}</span>}
      </h4>

      {/* Comment list */}
      <div className="comment-thread__list">
        {comments.length === 0 && (
          <p className="comment-thread__empty">No comments yet.</p>
        )}

        {comments.map((c) => {
          const author = findMember(c.authorId);
          const canDelete = isProjectOwner(group, user?.uid) || c.authorUserId === user?.uid;

          return (
            <div key={c.id} className="comment">
              <span className="comment__avatar">{author?.avatar || '👤'}</span>
              <div className="comment__body">
                <div className="comment__meta">
                  <span className="comment__author">{c.authorName || author?.name || 'Unknown'}</span>
                  <span className="comment__time">{formatDate(c.createdAt)}</span>
                </div>
                <p className="comment__text">{c.text}</p>
              </div>
              {canDelete && (
                <button className="comment__delete" title="Delete" onClick={() => handleDelete(c.id)}>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Compose — only if user has permission */}
      {hasPermission ? (
        <div className="comment-thread__compose">
          <select
            className="comment-thread__author-select"
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
          >
            <option value="">Post as...</option>
            {postableMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
            ))}
          </select>
          <div className="comment-thread__input-row">
            <input
              className="comment-thread__input"
              placeholder="Write a comment..."
              value={text}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button
              className="comment-thread__send"
              onClick={handleSend}
              disabled={!text.trim() || !authorId || sending}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="comment-thread__no-access">
          <Lock size={13} />
          <span>You don't have permission to comment on this task.</span>
        </div>
      )}
    </div>
  );
}
