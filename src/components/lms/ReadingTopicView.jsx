import React from "react";
import { BookOpen, Download, CheckCircle, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReadingTopicView({ topic, isCompleted, onComplete }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📖</span>
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider bg-green-500/20 px-2 py-0.5 rounded">Reading</span>
        </div>
        <h2 className="text-white font-display font-bold text-2xl leading-snug">{topic.title}</h2>
        {topic.reading_duration_mins > 0 && (
          <p className="text-white/40 text-xs mt-1">{topic.reading_duration_mins} min estimated reading time</p>
        )}
      </div>

      {/* PDF Viewer */}
      {topic.reading_file_url && (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-400" />
              <span className="text-white/70 text-sm font-medium">{topic.reading_file_name || "Reading Material"}</span>
            </div>
            <a href={topic.reading_file_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-harvest hover:text-harvest/80 font-semibold transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
          {topic.reading_file_url.toLowerCase().includes(".pdf") ? (
            <iframe src={topic.reading_file_url} className="w-full h-[600px]" title={topic.title} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <BookOpen className="w-12 h-12 text-white/20" />
              <p className="text-white/50 text-sm">Preview not available for this file type.</p>
              <a href={topic.reading_file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 text-white border-white/20 hover:bg-white/10">
                  <ExternalLink className="w-4 h-4" /> Open File
                </Button>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Rich Text Content */}
      {topic.content && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">Reading Content</p>
          <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{topic.content}</div>
        </div>
      )}

      {!topic.reading_file_url && !topic.content && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
          <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No reading content configured for this topic.</p>
        </div>
      )}

      {/* Completion */}
      <div className="flex items-center justify-between pt-2">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Topic Completed
          </div>
        ) : (
          <p className="text-white/30 text-xs">Mark as complete when you've finished reading</p>
        )}
        {!isCompleted && (
          <Button onClick={onComplete} className="bg-harvest hover:bg-harvest/90 text-white gap-2">
            Mark Complete <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}