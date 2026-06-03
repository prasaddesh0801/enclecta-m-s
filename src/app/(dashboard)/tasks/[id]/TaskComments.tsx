"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { addTaskComment } from "./actions";

export default function TaskComments({ taskId, comments, currentUserId }: { taskId: string, comments: any[], currentUserId: string }) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await addTaskComment(taskId, currentUserId, newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card rounded-2xl border border-white/5 flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-medium text-foreground">Comments & Activity</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map(comment => {
            const isMine = comment.userId === currentUserId;
            return (
              <div key={comment.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/30">
                      {comment.user.name.charAt(0)}
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMine 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-white/5 text-foreground border border-white/5 rounded-bl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                  </div>
                </div>
                <div className={`text-[10px] text-muted-foreground mt-1 ${isMine ? 'mr-1' : 'ml-10'}`}>
                  {!isMine && <span className="font-medium">{comment.user.name} • </span>}
                  {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground resize-none h-12 min-h-[48px] max-h-32"
            rows={1}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="h-12 px-4 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
