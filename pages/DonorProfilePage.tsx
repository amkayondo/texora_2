import React from 'react';
import { ArrowLeft, MapPin, CheckCircle, Mail, Globe, Linkedin, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { useApp } from '../AppContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Web3Badge } from '../components/Web3Badge';

interface DonorProfilePageProps {
  donorId: string;
  onBack: () => void;
}

export const DonorProfilePage: React.FC<DonorProfilePageProps> = ({ donorId, onBack }) => {
  const { users, projects, getInvestmentsByDonor } = useApp();
  const donor = users.find(u => u.id === donorId);
  const investments = getInvestmentsByDonor(donorId);

  if (!donor) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <div className="text-center mt-12">
          <p className="text-zinc-400">Donor not found</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalInvestedCalculated = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeInvestmentsCount = investments.filter(inv => inv.status === 'active').length;
  const avgTicket = activeInvestmentsCount > 0 ? totalInvestedCalculated / activeInvestmentsCount : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Donor Header Section */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-primary-foreground">{donor.name.charAt(0)}</span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{donor.name}</h1>
              {donor.verified && (
                <CheckCircle size={24} className="text-emerald-500" />
              )}
            </div>

            {donor.location && (
              <div className="flex items-center gap-2 text-zinc-400 mb-3">
                <MapPin size={16} />
                <span>{donor.location}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {donor.interests.map((interest, idx) => (
                <Web3Badge key={idx} type="info">
                  {interest}
                </Web3Badge>
              ))}
            </div>

            {/* Contact Links */}
            <div className="flex gap-4">
              {donor.email && (
                <a
                  href={`mailto:${donor.email}`}
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  <Mail size={16} />
                  Email
                </a>
              )}
              {donor.website && (
                <a
                  href={donor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  <Globe size={16} />
                  Website
                </a>
              )}
              {donor.linkedin && (
                <a
                  href={`https://linkedin.com/in/${donor.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-950/50">
              <DollarSign size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Invested</p>
              <p className="text-2xl font-bold text-foreground">
                ${(donor.totalInvested || totalInvestedCalculated).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-indigo-950/50">
              <TrendingUp size={24} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Active Investments</p>
              <p className="text-2xl font-bold text-foreground">
                {donor.activeInvestments || activeInvestmentsCount}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-950/50">
              <Briefcase size={24} className="text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Ticket Size</p>
              <p className="text-xl font-bold text-foreground">
                {donor.ticketSize || `$${Math.round(avgTicket / 1000)}k avg`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Investment History */}
      <div className="mb-8">
        <Card title="Investment History">
          {investments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Project</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment) => {
                    const project = projects.find(p => p.id === investment.projectId);
                    return (
                      <tr key={investment.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {project?.title || 'Unknown Project'}
                            </p>
                            <p className="text-sm text-zinc-500">{project?.category}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-emerald-400">
                            ${investment.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-zinc-300">
                          {new Date(investment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <Web3Badge type={investment.status === 'active' ? 'success' : 'default'}>
                            {investment.status === 'active' ? 'Active' : 'Completed'}
                          </Web3Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No investment history available</p>
          )}
        </Card>
      </div>

      {/* About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="About">
          <p className="text-zinc-300 whitespace-pre-wrap">{donor.bio}</p>

          {donor.joinedDate && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-zinc-500">
                Member since {new Date(donor.joinedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          )}
        </Card>

        <Card title="Investment Thesis">
          <div className="space-y-4">
            {donor.investmentStage && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">Investment Stage</p>
                <p className="text-foreground font-medium">{donor.investmentStage}</p>
              </div>
            )}

            {donor.ticketSize && (
              <div>
                <p className="text-sm text-zinc-400 mb-1">Typical Ticket Size</p>
                <p className="text-foreground font-medium">{donor.ticketSize}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-zinc-400 mb-2">Focus Areas</p>
              <div className="flex flex-wrap gap-2">
                {donor.interests.map((interest, idx) => (
                  <Web3Badge key={idx} type="info">
                    {interest}
                  </Web3Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex justify-center">
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 px-8"
          onClick={() => alert('Messaging feature coming soon! This would open a message dialog.')}
        >
          <Mail size={18} className="mr-2" />
          Send Message
        </Button>
      </div>
    </div>
  );
};
