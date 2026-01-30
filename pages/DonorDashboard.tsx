import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { InvestmentModal } from '../components/InvestmentModal';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Project } from '../types';
import { Sparkles, ArrowRight, Target, Wallet, ShieldCheck, CheckCircle2, Building2, Globe, MapPin, DollarSign, Briefcase, Link as LinkIcon, Linkedin, X, Coins, TrendingUp, RefreshCw, ArrowUpRight, ArrowDownLeft, Send, MessageCircle, User, Clock, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Web3Badge } from '../components/Web3Badge';
import { MatchScore } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'sonner';

export const DonorDashboard: React.FC = () => {
  const { projects, currentUser, users, createInvestment, getInvestmentsByDonor, getTransactionsByUser, getUserConversations, getConversationMessages, sendMessage } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [investingProject, setInvestingProject] = useState<Project | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [aiMatches, setAiMatches] = useState<Record<string, MatchScore>>({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'discover' | 'portfolio'>('discover');

  // Discovery filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'progress' | 'recent'>('match');

  // Profile editing
  const [newInterestInput, setNewInterestInput] = useState('');

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
    // Generate match scores from JSON data (no AI)
    if (!currentUser) return;
    const newMatches: Record<string, MatchScore> = {};
    projects.forEach((p) => {
        // Calculate match based on interest overlap
        const interestOverlap = currentUser.interests.some(interest => 
            p.category.toLowerCase().includes(interest.toLowerCase()) ||
            interest.toLowerCase().includes(p.category.toLowerCase())
        );
        newMatches[p.id] = {
            projectId: p.id,
            donorId: currentUser.id,
            score: interestOverlap ? 90 + Math.floor(Math.random() * 8) : 75 + Math.floor(Math.random() * 15),
            reason: `Based on your interest in ${currentUser.interests[0]} and the project's focus on ${p.category}.`
        };
    });
    setAiMatches(newMatches);
  }, [currentUser, projects]);

  const handleSaveProfile = () => {
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!', {
        description: 'Your investor profile has been saved'
      });
      // Logic to sync with backend/blockchain would go here
      // For now, we just update local state which is already done via onChange
      // In a real app, we'd call an API here.
  };

  const addInterest = () => {
      if (newInterestInput.trim() && !profileData.interests.includes(newInterestInput.trim())) {
          setProfileData(prev => ({ ...prev, interests: [...prev.interests, newInterestInput.trim()] }));
          setNewInterestInput('');
      }
  };

  const removeInterest = (interestToRemove: string) => {
      setProfileData(prev => ({ 
          ...prev, 
          interests: prev.interests.filter(i => i !== interestToRemove) 
      }));
  };

  // Handle project selection from sidebar
  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setActiveTab('dashboard');
      setDashboardTab('discover');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onProjectSelect={handleProjectSelect}
        />
      
      <div className="flex-1 overflow-y-auto h-screen">
         {activeTab === 'dashboard' && (
             <div className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Investor Terminal</h1>
                        <p className="text-muted-foreground">Manage your capital allocation and discover opportunities.</p>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg border border-border">
                        <button 
                           onClick={() => setDashboardTab('discover')}
                           className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${dashboardTab === 'discover' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                           Discover
                        </button>
                        <button 
                           onClick={() => setDashboardTab('portfolio')}
                           className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${dashboardTab === 'portfolio' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                           My Portfolio
                        </button>
                    </div>
                </div>

                {/* DISCOVER TAB */}
               {dashboardTab === 'discover' && selectedProject ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <Button variant="ghost" onClick={() => setSelectedProject(null)} className="mb-4 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground">
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

                              <div className="pt-6 border-t border-border">
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
                                             <p className="text-2xl font-bold text-foreground">${selectedProject.currentFunding.toLocaleString()}</p>
                                             <p className="text-xs text-zinc-500 uppercase">Raised</p>
                                         </div>
                                         <div className="text-center">
                                             <p className="text-2xl font-bold text-zinc-500">${selectedProject.fundingGoal.toLocaleString()}</p>
                                             <p className="text-xs text-zinc-500 uppercase">Goal</p>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-muted p-4 rounded-lg border border-border mb-4">
                                      <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                          <Sparkles size={16} />
                                          <span className="text-xs font-bold uppercase">AI Insight</span>
                                      </div>
                                      <p className="text-sm text-zinc-300 italic">
                                         "{aiMatches[selectedProject.id]?.reason || "Calculating compatibility..."}"
                                      </p>
                                 </div>
                                 <Button
                                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-primary-foreground border-0"
                                   size="lg"
                                   onClick={() => {
                                     setInvestingProject(selectedProject);
                                     setShowInvestmentModal(true);
                                   }}
                                 >
                                   Fund Project
                                 </Button>
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
                ) : null}

               {/* DISCOVER TAB - Project Grid */}
               {dashboardTab === 'discover' && !selectedProject && (() => {
                  // Filter and sort projects
                  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

                  const filteredProjects = projects
                    .filter(p => {
                      const matchesSearch = p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                           p.description.toLowerCase().includes(debouncedSearch.toLowerCase());
                      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'match') {
                        return (aiMatches[b.id]?.score || 0) - (aiMatches[a.id]?.score || 0);
                      } else if (sortBy === 'progress') {
                        return (b.currentFunding / b.fundingGoal) - (a.currentFunding / a.fundingGoal);
                      } else {
                        return 0; // 'recent' - keep original order
                      }
                    });

                  return (
                    <>
                      {/* Search, Filter, Sort Bar */}
                      <div className="mb-6 space-y-4">
                        {/* Stats Banner */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <Briefcase size={16} />
                              <span className="text-sm">Total Projects</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{projects.length}</p>
                          </div>
                          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <Filter size={16} />
                              <span className="text-sm">Showing</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{filteredProjects.length}</p>
                          </div>
                          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                              <Sparkles size={16} />
                              <span className="text-sm">Avg Match Score</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                              {aiMatches && Object.keys(aiMatches).length > 0 ? Math.round(
                                Object.values(aiMatches).reduce((sum, m) => sum + m.score, 0) /
                                Object.values(aiMatches).length
                              ) : 0}%
                            </p>
                          </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-3">
                          {/* Search */}
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <Input
                              type="text"
                              placeholder="Search projects..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
                            />
                          </div>

                          {/* Category Filter */}
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>

                          {/* Sort */}
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'match' | 'progress' | 'recent')}
                            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="match">Sort: Match Score</option>
                            <option value="progress">Sort: Funding Progress</option>
                            <option value="recent">Sort: Recently Added</option>
                          </select>
                        </div>
                      </div>

                      {/* Project Grid */}
                      {filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProjects.map(project => {
                         const matchData = aiMatches[project.id];
                         const score = matchData?.score || 0;
                         
                         return (
                             <Card key={project.id} className="group relative flex flex-col h-full hover:border-muted-foreground transition-colors cursor-pointer bg-card border-border">
                                 <div onClick={() => setSelectedProject(project)} className="flex-1">
                                     <div className="h-48 overflow-hidden rounded-md mb-4 relative">
                                         <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                         {score > 80 && (
                                             <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
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

                                 <div className="pt-4 border-t border-border mt-auto">
                                     <div className="flex justify-between items-center mb-4">
                                         <div className="text-sm">
                                             <span className="font-semibold text-foreground">${project.currentFunding.toLocaleString()}</span>
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
                      ) : (
                        <div className="flex items-center justify-center py-16 text-zinc-500">
                          <div className="text-center">
                            <Search className="mx-auto mb-4 opacity-20" size={64} />
                            <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                            <p className="text-sm mb-4">Try adjusting your search or filters</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                              }}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

               {/* PORTFOLIO TAB */}
               {dashboardTab === 'portfolio' && (
                  <div className="space-y-6">
                     {/* Portfolio Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="text-center p-6">
                           <p className="text-3xl font-bold text-white">
                              {getInvestmentsByDonor(currentUser?.id || '').length}
                           </p>
                           <p className="text-sm text-zinc-400 mt-1">Active Investments</p>
                        </Card>
                        <Card className="text-center p-6">
                           <p className="text-3xl font-bold text-emerald-400">
                              UGX {(currentUser?.totalInvested || 0).toLocaleString()}
                           </p>
                           <p className="text-sm text-zinc-400 mt-1">Total Invested</p>
                        </Card>
                        <Card className="text-center p-6">
                           <p className="text-3xl font-bold text-white">
                              {Math.round((getInvestmentsByDonor(currentUser?.id || '').reduce((sum, inv) => {
                                 const project = projects.find(p => p.id === inv.projectId);
                                 return sum + ((project?.currentFunding || 0) / (project?.fundingGoal || 1));
                              }, 0) / Math.max(getInvestmentsByDonor(currentUser?.id || '').length, 1)) * 100) || 0}%
                           </p>
                           <p className="text-sm text-zinc-400 mt-1">Avg Project Progress</p>
                        </Card>
                     </div>

                     {/* Investment List */}
                     {getInvestmentsByDonor(currentUser?.id || '').length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {getInvestmentsByDonor(currentUser?.id || '').map(investment => {
                              const project = projects.find(p => p.id === investment.projectId);
                              if (!project) return null;

                              const progress = Math.round((project.currentFunding / project.fundingGoal) * 100);

                              return (
                                 <Card key={investment.id} className="group relative flex flex-col h-full hover:border-emerald-500 transition-colors cursor-pointer">
                                    <div onClick={() => {
                                       setSelectedProject(project);
                                       setDashboardTab('discover');
                                    }} className="flex-1">
                                       <div className="h-48 overflow-hidden rounded-md mb-4 relative">
                                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                          <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                             Invested
                                          </div>
                                       </div>

                                       <div className="mb-2">
                                          <Web3Badge>{project.category}</Web3Badge>
                                       </div>

                                       <h3 className="text-xl font-semibold mb-2 line-clamp-1">{project.title}</h3>
                                       <p className="text-zinc-400 text-sm mb-4">
                                          Invested: <span className="text-emerald-400 font-bold">UGX {investment.amount.toLocaleString()}</span>
                                       </p>
                                       <p className="text-xs text-zinc-500">
                                          {new Date(investment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                       </p>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-800 mt-auto">
                                       <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs text-zinc-500">Project Progress</span>
                                          <span className="text-xs text-zinc-400">{progress}%</span>
                                       </div>
                                       <div className="w-full bg-zinc-800 h-1.5 rounded-full mb-4">
                                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                       </div>
                                       <div className="flex items-center justify-between text-xs">
                                          <span className={`px-2 py-1 rounded ${
                                             investment.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                                          }`}>
                                             {investment.status}
                                          </span>
                                          <span className="text-zinc-500">
                                             {project.milestones.filter(m => m.status === 'APPROVED').length}/{project.milestones.length} milestones
                                          </span>
                                       </div>
                                    </div>
                                 </Card>
                              );
                           })}
                        </div>
                     ) : (
                        <Card className="p-12 text-center">
                           <div className="mb-4 text-zinc-600">
                              <Coins size={64} className="mx-auto mb-4 opacity-20" />
                           </div>
                           <h3 className="text-xl font-bold text-white mb-2">No Investments Yet</h3>
                           <p className="text-zinc-400 mb-6">Start investing in projects to build your portfolio</p>
                           <Button
                              onClick={() => setDashboardTab('discover')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                           >
                              Discover Projects
                           </Button>
                        </Card>
                     )}
                  </div>
               )}
             </div>
         )}

         {activeTab === 'profile' && (
             <div className=" mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Investor Profile</h1>
                        <p className="text-muted-foreground">Manage your decentralized identity and investment thesis.</p>
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
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-primary-foreground mb-4 border-4 border-background shadow-xl">
                                {profileData.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
                            <p className="text-sm text-zinc-500 mb-4 flex items-center justify-center gap-1">
                                <Globe size={12}/> {profileData.location}
                            </p>
                            
                            <div className="w-full grid grid-cols-2 gap-2 text-center mb-6">
                                <div className="bg-muted p-2 rounded border border-border">
                                    <div className="text-lg font-bold text-foreground">
                                        {getInvestmentsByDonor(currentUser?.id || '').length}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Investments</div>
                                </div>
                                <div className="bg-muted p-2 rounded border border-border">
                                    <div className="text-lg font-bold text-emerald-400">
                                        UGX {(currentUser?.totalInvested || 0).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase">Deployed</div>
                                </div>
                            </div>
                            
                            <div className="w-full flex justify-center gap-4">
                                {profileData.website && (
                                    <a href={profileData.website} target="_blank" rel="noreferrer" className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
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

                        <div className="space-y-4 pt-4 border-t border-border">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase">Investment Thesis</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign size={14} className="text-muted-foreground" /> Ticket Size
                                    </div>
                                    <span className="font-mono text-foreground">{profileData.ticketSize}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Target size={14} className="text-muted-foreground" /> Stage
                                    </div>
                                    <span className="font-mono text-foreground">{profileData.stage}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Briefcase size={14} className="text-muted-foreground" /> Focus Area
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
                                        {profileData.interests.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{tag}</span>
                                        ))}
                                        {profileData.interests.length > 3 && <span className="text-[10px] text-muted-foreground">+{profileData.interests.length - 3}</span>}
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
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    value={newInterestInput}
                                                    onChange={(e) => setNewInterestInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newInterestInput.trim()) {
                                                            e.preventDefault();
                                                            addInterest();
                                                        }
                                                    }}
                                                    placeholder="Add industry focus (e.g., Education, Healthcare)"
                                                    className="flex-1 bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500"
                                                />
                                                <Button
                                                    onClick={addInterest}
                                                    disabled={!newInterestInput.trim()}
                                                    variant="outline"
                                                    className="px-4"
                                                >
                                                    Add
                                                </Button>
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
                                {getInvestmentsByDonor(currentUser?.id || '').slice(0, 3).map(investment => {
                                    const project = projects.find(p => p.id === investment.projectId);
                                    if (!project) return null;

                                    return (
                                        <div key={investment.id} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                                                    <Briefcase size={18} className="text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-white">{project.title}</h4>
                                                    <p className="text-xs text-zinc-500">{project.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">UGX {investment.amount.toLocaleString()}</p>
                                                <p className="text-xs text-emerald-400">{investment.status}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {getInvestmentsByDonor(currentUser?.id || '').length === 0 && (
                                    <div className="text-center py-8 text-zinc-500">
                                        <p className="mb-3">No investments yet</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('dashboard')}
                                        >
                                            Discover Projects
                                        </Button>
                                    </div>
                                )}

                                {getInvestmentsByDonor(currentUser?.id || '').length > 0 && (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-zinc-500"
                                        onClick={() => {
                                            setActiveTab('dashboard');
                                            setDashboardTab('portfolio');
                                        }}
                                    >
                                        View All Investments
                                    </Button>
                                )}
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
                                {getTransactionsByUser(currentUser?.id || '').slice(0, 10).map((tx) => {
                                    const isIncoming = tx.type === 'FUND_RELEASE' || tx.type === 'DEPOSIT';
                                    const isInvestment = tx.type === 'INVESTMENT';
                                    const typeLabel = tx.type === 'INVESTMENT' ? 'Investment' :
                                                     tx.type === 'FUND_RELEASE' ? 'Received' :
                                                     tx.type === 'WITHDRAWAL' ? 'Withdrawal' :
                                                     tx.type === 'DEPOSIT' ? 'Deposit' : 'Transfer';

                                    return (
                                        <tr key={tx.id} className="group hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-4 pl-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-full ${
                                                        isIncoming ? 'bg-emerald-500/10 text-emerald-500' :
                                                        isInvestment ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-zinc-700/30 text-zinc-400'
                                                    }`}>
                                                        {isIncoming ? <ArrowDownLeft size={14}/> :
                                                         isInvestment ? <TrendingUp size={14}/> :
                                                         <ArrowUpRight size={14}/>}
                                                    </div>
                                                    <span className={
                                                        isIncoming ? 'text-emerald-400' :
                                                        isInvestment ? 'text-blue-400' :
                                                        'text-zinc-300'
                                                    }>
                                                        {typeLabel}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 font-mono text-zinc-300">UGX</td>
                                            <td className="py-4 font-medium text-white">{tx.amount.toLocaleString()}</td>
                                            <td className="py-4 text-zinc-400 max-w-[200px] truncate">{tx.counterparty}</td>
                                            <td className="py-4 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="py-4 pr-2 text-right">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    tx.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-500' :
                                                    tx.status === 'PROCESSING' ? 'bg-amber-950 text-amber-500' :
                                                    'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                 </Card>
             </div>
         )}
         
         {activeTab === 'messages' && (
             <div className="mx-auto p-8 space-y-6 animate-in fade-in">
                <div className="pb-6 border-b border-zinc-800">
                    <h1 className="text-3xl font-bold text-white">Messages</h1>
                    <p className="text-zinc-400">Connect with project creators and track your conversations.</p>
                </div>

                <div className="grid grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    {/* Conversation List */}
                    <div className="col-span-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-zinc-800">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <MessageCircle size={18} />
                                Conversations
                            </h3>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {getUserConversations(currentUser?.id || '').length > 0 ? (
                                getUserConversations(currentUser?.id || '').map(conv => {
                                    const otherParticipantId = conv.participants.find(p => p !== currentUser?.id);
                                    const otherParticipant = users.find(u => u.id === otherParticipantId);
                                    const project = conv.projectId ? projects.find(p => p.id === conv.projectId) : null;
                                    const isActive = selectedConversation === conv.id;

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv.id)}
                                            className={`w-full p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors text-left ${
                                                isActive ? 'bg-zinc-800/70' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {otherParticipant?.name.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-white truncate">{otherParticipant?.name}</h4>
                                                        {conv.lastMessage && !conv.lastMessage.read && conv.lastMessage.receiverId === currentUser?.id && (
                                                            <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                        )}
                                                    </div>
                                                    {project && (
                                                        <p className="text-xs text-zinc-500 truncate mb-1">{project.title}</p>
                                                    )}
                                                    {conv.lastMessage && (
                                                        <p className="text-sm text-zinc-400 truncate">{conv.lastMessage.content}</p>
                                                    )}
                                                    <p className="text-xs text-zinc-600 mt-1">
                                                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500 p-6">
                                    <div className="text-center">
                                        <MessageCircle className="mx-auto mb-3 opacity-20" size={48} />
                                        <p className="text-sm">No conversations yet</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message Thread */}
                    <div className="col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col">
                        {selectedConversation ? (() => {
                            const conversation = getUserConversations(currentUser?.id || '').find(c => c.id === selectedConversation);
                            if (!conversation) return null;

                            const otherParticipantId = conversation.participants.find(p => p !== currentUser?.id);
                            const otherParticipant = users.find(u => u.id === otherParticipantId);
                            const project = conversation.projectId ? projects.find(p => p.id === conversation.projectId) : null;
                            const messages = getConversationMessages(selectedConversation);

                            return (
                                <>
                                    {/* Message Header */}
                                    <div className="p-4 border-b border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {otherParticipant?.name.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{otherParticipant?.name}</h3>
                                                {project && (
                                                    <p className="text-xs text-zinc-500">
                                                        Re: {project.title}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {messages.length > 0 ? (
                                            messages.map(msg => {
                                                const isCurrentUser = msg.senderId === currentUser?.id;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[70%] ${
                                                            isCurrentUser ? 'order-2' : 'order-1'
                                                        }`}>
                                                            <div className={`p-3 rounded-lg ${
                                                                isCurrentUser
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-zinc-800 text-zinc-100'
                                                            }`}>
                                                                <p className="text-sm">{msg.content}</p>
                                                            </div>
                                                            <div className={`flex items-center gap-2 mt-1 text-xs text-zinc-500 ${
                                                                isCurrentUser ? 'justify-end' : 'justify-start'
                                                            }`}>
                                                                <Clock size={12} />
                                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-zinc-500">
                                                <p className="text-sm">No messages yet. Start the conversation!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-zinc-800">
                                        <div className="flex gap-3">
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey && newMessage.trim() && otherParticipantId) {
                                                        e.preventDefault();
                                                        sendMessage(otherParticipantId, newMessage.trim(), conversation.projectId);
                                                        setNewMessage('');
                                                        toast.success('Message sent!');
                                                    }
                                                }}
                                                placeholder="Type your message..."
                                                className="flex-1 bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500"
                                            />
                                            <Button
                                                onClick={() => {
                                                    if (newMessage.trim() && otherParticipantId) {
                                                        sendMessage(otherParticipantId, newMessage.trim(), conversation.projectId);
                                                        setNewMessage('');
                                                        toast.success('Message sent!');
                                                    }
                                                }}
                                                disabled={!newMessage.trim()}
                                                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                                            >
                                                <Send size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            );
                        })() : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                <div className="text-center">
                                    <MessageCircle className="mx-auto mb-3 opacity-20" size={64} />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
         )}

         {activeTab !== 'dashboard' && activeTab !== 'profile' && activeTab !== 'wallet' && activeTab !== 'messages' && (
             <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-950/20">
                 <div className="text-center">
                    <Building2 className="mx-auto mb-4 opacity-20" size={48} />
                    <p>Module under development.</p>
                 </div>
             </div>
         )}

         {/* Investment Modal */}
         {showInvestmentModal && investingProject && (
           <InvestmentModal
             isOpen={showInvestmentModal}
             onClose={() => {
               setShowInvestmentModal(false);
               setInvestingProject(null);
             }}
             project={investingProject}
             currentBalance={currentUser?.balance || 0}
             onInvest={createInvestment}
           />
         )}
      </div>
      </div>
    </SidebarProvider>
  );
};