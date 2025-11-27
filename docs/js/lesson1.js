// lesson1.js — fundamentos express
const leads = [
  { name: "darenavz", platform: "instagram", risk: 8 },
  { name: "bauzagpt", platform: "web", risk: 2 },
  { name: "loganmom", platform: "facebook", risk: 6 },
];

function scoreLead(lead) {
  if (lead.risk >= 7) return "alta";
  if (lead.risk >= 4) return "media";
  return "baja";
}

const summary = leads.map(l => ({ ...l, bucket: scoreLead(l) }));
console.table(summary);
