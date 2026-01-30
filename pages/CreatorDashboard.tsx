import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DonorProfilePage } from './DonorProfilePage';
import { Project, MilestoneStatus, User, TransactionType, ConnectionStatus } from '../types';
import { 
  Plus, LayoutDashboard, Wallet, MessageSquare, UserCircle, 
  Send, Sparkles, LogOut, Search, TrendingUp, ArrowLeft,
  MoreHorizontal, Calendar, Tag, Image as ImageIcon,
  ArrowDownLeft, ArrowUpRight, X
} from 'lucide-react';
import { Web3Badge } from '../components/Web3Badge';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { getDonorRecommendations } from '../services/geminiService';

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
    deletePaymentMethod
  } = useApp();
  const myProjects = projects.filter(p => p.creatorId === currentUser?.id);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'view' | 'create'>('view');
  const [activeProject, setActiveProject] = useState<Project | null>(myProjects[0] || null);
  
  // AI State
  const [recommendedDonors, setRecommendedDonors] = useState<any[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);

  // Connection Flow State
  const [connectingInvestor, setConnectingInvestor] = useState<User | null>(null);

  // Donor Profile View State
  const [viewingDonorId, setViewingDonorId] = useState<string | null>(null);

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

  // Chat State
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([
      { sender: 'them', text: "Hi! I loved your project pitch.", time: "10:30 AM" },
      { sender: 'me', text: "Thanks! We are working hard on the prototype.", time: "10:32 AM" }
  ]);

  // Create Project State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Innovation');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
        if (!activeProject) return;
        setLoadingDonors(true);
        const recommendations = await getDonorRecommendations(activeProject, users);
        setRecommendedDonors(recommendations);
        setLoadingDonors(false);
    };
    if (viewMode === 'view' && activeTab === 'dashboard') {
        fetchRecommendations();
    }
  }, [activeProject, users, viewMode, activeTab]);

  const handleCreate = () => {
    if (!newTitle || !newDesc || !newAmount) return;
    const newProject: Project = {
        id: `p${Date.now()}`,
        creatorId: currentUser?.id || '',
        title: newTitle,
        description: newDesc,
        category: newCategory,
        fundingGoal: parseFloat(newAmount),
        currentFunding: 0,
        smartContractAddress: '0xPENDING...',
        // Using a gradient image
        imageUrl: `https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop`,
        milestones: [
            { id: `m${Date.now()}_1`, title: 'Project Kickoff', description: 'Initial setup and resource allocation.', amount: parseFloat(newAmount) * 0.2, status: MilestoneStatus.PENDING_SUBMISSION, dueDate: '2024-06-01' },
            { id: `m${Date.now()}_2`, title: 'Development Phase', description: 'Core product development.', amount: parseFloat(newAmount) * 0.8, status: MilestoneStatus.LOCKED, dueDate: '2024-09-01' }
        ]
    };
    addProject(newProject);
    setViewMode('view');
    setActiveProject(newProject);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewAmount('');
  };

  const handleSendMessage = () => {
      if(!messageInput) return;
      setMessages([...messages, { sender: 'me', text: messageInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        {/* Sidebar Component */}
        <AppSidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setViewMode('view'); }} />

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
             <div className="max-w-6xl mx-auto p-8 space-y-8">
                 
                 {viewMode === 'create' ? (
                     // CREATE CAMPAIGN VIEW
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                         <div className="mb-6 flex items-center gap-4">
                             <Button variant="ghost" size="sm" onClick={() => setViewMode('view')}>
                                 <ArrowLeft size={16} className="mr-2" /> Back
                             </Button>
                             <h1 className="text-2xl font-bold">Launch New Campaign</h1>
                         </div>
                         
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="lg:col-span-2 space-y-6">
                                 <Card title="Campaign Details">
                                     <div className="space-y-4 mt-2">
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-zinc-300">Project Title</label>
                                             <Input placeholder="e.g. Sustainable Ocean Cleanup" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                                         </div>
                                         
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-zinc-300">Category</label>
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
                                             <label className="text-sm font-medium text-zinc-300">Description</label>
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
                                             <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                                                 <Calendar size={14} /> Automatic Roadmap
                                             </h4>
                                             <p className="text-xs text-zinc-500 mb-4">
                                                 We automatically structure your project into verifiable phases to build trust with donors.
                                             </p>
                                             <div className="space-y-3">
                                                 <div className="flex items-center gap-3 p-3 bg-card rounded border border-border opacity-75">
                                                     <div className="h-6 w-6 rounded-full bg-blue-900/50 text-blue-500 flex items-center justify-center text-xs font-bold">1</div>
                                                     <div className="flex-1">
                                                         <div className="text-sm font-medium text-zinc-300">Project Kickoff</div>
                                                         <div className="text-xs text-zinc-500">20% of funds released upfront</div>
                                                     </div>
                                                 </div>
                                                 <div className="flex items-center gap-3 p-3 bg-card rounded border border-border opacity-75">
                                                     <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</div>
                                                     <div className="flex-1">
                                                         <div className="text-sm font-medium text-zinc-300">Development Phase</div>
                                                         <div className="text-xs text-zinc-500">80% released upon verification</div>
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
                                         <div className="aspect-video bg-zinc-900 rounded-lg border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500">
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
                                         <p className="text-xs text-center text-zinc-500">
                                             By launching, you agree to our terms of service and smart contract deployment fees.
                                         </p>
                                     </div>
                                 </Card>
                             </div>
                         </div>
                     </div>
                 ) : (
                     // VIEW ACTIVE PROJECT VIEW
                     <>
                         <div className="flex justify-between items-center">
                             <div>
                                 <h1 className="text-2xl font-bold">Dashboard</h1>
                                 <p className="text-zinc-400 text-sm">Overview of your active impact.</p>
                             </div>
                             <Button onClick={() => setViewMode('create')} className="bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                                <Plus className="mr-2 h-4 w-4" /> New Campaign
                             </Button>
                         </div>

                         {activeProject ? (
                            <div className="space-y-8">
                                {/* Project Card */}
                                <Card className="bg-card border-border overflow-hidden">
                                     <div className="flex flex-col md:flex-row gap-8">
                                         <div className="md:w-1/3">
                                             <img src={activeProject.imageUrl} alt="Project" className="w-full h-48 md:h-full object-cover rounded-lg shadow-lg" />
                                         </div>
                                         <div className="flex-1 py-2">
                                             <div className="flex justify-between items-start mb-4">
                                                 <div>
                                                     <h2 className="text-2xl font-bold text-foreground mb-2">{activeProject.title}</h2>
                                                     <div className="flex items-center gap-3">
                                                        <Web3Badge>{activeProject.category}</Web3Badge>
                                                        <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                                                            {activeProject.smartContractAddress.slice(0,10)}... <Tag size={10} />
                                                        </span>
                                                     </div>
                                                 </div>
                                                 <Web3Badge type="success">Active</Web3Badge>
                                             </div>
                                             
                                             <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{activeProject.description}</p>

                                             <div className="bg-muted/40 rounded-xl p-4 border border-border/50 mb-6">
                                                 <div className="flex justify-between text-sm mb-2">
                                                     <span className="text-muted-foreground">Total Raised</span>
                                                     <span className="text-foreground font-mono font-bold">${activeProject.currentFunding.toLocaleString()} <span className="text-muted-foreground font-normal">/ ${activeProject.fundingGoal.toLocaleString()}</span></span>
                                                 </div>
                                                 <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                     <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" style={{ width: `${(activeProject.currentFunding/activeProject.fundingGoal)*100}%` }}></div>
                                                 </div>
                                             </div>

                                             <div className="flex gap-3">
                                                 <Button size="sm" variant="secondary">Edit Details</Button>
                                                 <Button size="sm" variant="outline" className="gap-2">
                                                     Milestones <span className="bg-zinc-800 text-zinc-400 px-1.5 rounded-full text-[10px]">{activeProject.milestones.length}</span>
                                                 </Button>
                                             </div>
                                         </div>
                                     </div>
                                </Card>

                                {/* Recommended Investors Feed */}
                                <div>
                                     <div className="flex items-center justify-between mb-4 mt-8">
                                         <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Sparkles className="text-blue-500" size={18} /> Recommended Investors
                                         </h3>
                                         <span className="text-xs text-zinc-500">Based on your project category</span>
                                     </div>
                                     
                                     <div className="space-y-4 max-w-3xl mx-auto md:mx-0">
                                         {loadingDonors && (
                                            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl">
                                                <div className="animate-spin h-6 w-6 border-2 border-zinc-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                                <p className="text-zinc-500 text-sm">Matching with investor network...</p>
                                            </div>
                                         )}
                                         
                                         {!loadingDonors && recommendedDonors.map((rec, idx) => {
                                             const donor = users.find(u => u.id === rec.donorId);
                                             if (!donor) return null;

                                             const connectionStatus = getConnectionStatus(currentUser?.id || '', donor.id);
                                             const maxInvestmentCap = 200000000; // UGX 200M
                                             const currentlyInvested = donor.totalInvested || 0;
                                             const availableCapacity = maxInvestmentCap - currentlyInvested;

                                             return (
                                                <div key={idx} className="bg-card rounded-xl p-5 border border-border hover:border-muted-foreground transition-all">
                                                    {/* Header Row */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                                                                {donor.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-foreground">{donor.name}</h4>
                                                                <p className="text-xs text-zinc-500">{donor.location || 'Uganda'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                                                                <Sparkles size={12} /> {rec.score}% Match
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Investment Capacity */}
                                                    <div className="mb-3 p-3 bg-zinc-800/50 rounded-lg">
                                                        <p className="text-xs text-zinc-400">Investment Capacity</p>
                                                        <p className="font-bold text-foreground">UGX {availableCapacity.toLocaleString()}</p>
                                                        <p className="text-xs text-zinc-500">of UGX 200M limit</p>
                                                    </div>

                                                    {/* Interests */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {donor.interests.slice(0, 3).map((interest, i) => (
                                                            <span key={i} className="text-xs px-2 py-1 bg-indigo-950/50 text-indigo-400 rounded">
                                                                {interest}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Why they might invest */}
                                                    <div className="mb-4 text-sm text-zinc-300 leading-relaxed">
                                                        <span className="text-zinc-500 font-medium">Why they might invest:</span> "{rec.pitchTip}"
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        {connectionStatus === ConnectionStatus.NONE && (
                                                            <>
                                                                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0" onClick={() => setConnectingInvestor(donor)}>
                                                                    <Send size={14} className="mr-1" /> Connect
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => setViewingDonorId(donor.id)}>View Profile</Button>
                                                            </>
                                                        )}
                                                        {connectionStatus === ConnectionStatus.PENDING && (
                                                            <div className="flex-1 text-center py-2 bg-amber-900/30 border border-amber-700/50 text-amber-400 rounded-lg text-sm font-medium">
                                                                Connection Pending
                                                            </div>
                                                        )}
                                                        {connectionStatus === ConnectionStatus.CONNECTED && (
                                                            <>
                                                                <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-primary-foreground border-0">
                                                                    <MessageSquare size={14} className="mr-1" /> Message
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={() => setViewingDonorId(donor.id)}>View Profile</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                             )
                                         })}
                                     </div>
                                </div>
                            </div>
                         ) : (
                            <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                                <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                                    <LayoutDashboard size={32} />
                                </div>
                                <h3 className="text-xl font-medium text-foreground mb-2">No Active Campaigns</h3>
                                <p className="text-zinc-500 mb-6 max-w-md mx-auto">Start a new project to automatically generate smart contracts and get matched with verified investors.</p>
                                <Button size="lg" onClick={() => setViewMode('create')} className="bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                                    <Plus className="mr-2 h-4 w-4" /> Start First Campaign
                                </Button>
                            </div>
                         )}
                     </>
                 )}
             </div>
         )}

         {activeTab === 'messages' && (
             <div className="h-full flex bg-background">
                 {/* Contact List */}
                 <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/20">
                     <div className="p-4 border-b border-zinc-800">
                         <h2 className="font-bold text-lg mb-4">Messages</h2>
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 text-zinc-500" size={14} />
                             <input className="w-full bg-zinc-900 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Search investors..." />
                         </div>
                     </div>
                     <div className="flex-1 overflow-y-auto">
                         {[1,2,3].map(i => (
                             <div 
                                key={i} 
                                onClick={() => setSelectedContactId(i.toString())}
                                className={`p-4 flex gap-3 cursor-pointer hover:bg-zinc-900 border-b border-zinc-900 ${selectedContactId === i.toString() ? 'bg-zinc-900' : ''}`}
                             >
                                 <div className="h-10 w-10 rounded-full bg-zinc-800"></div>
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-baseline">
                                         <h4 className="font-medium truncate text-foreground">Investor Name</h4>
                                         <span className="text-xs text-zinc-600">10:30 AM</span>
                                     </div>
                                     <p className="text-xs text-zinc-500 truncate">I'm interested in funding the next milestone.</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 
                 {/* Chat Area */}
                 <div className="flex-1 flex flex-col">
                     {selectedContactId ? (
                         <>
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50 backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
                                    <h3 className="font-bold text-foreground">Investor Name</h3>
                                </div>
                                <Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button>
                            </div>
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                                            <p className="text-sm">{m.text}</p>
                                            <span className="text-[10px] opacity-70 mt-1 block text-right">{m.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-zinc-900 rounded-full px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button size="sm" className="rounded-full h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 border-0" onClick={handleSendMessage}>
                                        <Send size={16} />
                                    </Button>
                                </div>
                            </div>
                         </>
                     ) : (
                         <div className="flex-1 flex items-center justify-center text-zinc-500 bg-zinc-950/50">
                             <div className="text-center">
                                 <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                 <p>Select a conversation to start encrypted messaging.</p>
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