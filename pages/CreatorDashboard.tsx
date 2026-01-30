import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DonorProfilePage } from './DonorProfilePage';
import { Project, MilestoneStatus, Milestone, User, TransactionType, ConnectionStatus } from '../types';
import { 
  Plus, LayoutDashboard, Wallet, MessageSquare, UserCircle, 
  Send, Sparkles, LogOut, Search, TrendingUp, ArrowLeft,
  MoreHorizontal, Calendar, Tag, Image as ImageIcon,
  ArrowDownLeft, ArrowUpRight, X, Target, DollarSign, Users,
  CheckCircle, Clock, FileText, Trash2, MapPin
} from 'lucide-react';
import { Web3Badge } from '../components/Web3Badge';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { UserRole } from '../types';

export const CreatorDashboard: React.FC = () => {
  const {
    currentUser,
    projects,
    addProject,
    users,
    getTransactionsByUser,
    updateUserProfile,
    sendConnectionRequest,
    getConnectionStatus,
    getPaymentMethodsByUser,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    updateProject
  } = useApp();
  const myProjects = projects.filter(p => p.creatorId === currentUser?.id);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  // AI State
  const [recommendedDonors, setRecommendedDonors] = useState<any[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);

  // Connection Flow State
  const [connectingInvestor, setConnectingInvestor] = useState<User | null>(null);

  // Donor Profile View State
  const [viewingDonorId, setViewingDonorId] = useState<string | null>(null);

  // Add Milestone State
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: ''
  });

  // Withdrawal Modal State
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    website: currentUser?.website || '',
    linkedin: currentUser?.linkedin || '',
    specialties: currentUser?.specialties || [],
    interests: currentUser?.interests || [],
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [introductionMessage, setIntroductionMessage] = useState<string>("");

  // Chat State - Conversations with real donors
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  // Mock conversations data with real donor IDs and project-related messages
  const [conversations, setConversations] = useState<Record<string, {
    messages: { sender: 'me' | 'them', text: string, time: string, attachment?: { name: string, type: string } }[],
    lastMessage: string,
    lastTime: string,
    unread: number
  }>>({
    'u2': { // Makerere Impact Fund
      messages: [
        { sender: 'them', text: "Hello! We reviewed your Northern Uganda Girls Education Program proposal. Very impressive work you're doing in Gulu and Kitgum.", time: "9:15 AM" },
        { sender: 'me', text: "Thank you so much! We've been working with these communities for over 3 years now.", time: "9:18 AM" },
        { sender: 'them', text: "I noticed you've already completed the first milestone. Can you share the procurement receipts?", time: "9:20 AM" },
        { sender: 'me', text: "Absolutely! Here are the receipts for the school supplies and scholarships.", time: "9:25 AM", attachment: { name: 'procurement_receipts_term1.pdf', type: 'pdf' } },
        { sender: 'them', text: "Perfect. We've reviewed and approved the milestone. The funds have been released to your wallet.", time: "10:30 AM" },
        { sender: 'me', text: "Wonderful! We'll begin Phase 2 - the menstrual hygiene kits distribution next week.", time: "10:32 AM" },
        { sender: 'them', text: "Great. Please keep us updated on the progress. We'd like to visit the schools if possible.", time: "10:35 AM" },
        { sender: 'me', text: "You're welcome to visit anytime! I'll send you the school locations and contact details.", time: "10:40 AM" },
      ],
      lastMessage: "You're welcome to visit anytime!",
      lastTime: "10:40 AM",
      unread: 0
    },
    'u6': { // Women Empower Uganda  
      messages: [
        { sender: 'them', text: "Hi there! We're particularly interested in your girls education program. It aligns perfectly with our mission.", time: "Yesterday" },
        { sender: 'me', text: "Thank you for reaching out! Yes, we focus specifically on keeping girls in school through multiple interventions.", time: "Yesterday" },
        { sender: 'them', text: "Can you tell us more about the menstrual hygiene component?", time: "Yesterday" },
        { sender: 'me', text: "Of course! We distribute reusable sanitary pads and train peer educators. Here's our program overview.", time: "Yesterday", attachment: { name: 'MHM_Program_Overview.pdf', type: 'pdf' } },
        { sender: 'them', text: "This is excellent! We'd like to contribute UGX 25M towards this specific component.", time: "11:00 AM" },
        { sender: 'me', text: "That would be amazing! This will help us reach 200 girls with hygiene kits.", time: "11:15 AM" },
      ],
      lastMessage: "That would be amazing!",
      lastTime: "11:15 AM",
      unread: 2
    },
    'u4': { // Uganda Innovation Trust
      messages: [
        { sender: 'them', text: "Hello! We noticed your clean water project uses innovative drilling techniques. Tell us more.", time: "2 days ago" },
        { sender: 'me', text: "Yes! We partner with local technicians and use solar-powered pumps for sustainability.", time: "2 days ago" },
        { sender: 'them', text: "Interesting. Do you have technical specifications?", time: "2 days ago" },
        { sender: 'me', text: "Here's our technical proposal with all the specs and sustainability plan.", time: "2 days ago", attachment: { name: 'Borehole_Technical_Specs.pdf', type: 'pdf' } },
        { sender: 'me', text: "We also included photos from our previous installations.", time: "2 days ago", attachment: { name: 'Installation_Photos.zip', type: 'zip' } },
        { sender: 'them', text: "Thank you. We'll review and get back to you by end of week.", time: "2 days ago" },
      ],
      lastMessage: "We'll review and get back to you",
      lastTime: "2 days ago",
      unread: 0
    }
  });

  // Create Project State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Innovation');
  const [newAmount, setNewAmount] = useState('');

  // Keep activeProject in sync with context changes (e.g., milestone updates)
  useEffect(() => {
    if (activeProject) {
      const updatedProject = projects.find(p => p.id === activeProject.id);
      if (updatedProject && JSON.stringify(updatedProject) !== JSON.stringify(activeProject)) {
        setActiveProject(updatedProject);
      }
    }
  }, [projects, activeProject]);

  useEffect(() => {
    // Get all donors from JSON data and create recommendations
    if (activeTab === 'dashboard' && (viewMode === 'list' || viewMode === 'detail')) {
        const donors = users.filter(u => u.role === UserRole.DONOR);
        const recommendations = donors.map(donor => ({
            donorId: donor.id,
            score: 85 + Math.floor(Math.random() * 10) // Static score between 85-94
        }));
        setRecommendedDonors(recommendations);
    }
  }, [users, viewMode, activeTab]);

  const handleCreate = () => {
    if (!newTitle || !newDesc || !newAmount) return;
    const timestamp = Date.now();
    const newProject: Project = {
        id: `p${timestamp}`,
        creatorId: currentUser?.id || '',
        title: newTitle,
        description: newDesc,
        category: newCategory,
        fundingGoal: parseFloat(newAmount),
        currentFunding: 0,
        smartContractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        // Using a gradient image
        imageUrl: `https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop`,
        milestones: [
            { id: `m${timestamp}_1`, title: 'Project Kickoff', description: 'Initial setup and resource allocation.', amount: parseFloat(newAmount) * 0.2, status: MilestoneStatus.PENDING_SUBMISSION, dueDate: '2026-03-01' },
            { id: `m${timestamp}_2`, title: 'Development Phase', description: 'Core product development.', amount: parseFloat(newAmount) * 0.5, status: MilestoneStatus.LOCKED, dueDate: '2026-06-01' },
            { id: `m${timestamp}_3`, title: 'Final Delivery', description: 'Project completion and impact assessment.', amount: parseFloat(newAmount) * 0.3, status: MilestoneStatus.LOCKED, dueDate: '2026-09-01' }
        ]
    };
    addProject(newProject);
    // Navigate to the campaign detail page
    setActiveProject(newProject);
    setViewMode('detail');
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewAmount('');
  };

  const handleSendMessage = () => {
      if(!messageInput || !selectedContactId) return;
      const newMessage = { 
        sender: 'me' as const, 
        text: messageInput, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      };
      setConversations(prev => ({
        ...prev,
        [selectedContactId]: {
          ...prev[selectedContactId],
          messages: [...(prev[selectedContactId]?.messages || []), newMessage],
          lastMessage: messageInput,
          lastTime: newMessage.time
        }
      }));
      setMessageInput("");
  };

  const handleSendConnectionRequest = () => {
      if (!connectingInvestor || !currentUser) return;

      // Send connection request with optional introduction message
      sendConnectionRequest(connectingInvestor.id, introductionMessage || undefined);

      // Close modal and reset
      setConnectingInvestor(null);
      setIntroductionMessage("");
  };

  // If viewing a donor profile, show that instead of the dashboard
  if (viewingDonorId) {
      return <DonorProfilePage donorId={viewingDonorId} onBack={() => setViewingDonorId(null)} />;
  }

  // Handle project selection from sidebar
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
      setViewMode('detail');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        {/* Sidebar Component */}
        <AppSidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); setViewMode('list'); setActiveProject(null); }} 
          onProjectSelect={handleProjectSelect}
        />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen relative">
         
         {/* Connection Modal Overlay */}
         {connectingInvestor && (
             <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                 <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                     <div className="p-6 border-b border-border flex justify-between items-center">
                         <h3 className="text-xl font-bold text-foreground">Connect with {connectingInvestor.name}</h3>
                         <button onClick={() => setConnectingInvestor(null)} className="text-muted-foreground hover:text-foreground"><X size={20}/></button>
                     </div>
                     <div className="p-6 space-y-4">
                         <div className="flex items-center gap-3 mb-4">
                             <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">
                                 {connectingInvestor.name.charAt(0)}
                             </div>
                             <div>
                                 <p className="font-semibold text-foreground">{connectingInvestor.name}</p>
                                 <p className="text-sm text-zinc-400">
                                   {connectingInvestor.location || 'Investor'} • {connectingInvestor.interests.slice(0, 2).join(", ")}
                                 </p>
                             </div>
                         </div>

                         <div>
                             <label className="text-sm font-medium text-zinc-300 mb-2 block">
                               Introduce yourself (optional)
                             </label>
                             <textarea
                                className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-ring outline-none resize-none"
                                rows={4}
                                maxLength={300}
                                value={introductionMessage}
                                onChange={(e) => setIntroductionMessage(e.target.value)}
                                placeholder="Hello, I'm working on..."
                             />
                             <div className="flex justify-between mt-1">
                               <p className="text-xs text-zinc-500">
                                 Share why you'd like to connect with this investor
                               </p>
                               <p className="text-xs text-zinc-500">
                                 {introductionMessage.length}/300
                               </p>
                             </div>
                         </div>

                         <div className="flex gap-3 pt-4">
                             <Button variant="outline" className="flex-1" onClick={() => {
                               setConnectingInvestor(null);
                               setIntroductionMessage("");
                             }}>Cancel</Button>
                             <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0" onClick={handleSendConnectionRequest}>
                               Send Connection Request
                             </Button>
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'dashboard' && (
             <div className="mx-auto p-8 space-y-8">
                 
                 {viewMode === 'create' ? (
                     // CREATE CAMPAIGN VIEW
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                         <div className="mb-6 flex items-center gap-4">
                             <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
                                 <ArrowLeft size={16} className="mr-2" /> Back
                             </Button>
                             <h1 className="text-2xl font-bold">Launch New Campaign</h1>
                         </div>
                         
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="lg:col-span-2 space-y-6">
                                 <Card title="Campaign Details">
                                     <div className="space-y-4 mt-2">
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-muted-foreground">Project Title</label>
                                             <Input placeholder="e.g. Sustainable Ocean Cleanup" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                         </div>
                                         
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-muted-foreground">Category</label>
                                             <div className="flex gap-2">
                                                 {['Innovation', 'Environment', 'Education', 'Health'].map(cat => (
                                                     <button 
                                                        key={cat}
                                                        onClick={() => setNewCategory(cat)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${newCategory === cat ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}
                                                     >
                                                         {cat}
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>

                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-muted-foreground">Description</label>
                                             <textarea 
                                                 className="flex min-h-[150px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                                                 placeholder="Tell your story. Why does this project matter?"
                                                 value={newDesc} 
                                                 onChange={e => setNewDesc(e.target.value)}
                                             />
                                         </div>
                                     </div>
                                 </Card>

                                 <Card title="Milestones & Funding">
                                     <div className="space-y-4 mt-2">
                                         <Input type="number" label="Total Funding Goal ($ USD)" placeholder="50000" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                                         
                                         <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                             <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                 <Calendar size={14} /> Automatic Roadmap
                                             </h4>
                                             <p className="text-xs text-muted-foreground mb-4">
                                                 We automatically structure your project into verifiable phases to build trust with donors.
                                             </p>
                                             <div className="space-y-3">
                                                 <div className="flex items-center gap-3 p-3 bg-card rounded border border-border opacity-75">
                                                     <div className="h-6 w-6 rounded-full bg-blue-900/50 text-blue-500 flex items-center justify-center text-xs font-bold">1</div>
                                                     <div className="flex-1">
                                                         <div className="text-sm font-medium text-foreground">Project Kickoff</div>
                                                         <div className="text-xs text-muted-foreground">20% of funds released upfront</div>
                                                     </div>
                                                 </div>
                                                 <div className="flex items-center gap-3 p-3 bg-card rounded border border-border opacity-75">
                                                     <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</div>
                                                     <div className="flex-1">
                                                         <div className="text-sm font-medium text-foreground">Development Phase</div>
                                                         <div className="text-xs text-muted-foreground">80% released upon verification</div>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </Card>
                             </div>

                             <div className="space-y-6">
                                 <Card title="Campaign Preview">
                                     <div className="space-y-4">
                                         <div className="aspect-video bg-muted rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                                             <ImageIcon size={32} className="mb-2" />
                                             <span className="text-xs">Cover Image Preview</span>
                                         </div>
                                         <div>
                                             <h3 className="font-bold text-lg text-foreground line-clamp-2">{newTitle || 'Project Title'}</h3>
                                             <div className="flex items-center gap-2 mt-2">
                                                 <Web3Badge>{newCategory}</Web3Badge>
                                             </div>
                                         </div>
                                         <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0" size="lg" onClick={handleCreate}>Launch Campaign</Button>
                                         <p className="text-xs text-center text-muted-foreground">
                                             By launching, you agree to our terms of service and smart contract deployment fees.
                                         </p>
                                     </div>
                                 </Card>
                             </div>
                         </div>
                     </div>
                 ) : viewMode === 'detail' && activeProject ? (
                     // PROJECT DETAIL VIEW
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                         <div className="mb-6 flex items-center gap-4">
                             <Button variant="ghost" size="sm" onClick={() => { setViewMode('list'); setActiveProject(null); }}>
                                 <ArrowLeft size={16} className="mr-2" /> Back to Projects
                             </Button>
                         </div>

                         {/* Project Header */}
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="lg:col-span-2 space-y-6">
                                 {/* Project Overview Card */}
                                 <Card className="overflow-hidden">
                                     <div className="flex flex-col md:flex-row gap-6">
                                         <div className="md:w-1/3">
                                             <img src={activeProject.imageUrl} alt={activeProject.title} className="w-full h-48 md:h-full object-cover rounded-lg" />
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex justify-between items-start mb-4">
                                                 <div>
                                                     <h1 className="text-2xl font-bold text-foreground mb-2">{activeProject.title}</h1>
                                                     <div className="flex items-center gap-3">
                                                         <Web3Badge>{activeProject.category}</Web3Badge>
                                                         <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                             {activeProject.smartContractAddress.slice(0,10)}... <Tag size={10} />
                                                         </span>
                                                     </div>
                                                 </div>
                                                 <Web3Badge type="success">Active</Web3Badge>
                                             </div>
                                             <p className="text-muted-foreground text-sm mb-4">{activeProject.description}</p>
                                             <div className="flex gap-2">
                                                 <Button size="sm" variant="outline">
                                                     <ImageIcon size={14} className="mr-2" /> Edit Details
                                                 </Button>
                                             </div>
                                         </div>
                                     </div>
                                 </Card>

                                 {/* Milestones Section */}
                                 <Card>
                                     <div className="flex justify-between items-center mb-6">
                                         <div>
                                             <h2 className="text-xl font-bold text-foreground">Milestones</h2>
                                             <p className="text-sm text-muted-foreground">Track and manage your project phases</p>
                                         </div>
                                         <Button size="sm" onClick={() => setShowAddMilestone(true)}>
                                             <Plus size={14} className="mr-2" /> Add Milestone
                                         </Button>
                                     </div>

                                     {/* Add Milestone Form */}
                                     {showAddMilestone && (
                                         <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
                                             <h3 className="font-semibold mb-4 text-foreground">New Milestone</h3>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <Input 
                                                     label="Milestone Title" 
                                                     placeholder="e.g. Phase 1: Research" 
                                                     value={newMilestone.title}
                                                     onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
                                                 />
                                                 <Input 
                                                     label="Amount (USD)" 
                                                     type="number"
                                                     placeholder="10000" 
                                                     value={newMilestone.amount}
                                                     onChange={e => setNewMilestone({...newMilestone, amount: e.target.value})}
                                                 />
                                                 <Input 
                                                     label="Due Date" 
                                                     type="date"
                                                     value={newMilestone.dueDate}
                                                     onChange={e => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                                                 />
                                                 <div className="md:col-span-2">
                                                     <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                                                     <textarea 
                                                         className="w-full bg-background border border-border rounded-md p-3 text-sm focus:ring-1 focus:ring-ring"
                                                         rows={2}
                                                         placeholder="Describe deliverables for this milestone..."
                                                         value={newMilestone.description}
                                                         onChange={e => setNewMilestone({...newMilestone, description: e.target.value})}
                                                     />
                                                 </div>
                                             </div>
                                             <div className="flex gap-2 mt-4">
                                                 <Button 
                                                     size="sm" 
                                                     onClick={() => {
                                                         if (!newMilestone.title || !newMilestone.amount) return;
                                                         const milestone: Milestone = {
                                                             id: `m${Date.now()}`,
                                                             title: newMilestone.title,
                                                             description: newMilestone.description,
                                                             amount: parseFloat(newMilestone.amount),
                                                             status: MilestoneStatus.LOCKED,
                                                             dueDate: newMilestone.dueDate || new Date().toISOString().split('T')[0]
                                                         };
                                                         const updatedMilestones = [...activeProject.milestones, milestone];
                                                         updateProject(activeProject.id, { milestones: updatedMilestones });
                                                         setActiveProject({...activeProject, milestones: updatedMilestones});
                                                         setNewMilestone({ title: '', description: '', amount: '', dueDate: '' });
                                                         setShowAddMilestone(false);
                                                     }}
                                                 >
                                                     Add Milestone
                                                 </Button>
                                                 <Button size="sm" variant="outline" onClick={() => setShowAddMilestone(false)}>
                                                     Cancel
                                                 </Button>
                                             </div>
                                         </div>
                                     )}

                                     {/* Milestone List */}
                                     <MilestoneTracker 
                                         projectId={activeProject.id}
                                         milestones={activeProject.milestones}
                                         isOwner={true}
                                         canApprove={false}
                                     />
                                 </Card>
                             </div>

                             {/* Right Sidebar - Funding & Stats */}
                             <div className="space-y-6">
                                 {/* Funding Progress Card */}
                                 <Card>
                                     <h3 className="text-lg font-bold mb-4 text-foreground">Funding Progress</h3>
                                     <div className="space-y-4">
                                         <div>
                                             <div className="flex justify-between text-sm mb-2">
                                                 <span className="text-muted-foreground">Raised</span>
                                                 <span className="font-bold text-foreground">${activeProject.currentFunding.toLocaleString()}</span>
                                             </div>
                                             <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                                                 <div 
                                                     className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-500" 
                                                     style={{ width: `${Math.min((activeProject.currentFunding / activeProject.fundingGoal) * 100, 100)}%` }}
                                                 />
                                             </div>
                                             <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                 <span>{Math.round((activeProject.currentFunding / activeProject.fundingGoal) * 100)}% funded</span>
                                                 <span>Goal: ${activeProject.fundingGoal.toLocaleString()}</span>
                                             </div>
                                         </div>

                                         <div className="pt-4 border-t border-border">
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                     <DollarSign className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                                                     <p className="text-xs text-muted-foreground">Released</p>
                                                     <p className="font-bold text-foreground">
                                                         ${activeProject.milestones.filter(m => m.status === MilestoneStatus.APPROVED).reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                                                     </p>
                                                 </div>
                                                 <div className="text-center p-3 bg-muted/50 rounded-lg">
                                                     <Clock className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                                                     <p className="text-xs text-muted-foreground">Pending</p>
                                                     <p className="font-bold text-foreground">
                                                         ${activeProject.milestones.filter(m => m.status !== MilestoneStatus.APPROVED).reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                                                     </p>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </Card>

                                 {/* Milestone Stats */}
                                 <Card>
                                     <h3 className="text-lg font-bold mb-4 text-foreground">Milestone Status</h3>
                                     <div className="space-y-3">
                                         <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-2">
                                                 <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                 <span className="text-sm text-muted-foreground">Completed</span>
                                             </div>
                                             <span className="font-bold text-foreground">
                                                 {activeProject.milestones.filter(m => m.status === MilestoneStatus.APPROVED).length}
                                             </span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-2">
                                                 <Clock className="h-4 w-4 text-amber-500" />
                                                 <span className="text-sm text-muted-foreground">In Review</span>
                                             </div>
                                             <span className="font-bold text-foreground">
                                                 {activeProject.milestones.filter(m => m.status === MilestoneStatus.IN_REVIEW).length}
                                             </span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-2">
                                                 <Target className="h-4 w-4 text-blue-500" />
                                                 <span className="text-sm text-muted-foreground">Pending</span>
                                             </div>
                                             <span className="font-bold text-foreground">
                                                 {activeProject.milestones.filter(m => m.status === MilestoneStatus.PENDING_SUBMISSION).length}
                                             </span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-2">
                                                 <FileText className="h-4 w-4 text-muted-foreground" />
                                                 <span className="text-sm text-muted-foreground">Locked</span>
                                             </div>
                                             <span className="font-bold text-foreground">
                                                 {activeProject.milestones.filter(m => m.status === MilestoneStatus.LOCKED).length}
                                             </span>
                                         </div>
                                     </div>
                                 </Card>

                                 {/* Quick Actions */}
                                 <Card>
                                     <h3 className="text-lg font-bold mb-4 text-foreground">Quick Actions</h3>
                                     <div className="space-y-2">
                                         <Button 
                                             variant="outline" 
                                             className="w-full justify-start"
                                             onClick={() => {
                                                 // Show recommended donors section by scrolling or navigating
                                                 setViewMode('list');
                                                 setActiveProject(null);
                                             }}
                                         >
                                             <Users className="h-4 w-4 mr-2" /> Find Investors
                                         </Button>
                                         <Button 
                                             variant="outline" 
                                             className="w-full justify-start"
                                             onClick={() => setActiveTab('messages')}
                                         >
                                             <MessageSquare className="h-4 w-4 mr-2" /> Send Update
                                         </Button>
                                         <Button 
                                             variant="outline" 
                                             className="w-full justify-start"
                                             onClick={() => setActiveTab('wallet')}
                                         >
                                             <Wallet className="h-4 w-4 mr-2" /> View Wallet
                                         </Button>
                                     </div>
                                 </Card>
                             </div>
                         </div>
                     </div>
                 ) : (
                     // PROJECT LIST VIEW
                     <>
                         <div className="flex justify-between items-center">
                             <div>
                                 <h1 className="text-2xl font-bold">My Campaigns</h1>
                                 <p className="text-muted-foreground text-sm">Manage your projects and track funding progress</p>
                             </div>
                             <Button onClick={() => setViewMode('create')} className="bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                                <Plus className="mr-2 h-4 w-4" /> New Campaign
                             </Button>
                         </div>

                         {/* Quick Start Guide - Show for new users or when no projects */}
                         {myProjects.length === 0 && (
                             <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                 <div className="flex items-start gap-4 mb-6">
                                     <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                         <Sparkles className="h-6 w-6 text-primary" />
                                     </div>
                                     <div>
                                         <h2 className="text-xl font-bold text-foreground mb-1">Welcome to Texora!</h2>
                                         <p className="text-muted-foreground">Complete these steps to start raising funds for your projects.</p>
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <button 
                                         onClick={() => setViewMode('create')}
                                         className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all text-left group"
                                     >
                                         <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500 font-bold text-sm">
                                             1
                                         </div>
                                         <div>
                                             <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Create Your First Campaign</h3>
                                             <p className="text-sm text-muted-foreground mt-1">Launch a project with milestone-based funding</p>
                                         </div>
                                     </button>
                                     <button 
                                         onClick={() => setActiveTab('profile')}
                                         className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all text-left group"
                                     >
                                         <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500 font-bold text-sm">
                                             2
                                         </div>
                                         <div>
                                             <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Complete Your Profile</h3>
                                             <p className="text-sm text-muted-foreground mt-1">Build trust with a verified profile</p>
                                         </div>
                                     </button>
                                     <button 
                                         onClick={() => setActiveTab('wallet')}
                                         className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all text-left group"
                                     >
                                         <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-500 font-bold text-sm">
                                             3
                                         </div>
                                         <div>
                                             <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Set Up Payment Methods</h3>
                                             <p className="text-sm text-muted-foreground mt-1">Add mobile money or bank for withdrawals</p>
                                         </div>
                                     </button>
                                 </div>
                             </Card>
                         )}

                         {myProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myProjects.map(project => {
                                    const fundingPercent = Math.round((project.currentFunding / project.fundingGoal) * 100);
                                    const completedMilestones = project.milestones.filter(m => m.status === MilestoneStatus.APPROVED).length;
                                    
                                    return (
                                        <Card 
                                            key={project.id} 
                                            className="cursor-pointer hover:border-primary/50 transition-all"
                                            onClick={() => { setActiveProject(project); setViewMode('detail'); }}
                                        >
                                            <div className="space-y-4">
                                                <div className="aspect-video rounded-lg overflow-hidden">
                                                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Web3Badge>{project.category}</Web3Badge>
                                                        <Web3Badge type="success">Active</Web3Badge>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{project.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                                                </div>

                                                {/* Funding Progress */}
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-muted-foreground">Funded</span>
                                                        <span className="font-bold text-foreground">{fundingPercent}%</span>
                                                    </div>
                                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full" 
                                                            style={{ width: `${Math.min(fundingPercent, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                        <span>${project.currentFunding.toLocaleString()} raised</span>
                                                        <span>Goal: ${project.fundingGoal.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                {/* Milestones Summary */}
                                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Target size={14} />
                                                        <span>{completedMilestones}/{project.milestones.length} milestones</span>
                                                    </div>
                                                    <Button size="sm" variant="ghost">
                                                        View <ArrowUpRight size={14} className="ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                         ) : (
                            <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                    <LayoutDashboard size={32} />
                                </div>
                                <h3 className="text-xl font-medium text-foreground mb-2">No Campaigns Yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start a new project to automatically generate smart contracts and get matched with verified investors.</p>
                                <Button size="lg" onClick={() => setViewMode('create')} className="bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                                    <Plus className="mr-2 h-4 w-4" /> Create First Campaign
                                </Button>
                            </div>
                         )}

                         {/* RECOMMENDED DONORS SECTION */}
                         {myProjects.length > 0 && (
                             <div className="mt-10">
                                 <div className="flex items-center justify-between mb-6">
                                     <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                                             <Sparkles size={20} className="text-purple-400" />
                                         </div>
                                         <div>
                                             <h2 className="text-xl font-bold text-foreground">Recommended Donors</h2>
                                             <p className="text-sm text-muted-foreground">Investors matched to your campaign focus</p>
                                         </div>
                                     </div>
                                 </div>

                                 {recommendedDonors.length > 0 ? (
                                     <div className="flex flex-col gap-4">
                                         {recommendedDonors.map((rec) => {
                                             const donor = users.find(u => u.id === rec.donorId);
                                             if (!donor) return null;
                                             const connectionStatus = getConnectionStatus(donor.id);
                                             
                                             return (
                                                 <Card 
                                                     key={rec.donorId} 
                                                     className="cursor-pointer hover:border-primary/50 transition-all group"
                                                     onClick={() => setViewingDonorId(donor.id)}
                                                 >
                                                     <div className="flex flex-col md:flex-row gap-4">
                                                         {/* Left: Avatar & Match Score */}
                                                         <div className="flex flex-col items-center gap-2 md:w-24 flex-shrink-0">
                                                             <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl shadow-lg">
                                                                 {donor.name.charAt(0)}
                                                             </div>
                                                             <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                                                                 {rec.score}% match
                                                             </div>
                                                         </div>

                                                         {/* Middle: Donor Info */}
                                                         <div className="flex-1 space-y-3">
                                                             {/* Name & Verified */}
                                                             <div className="flex items-center gap-2 flex-wrap">
                                                                 <h3 className="font-bold text-lg text-foreground">{donor.name}</h3>
                                                                 {donor.verified && (
                                                                     <CheckCircle size={16} className="text-emerald-500" />
                                                                 )}
                                                             </div>

                                                             {/* Bio/Description */}
                                                             {donor.bio && (
                                                                 <p className="text-sm text-muted-foreground line-clamp-2">
                                                                     {donor.bio}
                                                                 </p>
                                                             )}

                                                             {/* Stats Row */}
                                                             <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                                 {donor.location && (
                                                                     <div className="flex items-center gap-1">
                                                                         <MapPin size={14} />
                                                                         <span>{donor.location}</span>
                                                                     </div>
                                                                 )}
                                                                 {donor.totalInvested && (
                                                                     <div className="flex items-center gap-1">
                                                                         <DollarSign size={14} />
                                                                         <span className="font-medium text-foreground">${donor.totalInvested.toLocaleString()}</span>
                                                                         <span>invested</span>
                                                                     </div>
                                                                 )}
                                                                 {donor.activeInvestments && (
                                                                     <div className="flex items-center gap-1">
                                                                         <TrendingUp size={14} />
                                                                         <span>{donor.activeInvestments} active projects</span>
                                                                     </div>
                                                                 )}
                                                                 {donor.ticketSize && (
                                                                     <div className="flex items-center gap-1">
                                                                         <Target size={14} />
                                                                         <span>Ticket: {donor.ticketSize}</span>
                                                                     </div>
                                                                 )}
                                                             </div>

                                                             {/* Interests/Focus Areas */}
                                                             <div className="flex flex-wrap gap-2">
                                                                 {donor.interests.map((interest, idx) => (
                                                                     <Web3Badge key={idx} type="info">
                                                                         {interest}
                                                                     </Web3Badge>
                                                                 ))}
                                                             </div>

                                                             {/* Action Buttons */}
                                                             <div className="flex items-center gap-3 pt-3 border-t border-border">
                                                                 <Button 
                                                                     variant="outline"
                                                                     size="sm"
                                                                     onClick={(e) => {
                                                                         e.stopPropagation();
                                                                         setViewingDonorId(donor.id);
                                                                     }}
                                                                 >
                                                                     <UserCircle size={14} className="mr-1" />
                                                                     View Profile
                                                                 </Button>
                                                                 {connectionStatus === ConnectionStatus.NONE && (
                                                                     <Button 
                                                                         size="sm"
                                                                         className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                                                         onClick={(e) => {
                                                                             e.stopPropagation();
                                                                             setConnectingInvestor(donor);
                                                                         }}
                                                                     >
                                                                         <Send size={14} className="mr-1" />
                                                                         Connect
                                                                     </Button>
                                                                 )}
                                                                 {connectionStatus === ConnectionStatus.PENDING && (
                                                                     <Button size="sm" variant="secondary" disabled>
                                                                         <Clock size={14} className="mr-1" />
                                                                         Pending
                                                                     </Button>
                                                                 )}
                                                                 {connectionStatus === ConnectionStatus.CONNECTED && (
                                                                     <Button 
                                                                         size="sm"
                                                                         className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                                                                         onClick={(e) => {
                                                                             e.stopPropagation();
                                                                             setSelectedContactId(donor.id);
                                                                             setActiveTab('messages');
                                                                         }}
                                                                     >
                                                                         <MessageSquare size={14} className="mr-1" />
                                                                         Message
                                                                     </Button>
                                                                 )}
                                                             </div>
                                                         </div>
                                                     </div>
                                                 </Card>
                                             );
                                         })}
                                     </div>
                                 ) : (
                                     <Card className="text-center py-8">
                                         <Sparkles size={32} className="mx-auto mb-3 text-muted-foreground" />
                                         <p className="text-muted-foreground">No recommendations available yet</p>
                                         <p className="text-xs text-muted-foreground mt-1">Create a campaign to get matched with investors</p>
                                     </Card>
                                 )}
                             </div>
                         )}
                     </>
                 )}
             </div>
         )}

         {activeTab === 'messages' && (
             <div className="h-full flex bg-background">
                 {/* Contact List */}
                 <div className="w-80 border-r border-border flex flex-col bg-card/50">
                     <div className="p-4 border-b border-border">
                         <h2 className="font-bold text-lg mb-4 text-foreground">Messages</h2>
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
                             <input className="w-full bg-muted rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search conversations..." />
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto">
                         {Object.keys(conversations).map((donorId) => {
                             const convo = conversations[donorId];
                             const donor = users.find(u => u.id === donorId);
                             if (!donor) return null;
                             return (
                                 <div 
                                    key={donorId} 
                                    onClick={() => setSelectedContactId(donorId)}
                                    className={`p-4 flex gap-3 cursor-pointer hover:bg-muted/50 border-b border-border ${selectedContactId === donorId ? 'bg-muted' : ''}`}
                                 >
                                     <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                         {donor.name.charAt(0)}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="flex justify-between items-baseline">
                                             <h4 className="font-medium truncate text-foreground">{donor.name}</h4>
                                             <span className="text-xs text-muted-foreground">{convo.lastTime}</span>
                                         </div>
                                         <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                                     </div>
                                     {convo.unread > 0 && (
                                         <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                                             {convo.unread}
                                         </div>
                                     )}
                                 </div>
                             );
                         })}
                     </div>
                 </div>
                 
                 {/* Chat Area */}
                 <div className="flex-1 flex flex-col">
                     {selectedContactId && conversations[selectedContactId] ? (
                         (() => {
                             const selectedDonor = users.find(u => u.id === selectedContactId);
                             const currentConvo = conversations[selectedContactId];
                             return (
                                 <>
                                    <div className="p-4 border-b border-border flex justify-between items-center bg-card/50 backdrop-blur">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                                                {selectedDonor?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{selectedDonor?.name}</h3>
                                                <p className="text-xs text-muted-foreground">{selectedDonor?.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setViewingDonorId(selectedContactId)}
                                            >
                                                View Profile
                                            </Button>
                                            <Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-background/50">
                                        {currentConvo.messages.map((m, idx) => (
                                            <div key={idx} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] space-y-2`}>
                                                    <div className={`rounded-2xl px-4 py-2 ${m.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                                                        <p className="text-sm">{m.text}</p>
                                                        <span className="text-[10px] opacity-70 mt-1 block text-right">{m.time}</span>
                                                    </div>
                                                    {m.attachment && (
                                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card ${m.sender === 'me' ? 'ml-auto' : ''}`}>
                                                            <FileText size={16} className="text-primary" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-foreground truncate">{m.attachment.name}</p>
                                                                <p className="text-[10px] text-muted-foreground uppercase">{m.attachment.type}</p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                                Download
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-border bg-card">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                                                <ImageIcon size={18} />
                                            </Button>
                                            <input 
                                                className="flex-1 bg-muted rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Type a message..."
                                                value={messageInput}
                                                onChange={e => setMessageInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <Button size="sm" className="rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90 border-0" onClick={handleSendMessage}>
                                                <Send size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                 </>
                             );
                         })()
                     ) : (
                         <div className="flex-1 flex items-center justify-center text-muted-foreground bg-background/50">
                             <div className="text-center">
                                 <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                 <p>Select a conversation to start messaging.</p>
                             </div>
                         </div>
                     )}
                 </div>
             </div>
         )}
         
         {activeTab === 'wallet' && (
             <div className="mx-auto p-6 space-y-8">
                 <h1 className="text-2xl font-bold">Wallet & Earnings</h1>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <Card className="bg-gradient-to-br from-blue-900/40 to-black border-blue-500/30 col-span-2">
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <p className="text-sm text-zinc-400">Total Balance</p>
                                 <h2 className="text-4xl font-bold text-white mt-1">UGX {currentUser?.balance.toLocaleString()}</h2>
                             </div>
                             <div className="bg-emerald-950/30 p-2 rounded-full">
                                 <TrendingUp className="text-emerald-500" />
                             </div>
                         </div>
                         <div className="flex gap-4">
                             <Button
                               className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                               onClick={() => setShowWithdrawalModal(true)}
                             >
                               Withdraw
                             </Button>
                             <Button variant="secondary" className="flex-1">Add Funds</Button>
                         </div>
                     </Card>
                     
                     <Card className="bg-zinc-900 border-zinc-800">
                         <h3 className="font-semibold mb-4 text-zinc-300">Quick Stats</h3>
                         <div className="space-y-4">
                             <div className="flex justify-between text-sm">
                                 <span className="text-zinc-500">Pending</span>
                                 <span className="text-white">UGX 4,500,000</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-zinc-500">Available</span>
                                 <span className="text-white">UGX {currentUser?.balance.toLocaleString()}</span>
                             </div>
                             <div className="w-full bg-zinc-800 h-px"></div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-zinc-500">Total Raised</span>
                                 <span className="text-white">UGX {currentUser?.totalRaised?.toLocaleString() || '0'}</span>
                             </div>
                         </div>
                     </Card>
                 </div>

                 <div>
                     <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
                     <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                         {getTransactionsByUser(currentUser?.id || '').slice(0, 10).map((tx) => {
                             const isIncoming = tx.type === TransactionType.FUND_RELEASE || tx.type === TransactionType.DEPOSIT;
                             const isWithdrawal = tx.type === TransactionType.WITHDRAWAL;
                             return (
                                 <div key={tx.id} className="flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                                     <div className="flex items-center gap-4">
                                         <div className={`p-2 rounded-full ${
                                             isIncoming ? 'bg-emerald-950/50 text-emerald-500' :
                                             isWithdrawal ? 'bg-red-950/50 text-red-500' :
                                             'bg-zinc-800 text-zinc-400'
                                         }`}>
                                             {isIncoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                         </div>
                                         <div>
                                             <p className="font-medium text-white">{tx.description || tx.type}</p>
                                             <p className="text-xs text-zinc-500">
                                                 {tx.counterparty} • {new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                             </p>
                                         </div>
                                     </div>
                                     <div className="text-right flex flex-col items-end gap-1">
                                         <p className={`font-bold ${isIncoming ? 'text-emerald-400' : 'text-white'}`}>
                                             {isIncoming ? '+' : '-'} UGX {tx.amount.toLocaleString()}
                                         </p>
                                         <span className={`text-xs px-2 py-0.5 rounded ${
                                             tx.status === 'COMPLETED' ? 'bg-emerald-900/50 text-emerald-400' :
                                             tx.status === 'PROCESSING' ? 'bg-amber-900/50 text-amber-400' :
                                             'bg-zinc-800 text-zinc-400'
                                         }`}>
                                             {tx.status}
                                         </span>
                                     </div>
                                 </div>
                             );
                         })}
                         {getTransactionsByUser(currentUser?.id || '').length === 0 && (
                             <div className="p-8 text-center text-zinc-500">
                                 No transactions yet
                             </div>
                         )}
                     </div>
                 </div>

                 {/* Payment Methods Section */}
                 <div>
                     <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
                     <div className="space-y-3">
                         {getPaymentMethodsByUser(currentUser?.id || '').length > 0 ? (
                             <>
                                 {getPaymentMethodsByUser(currentUser?.id || '').map((method) => (
                                     <PaymentMethodCard
                                         key={method.id}
                                         method={method}
                                         onSetDefault={setDefaultPaymentMethod}
                                         onDelete={deletePaymentMethod}
                                     />
                                 ))}
                             </>
                         ) : (
                             <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
                                 <p className="text-zinc-500 mb-4">No payment methods added yet</p>
                                 <p className="text-sm text-zinc-600">Add a payment method to withdraw your funds</p>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'profile' && (
             <div className="mx-auto mt-12 p-6 space-y-6">
                 {/* Statistics Card */}
                 <Card title="Profile Overview">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="text-center">
                             <p className="text-3xl font-bold text-white">UGX {(currentUser?.totalRaised || 0).toLocaleString()}</p>
                             <p className="text-sm text-zinc-400 mt-1">Total Raised</p>
                         </div>
                         <div className="text-center">
                             <p className="text-3xl font-bold text-white">{currentUser?.activeProjects || myProjects.length}</p>
                             <p className="text-sm text-zinc-400 mt-1">Active Projects</p>
                         </div>
                         <div className="text-center">
                             <div className="flex items-center justify-center gap-2">
                                 {currentUser?.verified ? (
                                     <Web3Badge type="success">Verified</Web3Badge>
                                 ) : (
                                     <Web3Badge type="warning">Unverified</Web3Badge>
                                 )}
                             </div>
                             <p className="text-sm text-zinc-400 mt-1">Status</p>
                         </div>
                     </div>
                 </Card>

                 {/* Personal Information */}
                 <Card title="Personal Information">
                     <div className="space-y-6">
                         <div className="flex items-center gap-4">
                             <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                 <span className="text-2xl font-bold text-white">{currentUser?.name.charAt(0)}</span>
                             </div>
                             <Button variant="outline" size="sm">Change Avatar</Button>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <Input
                                 label="Display Name"
                                 value={profileForm.name}
                                 onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                             />
                             <Input
                                 label="Email"
                                 value={profileForm.email}
                                 onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                             />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <Input
                                 label="Location"
                                 value={profileForm.location}
                                 onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                                 placeholder="San Francisco, CA"
                             />
                             <div>
                                 <label className="text-sm font-medium text-zinc-300 mb-1 block">Wallet Address</label>
                                 <input
                                     type="text"
                                     value={currentUser?.walletAddress || ''}
                                     disabled
                                     className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-500"
                                 />
                             </div>
                         </div>
                         <div>
                             <label className="text-sm font-medium text-zinc-300 mb-1 block">Bio</label>
                             <textarea
                                 className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm focus:ring-1 focus:ring-indigo-500"
                                 rows={4}
                                 value={profileForm.bio}
                                 onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                             />
                         </div>
                     </div>
                 </Card>

                 {/* Professional Information */}
                 <Card title="Professional Information">
                     <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                             <Input
                                 label="Website / Portfolio"
                                 value={profileForm.website}
                                 onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                                 placeholder="https://yourwebsite.com"
                             />
                             <Input
                                 label="LinkedIn Username"
                                 value={profileForm.linkedin}
                                 onChange={(e) => setProfileForm({...profileForm, linkedin: e.target.value})}
                                 placeholder="your-username"
                             />
                         </div>

                         {/* Specialties */}
                         <div>
                             <label className="text-sm font-medium text-zinc-300 mb-2 block">Specialties</label>
                             <div className="flex flex-wrap gap-2 mb-3">
                                 {profileForm.specialties.map((specialty, idx) => (
                                     <Web3Badge key={idx} type="info">
                                         {specialty}
                                         <button
                                             onClick={() => setProfileForm({
                                                 ...profileForm,
                                                 specialties: profileForm.specialties.filter((_, i) => i !== idx)
                                             })}
                                             className="ml-2 text-zinc-400 hover:text-white"
                                         >
                                             ×
                                         </button>
                                     </Web3Badge>
                                 ))}
                             </div>
                             <div className="flex gap-2">
                                 <input
                                     type="text"
                                     value={newSpecialty}
                                     onChange={(e) => setNewSpecialty(e.target.value)}
                                     onKeyPress={(e) => {
                                         if (e.key === 'Enter' && newSpecialty.trim()) {
                                             setProfileForm({
                                                 ...profileForm,
                                                 specialties: [...profileForm.specialties, newSpecialty.trim()]
                                             });
                                             setNewSpecialty('');
                                         }
                                     }}
                                     placeholder="Add specialty (e.g., EdTech, Blockchain)"
                                     className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                                 />
                                 <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => {
                                         if (newSpecialty.trim()) {
                                             setProfileForm({
                                                 ...profileForm,
                                                 specialties: [...profileForm.specialties, newSpecialty.trim()]
                                             });
                                             setNewSpecialty('');
                                         }
                                     }}
                                 >
                                     Add
                                 </Button>
                             </div>
                         </div>

                         {/* Interests */}
                         <div>
                             <label className="text-sm font-medium text-zinc-300 mb-2 block">Interests / Focus Areas</label>
                             <div className="flex flex-wrap gap-2 mb-3">
                                 {profileForm.interests.map((interest, idx) => (
                                     <Web3Badge key={idx} type="success">
                                         {interest}
                                         <button
                                             onClick={() => setProfileForm({
                                                 ...profileForm,
                                                 interests: profileForm.interests.filter((_, i) => i !== idx)
                                             })}
                                             className="ml-2 text-zinc-400 hover:text-white"
                                         >
                                             ×
                                         </button>
                                     </Web3Badge>
                                 ))}
                             </div>
                             <div className="flex gap-2">
                                 <input
                                     type="text"
                                     value={newInterest}
                                     onChange={(e) => setNewInterest(e.target.value)}
                                     onKeyPress={(e) => {
                                         if (e.key === 'Enter' && newInterest.trim()) {
                                             setProfileForm({
                                                 ...profileForm,
                                                 interests: [...profileForm.interests, newInterest.trim()]
                                             });
                                             setNewInterest('');
                                         }
                                     }}
                                     placeholder="Add interest (e.g., Education, Tech)"
                                     className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                                 />
                                 <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => {
                                         if (newInterest.trim()) {
                                             setProfileForm({
                                                 ...profileForm,
                                                 interests: [...profileForm.interests, newInterest.trim()]
                                             });
                                             setNewInterest('');
                                         }
                                     }}
                                 >
                                     Add
                                 </Button>
                             </div>
                         </div>
                     </div>
                 </Card>

                 {/* Save Button */}
                 <div className="flex justify-end">
                     <Button
                         className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-8"
                         onClick={() => {
                             if (currentUser) {
                                 updateUserProfile(currentUser.id, profileForm);
                                 alert('Profile updated successfully!');
                             }
                         }}
                     >
                         Save Changes
                     </Button>
                 </div>
             </div>
         )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <WithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          currentBalance={currentUser?.balance || 0}
        />
      )}
      </div>
    </SidebarProvider>
  );
};