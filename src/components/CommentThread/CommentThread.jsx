/**
 * CommentThread.jsx
 * 
 * A threaded discussion section that lives inside the TaskDetailModal.
 * 
 * Features:
 *   - Displays all comments on a task in chronological order
 *   - Each comment shows the author's avatar, name, and relative timestamp
 *   - Users select which member they're posting as (via a dropdown)
 *   - Type a message and press Enter or click the send button
 *   - Comments can be deleted (hover to reveal the delete icon)
 * 
 * This component requires that the group has at least one member —
 * otherwise it shows a hint to add members first.
 */

import { useState } from 'react';
import { useGroup, useActiveGroup } from '../../context/GroupContext';
import { formatDate } from '../../utils/helpers';
import { Send, Trash2 } from 'lucide-react';
import './CommentThread.css';

export default function CommentThread({ task }) {
  const { dispatch } = useGroup();
  const group = useActiveGroup();

  // Local form state for the comment composer
  const [commentText, setCommentText] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState('');

  const comments = task.comments || [];

  /**
   * Look up a member by ID to get their name and avatar.
   * Returns undefined if the member was removed after commenting.
   */
  const findMember = (memberId) => {
    return group.members.find((member) => member.id === memberId);
  };

  /**
   * Post a new comment.
   * Requires both a selected author and non-empty text.
   */
  const handleSendComment = () => {
    const trimmedText = commentText.trim();
    if (!trimmedText || !selectedAuthorId) return;

    dispatch({
      type: 'ADD_COMMENT',
      payload: {
        groupId: group.id,
        taskId: task.id,
        authorId: selectedAuthorId,
        text: trimmedText,
      },
    });

    // Clear the input but keep the selected author (convenience for rapid posting)
    setCommentText('');
  };

  /**
   * Delete a specific comment.
   */
  const handleDeleteComment = (commentId) => {
    dispatch({
      type: 'DELETE_COMMENT',
      payload: {
        groupId: group.id,
        taskId: task.id,
        commentId: commentId,
      },
    });
  };

  return (
    <div className="comment-thread">

      {/* ── Section Header ── */}
      <h4 className="comment-thread__title">
        Discussion
        {comments.length > 0 && (
          <span className="comment-thread__count">{comments.length}</span>
        )}
      </h4>

      {/* ── Comments List ── */}
      <div className="comment-thread__list">
        {comments.length === 0 && (
          <p className="comment-thread__empty">
            No comments yet. Start the discussion!
          </p>
        )}

        {comments.map((comment) => {
          const author = findMember(comment.authorId);

          return (
            <div key={comment.id} className="comment">
              {/* Author avatar */}
              <span className="comment__avatar">
                {author?.avatar || '👤'}
              </span>

              {/* Comment body */}
              <div className="comment__body">
                <div className="comment__meta">
                  <span className="comment__author">
                    {author?.name || 'Unknown'}
                  </span>
                  <span className="comment__time">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="comment__text">{comment.text}</p>
              </div>

              {/* Delete button (appears on hover) */}
              <button
                className="comment__delete"
                title="Delete comment"
                onClick={() => handleDeleteComment(comment.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Comment Composer ── */}
      {group.members.length > 0 ? (
        <div className="comment-thread__compose">
          {/* Select which member you're posting as */}
          <select
            className="comment-thread__author-select"
            value={selectedAuthorId}
            onChange={(event) => setSelectedAuthorId(event.target.value)}
          >
            <option value="">Post as...</option>
            {group.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.avatar} {member.name}
              </option>
            ))}
          </select>

          {/* Text input + send button */}
          <div className="comment-thread__input-row">
            <input
              className="comment-thread__input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSendComment();
              }}
            />
            <button
              className="comment-thread__send"
              onClick={handleSendComment}
              disabled={!commentText.trim() || !selectedAuthorId}
              title="Send comment"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <p className="comment-thread__no-members">
          Add members to the project to start discussing.
        </p>
      )}
    </div>
  );
}
