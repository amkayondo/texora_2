import { Project, User } from '../types';

// Replaced GoogleGenAI with static mock logic
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// const model = "gemini-3-flash-preview";

export const getMatchAnalysis = async (project: Project, donors: User[]) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  return donors.map(d => {
    // Generate deterministic score logic for mock
    let score = 70;
    // Boost score if categories overlap
    if (d.interests.some(i => project.category.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(project.category.toLowerCase()))) {
        score += 20;
    }
    // Random fluctuation
    score += Math.floor(Math.random() * 9); 

    return {
      projectId: project.id,
      donorId: d.id,
      score: Math.min(score, 99),
      reason: `Match based on ${d.name}'s investment thesis in ${d.interests[0]} which aligns with the ${project.category} sector.`
    };
  }).sort((a, b) => b.score - a.score);
};

export const getDonorRecommendations = async (project: Project, allDonors: User[]) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Filter to donors only
    const potentialDonors = allDonors.filter(u => u.role === 'DONOR');
    
    // Create mock recommendations
    const matches = potentialDonors.map(d => {
        let score = 65 + Math.floor(Math.random() * 30);
         if (d.interests.includes(project.category)) {
             score += 5; // boost
         }
         return {
             donorId: d.id,
             score: Math.min(score, 98),
             pitchTip: `Emphasize your scalable impact in ${project.category}. ${d.name} typically funds projects with clear metrics.`
         };
    }).sort((a,b) => b.score - a.score);

    // Return top 3
    return matches.slice(0, 3);
};

export const generateMilestoneReportSummary = async (milestoneTitle: string, userNotes: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `STATUS REPORT: ${milestoneTitle}\n\nThe milestone has been successfully executed. ${userNotes}\n\nAll on-chain verification proofs have been validated.`;
};