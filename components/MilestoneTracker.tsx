import React, { useState } from 'react';
import { Milestone, MilestoneStatus, UserRole } from '../types';
import { useApp } from '../AppContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, FileText, Lock, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { Web3Badge } from './Web3Badge';
import { generateMilestoneReportSummary } from '../services/geminiService';

interface MilestoneTrackerProps {
  projectId: string;
  milestones: Milestone[];
  isOwner: boolean;
  canApprove: boolean;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ projectId, milestones, isOwner, canApprove }) => {
  const { updateMilestoneStatus, simulateReleaseFunds } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");

  const handleUpload = async (m: Milestone) => {
    if (!uploadNotes) {
        alert("Please add some notes about the work done.");
        return;
    }
    setProcessingId(m.id);
    
    // AI Enhancement: Generate a formal summary from notes
    const aiSummary = await generateMilestoneReportSummary(m.title, uploadNotes);
    
    // Simulate upload and Web3 state change
    await updateMilestoneStatus(projectId, m.id, MilestoneStatus.IN_REVIEW, 'report_v1.pdf'); // Mock file URL
    console.log("AI Summary Generated for report:", aiSummary);
    setProcessingId(null);
    setUploadNotes("");
  };

  const handleApprove = async (m: Milestone) => {
    if (!confirm(`Confirm releasing $${m.amount} from Smart Contract?`)) return;
    
    setProcessingId(m.id);
    await simulateReleaseFunds(projectId, m.id);
    setProcessingId(null);
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.APPROVED: return <CheckCircle className="text-emerald-500" />;
      case MilestoneStatus.IN_REVIEW: return <Clock className="text-amber-500" />;
      case MilestoneStatus.PENDING_SUBMISSION: return <AlertCircle className="text-blue-500" />;
      case MilestoneStatus.LOCKED: return <Lock className="text-neutral-600" />;
      default: return <Lock />;
    }
  };

  return (
    <div className="space-y-4">
      {milestones.map((m, index) => (
        <div key={m.id} className="bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden rounded-lg">
          {/* Timeline Connector */}
          {index !== milestones.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-zinc-800 -z-0"></div>
          )}

          <div className="flex gap-4 relative z-10">
            <div className="mt-1">{getStatusIcon(m.status)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <h4 className="font-semibold text-lg">{m.title}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-zinc-400 font-mono">Due: {m.dueDate}</span>
                   <Web3Badge type={m.status === MilestoneStatus.APPROVED ? 'success' : 'info'}>
                     ${m.amount.toLocaleString()}
                   </Web3Badge>
                </div>
              </div>
              
              <p className="text-zinc-400 text-sm mt-1 mb-3">{m.description}</p>

              {/* Status Specific Actions */}
              <div className="bg-black/30 p-3 border border-zinc-800/50 rounded">
                 {/* LOCKED */}
                 {m.status === MilestoneStatus.LOCKED && (
                    <span className="text-xs text-zinc-500 italic">Complete previous milestones to unlock.</span>
                 )}

                 {/* OWNER ACTIONS: SUBMIT */}
                 {isOwner && m.status === MilestoneStatus.PENDING_SUBMISSION && (
                    <div className="space-y-2">
                        <textarea 
                            className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                            placeholder="Describe work completed & paste verification links..."
                            value={uploadNotes}
                            onChange={(e) => setUploadNotes(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                             <Button size="sm" onClick={() => handleUpload(m)} disabled={!!processingId}>
                                {processingId === m.id ? <Loader2 className="animate-spin" /> : <Upload size={14} />}
                                <span className="ml-2">Submit & Sign</span>
                             </Button>
                        </div>
                    </div>
                 )}

                 {/* IN REVIEW (Both view) */}
                 {m.status === MilestoneStatus.IN_REVIEW && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                            <FileText size={16} />
                            <a href="#" className="underline">View Proof</a>
                        </div>
                        {canApprove && (
                            <Button variant="default" size="sm" onClick={() => handleApprove(m)} disabled={!!processingId} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {processingId === m.id ? <Loader2 className="animate-spin" /> : 'Verify & Release Funds'}
                            </Button>
                        )}
                        {!canApprove && <span className="text-xs text-amber-500 animate-pulse">Waiting for donor verification...</span>}
                    </div>
                 )}

                 {/* APPROVED */}
                 {m.status === MilestoneStatus.APPROVED && (
                    <div className="text-xs text-emerald-500 font-mono">
                        Transaction Hash: 0x82...192A (Confirmed)
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};