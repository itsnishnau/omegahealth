export type PatternData = {
  periods: {startDate:string;endDate?:string|null}[];
  symptoms: {id:string;date:string;text:string}[];
  dailyLogs: Record<string,{mood?:string;nutrition?:string}>;
  wellnessLogs: {date:string;activity?:string}[];
};
export const dayNumber=(date:string)=>Date.parse(date+'T00:00:00Z')/86400000;
export function cycleHistory(data:PatternData,today:string){
  const starts=[...new Set(data.periods.map(p=>p.startDate).filter(d=>d<=today&&Number.isFinite(dayNumber(d))))].sort();
  const intervals=starts.slice(1).map((end,i)=>({start:starts[i],end,days:dayNumber(end)-dayNumber(starts[i])}));
  return {starts,intervals};
}
export function repeatedObservations(data:PatternData,today:string){
  const {intervals}=cycleHistory(data,today);
  const recent=intervals.slice(-6);
  if(recent.length<3)return [];
  const counts=new Map<string,number>();
  recent.forEach(cycle=>{
    const found=new Set(data.symptoms.filter(s=>s.date>=cycle.start&&s.date<cycle.end&&dayNumber(cycle.end)-dayNumber(s.date)<=7).map(s=>s.text.trim().toLowerCase()).filter(Boolean));
    found.forEach(text=>counts.set(text,(counts.get(text)||0)+1));
  });
  return [...counts].filter(([,n])=>n>=3).map(([text,n])=>`“${text}” was logged in the 7 days before ${n} of your last ${recent.length} recorded periods.`);
}
