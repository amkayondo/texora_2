import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Project, MatchScore } from '../types';
import { getMatchAnalysis } from '../services/geminiService';
import { Sparkles, ArrowRight, Target, Wallet, ShieldCheck, CheckCircle2, Building2, Globe, MapPin, DollarSign, Briefcase, Link as LinkIcon, Linkedin, X, Coins, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Web3Badge } from '../components/Web3Badge';

export const DonorDashboard: React.FC = () => {
  const { projects, currentUser } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [aiMatches, setAiMatches] = useState<Record<string, MatchScore>>({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [dashboardTab, setDashboardTab] = useState<'discover' | 'portfolio'>('discover');

  // Profile State with detailed investor fields
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    interests: currentUser?.interests || ['Climate Tech', 'DeFi'], // Industry Focus
    email: 'investor@texora.demo', 
    wallet: currentUser?.walletAddress || '0x...',
    ticketSize: '$10k - $50k',
    stage: 'Seed / Series A',
    location: 'Global (Remote)',
    website: 'https://texora.io/investor/demo',
    linkedin: 'linkedin.com/in/demo-investor',
    totalInvested: 450000
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const runMatching = async () => {
        if (!currentUser) return;
        setLoadingAI(true);
        const newMatches: Record<string, MatchScore> = {};
        await Promise.all(projects.map(async (p) => {
             const result = await getMatchAnalysis(p, [currentUser]);
             if (result && result.length > 0) {
                 newMatches[p.id] = result[0];
             }
        }));
        setAiMatches(newMatches);
        setLoadingAI(false);
    };
    runMatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = () => {
      setIsEditingProfile(false);
      // Logic to sync with backend/blockchain would go here
      // For now, we just update local state which is already done via onChange
      // In a real app, we'd call an API here.
  };

  const addInterest = () => {
      const newInterest = prompt("Enter new industry focus:");
      if (newInterest && !profileData.interests.includes(newInterest)) {
          setProfileData(prev => ({ ...prev, interests: [...prev.interests, newInterest] }));
      }
  };

  const removeInterest = (interestToRemove: string) => {
      setProfileData(prev => ({ 
          ...prev, 
          interests: prev.interests.filter(i => i !== interestToRemove) 
      }));
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-64px)] bg-black w-full">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
         {activeTab === 'dashboard' && (
             <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Investor Terminal</h1>
                        <p className="text-zinc-400">Manage your capital allocation and discover opportunities.</p>
                    </div>
                    <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                        <button 
                           onClick={() => setDashboardTab('discover')}
                           className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${dashboardTab === 'discover' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                           Discover
                        </button>
                        <button 
                           onClick={() => setDashboardTab('portfolio')}
                           className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${dashboardTab === 'portfolio' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                           My Portfolio
                        </button>
                    </div>
                </div>

                {selectedProject ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <Button variant="ghost" onClick={() => setSelectedProject(null)} className="mb-4 pl-0 hover:pl-2 transition-all text-zinc-400 hover:text-white">
                         &larr; Back to Listings
                     </Button>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 space-y-6">
                              <Card className="overflow-hidden p-0 border-0 bg-transparent">
                                 <img src={selectedProject.imageUrl} alt="Project" className="w-full h-80 object-cover rounded-xl shadow-2xl" />
                              </Card>
                              
                              <div className="space-y-4">
                                 <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                                 <div className="flex items-center gap-2">
                                     <Web3Badge>{selectedProject.category}</Web3Badge>
                                     <Web3Badge type="info">Contract: {selectedProject.smartContractAddress.slice(0,8)}...</Web3Badge>
                                 </div>
                                 <p className="text-zinc-300 leading-relaxed text-lg">{selectedProject.description}</p>
                              </div>

                              <div className="pt-6 border-t border-zinc-800">
                                  <h3 className="text-xl font-semibold mb-4">Milestone Verification</h3>
                                  <MilestoneTracker 
                                     projectId={selectedProject.id}
                                     milestones={selectedProject.milestones}
                                     isOwner={false}
                                     canApprove={true}
                                  />
                              </div>
                         </div>

                         <div className="space-y-6">
                              <Card title="Funding Overview">
                                 <div className="mb-6">
                                     <div className="flex justify-between text-sm mb-2">
                                         <span className="text-zinc-400">Progress</span>
                                         <span className="font-mono text-emerald-400">{Math.round((selectedProject.currentFunding / selectedProject.fundingGoal) * 100)}%</span>
                                     </div>
                                     <div className="w-full bg-zinc-800 rounded-full h-2">
                                         <div 
                                             className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                             style={{ width: `${(selectedProject.currentFunding / selectedProject.fundingGoal) * 100}%` }} 
                                         />
                                     </div>
                                     <div className="flex justify-between mt-4">
                                         <div className="text-center">
                                             <p className="text-2xl font-bold text-white">${selectedProject.currentFunding.toLocaleString()}</p>
                                             <p className="text-xs text-zinc-500 uppercase">Raised</p>
                                         </div>
                                         <div className="text-center">
                                             <p className="text-2xl font-bold text-zinc-500">${selectedProject.fundingGoal.toLocaleString()}</p>
                                             <p className="text-xs text-zinc-500 uppercase">Goal</p>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-4">
                                      <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                          <Sparkles size={16} />
                                          <span className="text-xs font-bold uppercase">AI Insight</span>
                                      </div>
                                      <p className="text-sm text-zinc-300 italic">
                                         "{aiMatches[selectedProject.id]?.reason || "Calculating compatibility..."}"
                                      </p>
                                 </div>
                                 <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0" size="lg">Fund Project</Button>
                              </Card>

                              <Card title="Transparency Data">
                                  <div className="space-y-3">
                                      <div className="flex items-center justify-between text-sm">
                                          <span className="text-zinc-500">Creator</span>
                                          <span className="text-zinc-300">Verified Identity</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                          <span className="text-zinc-500">Contract Audit</span>
                                          <span className="text-emerald-500 flex items-center gap-1"><Target size={12}/> Passed</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                          <span className="text-zinc-500">Milestones</span>
                                          <span className="text-zinc-300">{selectedProject.milestones.length} Phases</span>
                                      </div>
                                  </div>
                              </Card>
                         </div>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {projects.map(project => {
                         const matchData = aiMatches[project.id];
                         const score = matchData?.score || 0;
                         
                         return (
                             <Card key={project.id} className="group relative flex flex-col h-full hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-900/50 border-zinc-800">
                                 <div onClick={() => setSelectedProject(project)} className="flex-1">
                                     <div className="h-48 overflow-hidden rounded-md mb-4 relative">
                                         <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                         {score > 80 && (
                                             <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                 {score}% Match
                                             </div>
                                         )}
                                     </div>

                                     <div className="mb-2">
                                         <Web3Badge>{project.category}</Web3Badge>
                                     </div>

                                     <h3 className="text-xl font-semibold mb-2 line-clamp-1">{project.title}</h3>
                                     <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                                         {project.description}
                                     </p>
                                 </div>

                                 <div className="pt-4 border-t border-zinc-800 mt-auto">
                                     <div className="flex justify-between items-center mb-4">
                                         <div className="text-sm">
                                             <span className="font-semibold text-white">${project.currentFunding.toLocaleString()}</span>
                                             <span className="text-zinc-500"> raised of ${project.fundingGoal.toLocaleString()}</span>
                                         </div>
                                         <span className="text-xs text-zinc-500">{Math.round((project.currentFunding/project.fundingGoal)*100)}%</span>
                                     </div>
                                     <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-4">
                                         <div className="bg-white h-1.5 rounded-full" style={{ width: `${(project.currentFunding/project.fundingGoal)*100}%` }}></div>
                                     </div>
                                     <Button variant="secondary" className="w-full" onClick={() => setSelectedProject(project)}>
                                         View Details
                                     </Button>
                                 </div>
                             </Card>
                         );
                     })}
                  </div>
                )}
             </div>
         )}
         
         {activeTab === 'profile' && (
             <div className=" mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Investor Profile</h1>
                        <p className="text-zinc-400">Manage your decentralized identity and investment thesis.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/30 border border-emerald-900/50 rounded-full text-emerald-400 text-sm font-medium">
                        <ShieldCheck size={16} />
                        <span>Verified Entity</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Identity Card */}
                    <Card className="md:col-span-1 space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mb-4 border-4 border-zinc-950 shadow-xl">
                                {profileData.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-white">{profileData.name}</h2>
                            <p className="text-sm text-zinc-500 mb-4 flex items-center justify-center gap-1">
                                <Globe size={12}/> {profileData.location}
                            </p>
                            
                            <div className="w-full grid grid-cols-2 gap-2 text-center mb-6">
                                <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                    <div className="text-lg font-bold text-white">12</div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Investments</div>
                                </div>
                                <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                    <div className="text-lg font-bold text-emerald-400">${(profileData.totalInvested / 1000)}k</div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Deployed</div>
                                </div>
                            </div>
                            
                            <div className="w-full flex justify-center gap-4">
                                {profileData.website && (
                                    <a href={profileData.website} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                                        <LinkIcon size={16} />
                                    </a>
                                )}
                                {profileData.linkedin && (
                                    <a href={`https://${profileData.linkedin}`} target="_blank" rel="noreferrer" className="p-2 bg-blue-900/20 rounded-full text-blue-500 hover:text-blue-400 transition-colors">
                                        <Linkedin size={16} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase">Investment Thesis</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm p-2 bg-zinc-900/50 rounded">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <DollarSign size={14} className="text-zinc-500" /> Ticket Size
                                    </div>
                                    <span className="font-mono text-white">{profileData.ticketSize}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-zinc-900/50 rounded">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Target size={14} className="text-zinc-500" /> Stage
                                    </div>
                                    <span className="font-mono text-white">{profileData.stage}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-zinc-900/50 rounded">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Briefcase size={14} className="text-zinc-500" /> Focus Area
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
                                        {profileData.interests.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{tag}</span>
                                        ))}
                                        {profileData.interests.length > 3 && <span className="text-[10px] text-zinc-500">+{profileData.interests.length - 3}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Right Column: Edit Form & Portfolio */}
                    <div className="md:col-span-2 space-y-6">
                        <Card title="Investor Details">
                            <div className="space-y-6 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input 
                                        label="Entity Name" 
                                        value={profileData.name} 
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        disabled={!isEditingProfile}
                                    />
                                    <Input 
                                        label="Contact Email" 
                                        value={profileData.email} 
                                        disabled 
                                        className="opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-zinc-300 mb-2 block">Bio / Strategy</label>
                                    <textarea 
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                        rows={3}
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                        disabled={!isEditingProfile}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <Input 
                                        label="Location"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                        disabled={!isEditingProfile}
                                     />
                                     <Input 
                                        label="Website / Portfolio URL"
                                        value={profileData.website}
                                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                                        disabled={!isEditingProfile}
                                     />
                                </div>

                                {isEditingProfile && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                             <Input 
                                                label="Ticket Size Range"
                                                value={profileData.ticketSize}
                                                onChange={(e) => setProfileData({...profileData, ticketSize: e.target.value})}
                                             />
                                             <Input 
                                                label="Investment Stage"
                                                value={profileData.stage}
                                                onChange={(e) => setProfileData({...profileData, stage: e.target.value})}
                                             />
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-zinc-300 mb-2 block">Industry Focus (Tags)</label>
                                            <div className="flex flex-wrap gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg min-h-[60px]">
                                                {profileData.interests.map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-500/30 rounded text-xs flex items-center gap-1 animate-in zoom-in-50">
                                                        {tag}
                                                        <button 
                                                            onClick={() => removeInterest(tag)}
                                                            className="hover:text-white ml-1 focus:outline-none"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                                <button 
                                                    onClick={addInterest}
                                                    className="px-2 py-1 bg-zinc-800 text-zinc-400 border border-dashed border-zinc-600 rounded text-xs hover:text-white hover:border-zinc-400 transition-colors"
                                                >
                                                    + Add Tag
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                                    {isEditingProfile ? (
                                        <>
                                            <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                                            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white border-0">Save Changes</Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setIsEditingProfile(true)} variant="outline">Edit Strategy</Button>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card title="Active Portfolio">
                            <div className="space-y-4 mt-2">
                                {/* Mock Portfolio Items */}
                                <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-blue-900/20 text-blue-500 flex items-center justify-center font-bold">
                                            D
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Decentralized Schooling</h4>
                                            <p className="text-xs text-zinc-500">Education • Seed Round</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">$25,000</p>
                                        <p className="text-xs text-emerald-400">Active</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-purple-900/20 text-purple-500 flex items-center justify-center font-bold">
                                            A
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">AI Cancer Detection</h4>
                                            <p className="text-xs text-zinc-500">Healthcare • Series A</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">$50,000</p>
                                        <p className="text-xs text-emerald-400">Active</p>
                                    </div>
                                </div>
                                
                                <Button variant="ghost" className="w-full text-zinc-500">View All Investments</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
         )}
         
         {activeTab === 'wallet' && (
             <div className=" mx-auto p-8 space-y-8 animate-in fade-in">
                 <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-zinc-800">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Assets & Tokens</h1>
                        <p className="text-zinc-400">Manage your digital portfolio and track cross-chain liquidity.</p>
                    </div>
                    <Button variant="outline" className="gap-2"><RefreshCw size={14}/> Sync On-Chain Data</Button>
                 </div>

                 {/* Asset Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-950 to-zinc-950 border-blue-900/50">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Wallet size={20} />
                            </div>
                            <Web3Badge type="info">+2.4%</Web3Badge>
                        </div>
                        <div className="mt-4">
                            <span className="text-zinc-400 text-sm">Total Balance</span>
                            <h3 className="text-3xl font-bold text-white mt-1">${currentUser?.balance.toLocaleString()}</h3>
                            <p className="text-xs text-zinc-500 mt-2">Available across 3 networks</p>
                        </div>
                    </Card>

                    <Card className="bg-zinc-900/50">
                         <div className="flex justify-between items-start">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Coins size={20} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-zinc-400 text-sm">Texora Token (TXT)</span>
                            <h3 className="text-3xl font-bold text-white mt-1">15,000</h3>
                            <p className="text-xs text-zinc-500 mt-2">~$4,500.00 USD Value</p>
                        </div>
                    </Card>

                    <Card className="bg-zinc-900/50">
                         <div className="flex justify-between items-start">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-zinc-400 text-sm">Staked in Projects</span>
                            <h3 className="text-3xl font-bold text-white mt-1">$75,000</h3>
                            <p className="text-xs text-zinc-500 mt-2">Earning 4.2% APY Yield</p>
                        </div>
                    </Card>
                 </div>
                 
                 {/* Transaction Table */}
                 <Card title="Token Activity">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-zinc-800 text-zinc-500">
                                <tr>
                                    <th className="pb-3 pl-2 font-medium">Type</th>
                                    <th className="pb-3 font-medium">Asset</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">To/From</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 pr-2 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {[
                                    { type: 'Sent', asset: 'USDC', amount: '25,000.00', counterparty: 'Decentralized Schooling', date: 'Oct 24, 2023', status: 'Completed' },
                                    { type: 'Received', asset: 'TXT', amount: '500.00', counterparty: 'Staking Reward', date: 'Oct 22, 2023', status: 'Completed' },
                                    { type: 'Sent', asset: 'ETH', amount: '2.5', counterparty: '0x82...91a', date: 'Oct 20, 2023', status: 'Pending' },
                                    { type: 'Sent', asset: 'USDC', amount: '50,000.00', counterparty: 'AI Cancer Detection', date: 'Oct 15, 2023', status: 'Completed' },
                                ].map((tx, i) => (
                                    <tr key={i} className="group hover:bg-zinc-800/30 transition-colors">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-full ${tx.type === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-700/30 text-zinc-400'}`}>
                                                    {tx.type === 'Received' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                                                </div>
                                                <span className={tx.type === 'Received' ? 'text-emerald-400' : 'text-zinc-300'}>{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 font-mono text-zinc-300">{tx.asset}</td>
                                        <td className="py-4 font-medium text-white">{tx.amount}</td>
                                        <td className="py-4 text-zinc-400">{tx.counterparty}</td>
                                        <td className="py-4 text-zinc-500">{tx.date}</td>
                                        <td className="py-4 pr-2 text-right">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                tx.status === 'Completed' ? 'bg-emerald-950 text-emerald-500' : 'bg-amber-950 text-amber-500'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </Card>
             </div>
         )}
         
         {activeTab !== 'dashboard' && activeTab !== 'profile' && activeTab !== 'wallet' && (
             <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-950/20">
                 <div className="text-center">
                    <Building2 className="mx-auto mb-4 opacity-20" size={48} />
                    <p>Module under development.</p>
                 </div>
             </div>
         )}
      </div>
      </div>
    </SidebarProvider>
  );
};