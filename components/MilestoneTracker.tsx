import React, { useState, useEffect, useRef } from 'react';
import { Milestone, MilestoneStatus, UserRole } from '../types';
import { useApp } from '../AppContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Lock, Upload, AlertCircle, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { Web3Badge } from './Web3Badge';

interface MilestoneTrackerProps {
  projectId: string;
  milestones: Milestone[];
  isOwner: boolean;
  canApprove: boolean;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ projectId, milestones, isOwner, canApprove }) => {
  const { updateMilestoneStatus, simulateReleaseFunds } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadNotes, setUploadNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoApproveCountdown, setAutoApproveCountdown] = useState<Record<string, number>>({});
  const autoApproveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Auto-approve milestones after 10 seconds of being in review (for demo purposes)
  useEffect(() => {
    milestones.forEach(m => {
      if (m.status === MilestoneStatus.IN_REVIEW && !autoApproveTimers.current[m.id]) {
        // Start countdown
        setAutoApproveCountdown(prev => ({ ...prev, [m.id]: 10 }));
        
        // Countdown interval
        const countdownInterval = setInterval(() => {
          setAutoApproveCountdown(prev => {
            const current = prev[m.id] || 0;
            if (current <= 1) {
              clearInterval(countdownInterval);
              return { ...prev, [m.id]: 0 };
            }
            return { ...prev, [m.id]: current - 1 };
          });
        }, 1000);

        // Auto-approve after 10 seconds
        autoApproveTimers.current[m.id] = setTimeout(async () => {
          console.log("Auto-approving milestone:", m.title);
          await simulateReleaseFunds(projectId, m.id);
          delete autoApproveTimers.current[m.id];
          clearInterval(countdownInterval);
        }, 10000);
      }
      
      // Clean up timer if milestone is no longer in review
      if (m.status !== MilestoneStatus.IN_REVIEW && autoApproveTimers.current[m.id]) {
        clearTimeout(autoApproveTimers.current[m.id]);
        delete autoApproveTimers.current[m.id];
      }
    });

    // Cleanup on unmount
    return () => {
      Object.values(autoApproveTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, [milestones, projectId, simulateReleaseFunds]);

  const handleUpload = async (m: Milestone) => {
    const notes = uploadNotes[m.id] || "";
    if (!notes) {
        alert("Please add some notes about the work done.");
        return;
    }
    setProcessingId(m.id);
    
    // Submit milestone for review
    await updateMilestoneStatus(projectId, m.id, MilestoneStatus.IN_REVIEW, 'report_v1.pdf');
    console.log("Milestone submitted:", m.title, "Notes:", notes);
    setProcessingId(null);
    setUploadNotes(prev => ({ ...prev, [m.id]: "" }));
  };

  const handleApprove = async (m: Milestone) => {
    if (!confirm(`Confirm releasing $${m.amount.toLocaleString()} from Smart Contract?`)) return;
    
    // Clear the auto-approve timer if manually approving
    if (autoApproveTimers.current[m.id]) {
      clearTimeout(autoApproveTimers.current[m.id]);
      delete autoApproveTimers.current[m.id];
    }
    
    setProcessingId(m.id);
    await simulateReleaseFunds(projectId, m.id);
    setProcessingId(null);
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.APPROVED: return <CheckCircle className="text-emerald-500" size={24} />;
      case MilestoneStatus.IN_REVIEW: return <Clock className="text-amber-500 animate-pulse" size={24} />;
      case MilestoneStatus.PENDING_SUBMISSION: return <AlertCircle className="text-blue-500" size={24} />;
      case MilestoneStatus.LOCKED: return <Lock className="text-neutral-500" size={24} />;
      default: return <Lock size={24} />;
    }
  };

  const getStatusLabel = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.APPROVED: return 'Completed';
      case MilestoneStatus.IN_REVIEW: return 'Under Review';
      case MilestoneStatus.PENDING_SUBMISSION: return 'Ready to Submit';
      case MilestoneStatus.LOCKED: return 'Locked';
      default: return 'Unknown';
    }
  };

  const completedCount = milestones.filter(m => m.status === MilestoneStatus.APPROVED).length;
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones.filter(m => m.status === MilestoneStatus.APPROVED).reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            <span className="font-medium text-foreground">Milestone Progress</span>
          </div>
          <span className="text-sm text-muted-foreground">{completedCount} of {milestones.length} completed</span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500" 
            style={{ width: `${milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${releasedAmount.toLocaleString()} released</span>
          <span>${totalAmount.toLocaleString()} total</span>
        </div>
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {milestones.map((m, index) => {
          const isExpanded = expandedId === m.id;
          const canExpand = m.status === MilestoneStatus.PENDING_SUBMISSION || m.status === MilestoneStatus.IN_REVIEW;
          
          return (
            <div 
              key={m.id} 
              className={`bg-card border rounded-lg transition-all duration-200 ${
                m.status === MilestoneStatus.LOCKED ? 'border-border opacity-60' : 
                m.status === MilestoneStatus.APPROVED ? 'border-emerald-500/30 bg-emerald-500/5' :
                m.status === MilestoneStatus.IN_REVIEW ? 'border-amber-500/30 bg-amber-500/5' :
                'border-primary/30 bg-primary/5'
              }`}
            >
              {/* Milestone Header */}
              <div 
                className={`flex items-center gap-4 p-4 ${canExpand ? 'cursor-pointer' : ''}`}
                onClick={() => canExpand && setExpandedId(isExpanded ? null : m.id)}
              >
                {/* Step Number & Icon */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    m.status === MilestoneStatus.APPROVED ? 'bg-emerald-500/20 text-emerald-500' :
                    m.status === MilestoneStatus.IN_REVIEW ? 'bg-amber-500/20 text-amber-500' :
                    m.status === MilestoneStatus.PENDING_SUBMISSION ? 'bg-blue-500/20 text-blue-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {m.status === MilestoneStatus.APPROVED ? <CheckCircle size={20} /> : index + 1}
                  </div>
                </div>

                {/* Milestone Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">{m.title}</h4>
                    <Web3Badge type={
                      m.status === MilestoneStatus.APPROVED ? 'success' :
                      m.status === MilestoneStatus.IN_REVIEW ? 'warning' :
                      m.status === MilestoneStatus.PENDING_SUBMISSION ? 'info' : 'default'
                    }>
                      {getStatusLabel(m.status)}
                    </Web3Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{m.description}</p>
                </div>

                {/* Amount & Date */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground">${m.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Due: {m.dueDate}</p>
                </div>

                {/* Expand Arrow */}
                {canExpand && (
                  <ChevronRight className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} size={20} />
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  {/* OWNER ACTIONS: SUBMIT */}
                  {isOwner && m.status === MilestoneStatus.PENDING_SUBMISSION && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Submit proof of work to release funds for this milestone.</p>
                      <textarea 
                        className="w-full bg-background border border-border p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded-lg"
                        rows={3}
                        placeholder="Describe work completed, attach links to deliverables, reports, or other verification..."
                        value={uploadNotes[m.id] || ""}
                        onChange={(e) => setUploadNotes(prev => ({ ...prev, [m.id]: e.target.value }))}
                      />
                      <div className="flex items-center gap-3">
                        <Button size="sm" onClick={() => handleUpload(m)} disabled={!!processingId}>
                          {processingId === m.id ? <Loader2 className="animate-spin mr-2" size={14} /> : <Upload size={14} className="mr-2" />}
                          Submit for Review
                        </Button>
                        <span className="text-xs text-muted-foreground">Submission will be verified by investors</span>
                      </div>
                    </div>
                  )}

                  {/* IN REVIEW - Creator View */}
                  {isOwner && m.status === MilestoneStatus.IN_REVIEW && (
                    <div className="space-y-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          {autoApproveCountdown[m.id] > 0 ? (
                            <span className="text-amber-500 font-bold text-sm">{autoApproveCountdown[m.id]}</span>
                          ) : (
                            <Loader2 className="text-amber-500 animate-spin" size={18} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Verification in Progress</p>
                          <p className="text-xs text-muted-foreground">
                            {autoApproveCountdown[m.id] > 0 
                              ? `Auto-approving in ${autoApproveCountdown[m.id]} seconds...` 
                              : 'Processing approval and releasing funds...'}
                          </p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-1000" 
                          style={{ width: `${((10 - (autoApproveCountdown[m.id] || 0)) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* IN REVIEW - Donor View */}
                  {!isOwner && m.status === MilestoneStatus.IN_REVIEW && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={16} className="text-primary" />
                        <a href="#" className="text-primary underline hover:no-underline">View Submitted Proof</a>
                      </div>
                      {canApprove && (
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handleApprove(m)} 
                            disabled={!!processingId} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {processingId === m.id ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle size={14} className="mr-2" />}
                            Verify & Release ${m.amount.toLocaleString()}
                          </Button>
                          <span className="text-xs text-muted-foreground">Funds will be sent to creator's wallet</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Approved Transaction Info */}
              {m.status === MilestoneStatus.APPROVED && (
                <div className="px-4 pb-3 pt-0">
                  <div className="text-xs text-emerald-500 font-mono flex items-center gap-2">
                    <CheckCircle size={12} />
                    Transaction confirmed • 0x{Math.random().toString(16).substr(2, 8)}...
                  </div>
                </div>
              )}

              {/* Locked Info */}
              {m.status === MilestoneStatus.LOCKED && (
                <div className="px-4 pb-3 pt-0">
                  <p className="text-xs text-muted-foreground italic">Complete the previous milestone to unlock this one.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};