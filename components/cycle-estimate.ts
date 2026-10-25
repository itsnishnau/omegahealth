type Data = {
  profile: {cycleType: string};
  periods: {startDate:string;endDate?:string|null}[];
  symptoms: {date:string;text:string}[];
  dailyLogs: Record<string,{mood?:string;nutrition?:string}>;
  wellnessLogs: {date:string;activity?:string;energy?:string}[];
};
const DAY=86400000;
function day(value:string) { const n=Date.parse(value+'T00:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===value?n/DAY:NaN; }
const median=(values:number[])=>{const a=[...values].sort((x,y)=>x-y);return (a[Math.floor((a.length-1)/2)]+a[Math.ceil((a.length-1)/2)])/2;};
const key=(n:number)=>new Date(n*DAY).toISOString().slice(0,10);
export function estimateCycle(data:Data,today:string) {
  const now=day(today);
  const starts=[...new Set(data.periods.map(p=>day(p.startDate)).filter(n=>Number.isFinite(n)&&n<=now))].sort((a,b)=>a-b).slice(-9);
  const base={title:'Building your pattern',subtitle:'Estimated start window',date:'More history needed',detail:'Log at least two distinct period start dates. Symptoms alone cannot establish a reliable date window.',daysUntil:null};
  if(starts.length<2)return base;
  const last=starts.at(-1)!;
  const lengths=starts.slice(1).map((n,i)=>n-starts[i]);
  const center=Math.round(median(lengths));
  const irregular=data.profile.cycleType!=='regular';
  // Prototype planning bounds, not calibrated probability or clinical confidence.
  const radius=irregular?(lengths.length<3?7:Math.max(4,Math.ceil((Math.max(...lengths)-Math.min(...lengths))/2))):2;
  let low=last+Math.max(1,Math.min(center-radius,...lengths));
  let high=last+Math.max(center+radius,...lengths);
  const signals=new Map<string,Set<number>>();
  const add=(label:string,date:string)=>{const d=day(date);if(!Number.isFinite(d)||d>now)return;if(!signals.has(label))signals.set(label,new Set());signals.get(label)!.add(d);};
  for(const s of data.symptoms){const text=s.text.toLowerCase().trim().replace(/\s+/g,' ');if(text)add('symptom: '+text,s.date);}
  for(const [date,log] of Object.entries(data.dailyLogs)){if(log.mood)add('mood: '+log.mood,date);if(log.nutrition)add('nutrition: '+log.nutrition,date);}
  for(const log of data.wellnessLogs){if(log.activity)add('activity: '+log.activity,log.date);if(log.energy)add('energy: '+log.energy,log.date);}
  const candidates:number[]=[];const matched:string[]=[];
  if(irregular && lengths.length>=3)for(const [label,dates] of signals){
    const recent=[...dates].filter(d=>d>=last&&d>=now-2);
    if(!recent.length)continue;
    const leads:number[]=[];
    for(let i=1;i<starts.length;i++){
      const hits=[...dates].filter(d=>d>=starts[i-1]&&d<starts[i]&&starts[i]-d<=14);
      // One observation per completed cycle avoids treating many logs as independent cycles.
      if(hits.length)leads.push(starts[i]-Math.max(...hits));
    }
    if(leads.length>=3 && Math.max(...leads)-Math.min(...leads)<=7){candidates.push(Math.max(...recent)+median(leads));matched.push(label.split(':')[0]);}
  }
  let adjustment=0;
  if(candidates.length){adjustment=Math.max(-3,Math.min(3,Math.round(median(candidates)-(last+center))));
    // Expand toward the pattern estimate; never discard the history-only bounds.
    low=Math.min(low,low+adjustment);high=Math.max(high,high+adjustment);
  }
  const format=(n:number)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(n*DAY));
  const span=high-low;
  const evidence=`${lengths.length} recorded cycle interval${lengths.length===1?'':'s'}; median ${center} days; observed span ${Math.min(...lengths)}–${Math.max(...lengths)} days. `;
  const pattern=matched.length?`Repeated ${[...new Set(matched)].join(', ')} patterns across at least 3 completed cycles expanded the window by ${Math.abs(adjustment)} day(s). `:'No repeated recent log pattern met the threshold; daily logs have not adjusted these dates. ';
  const detail=evidence+pattern+(lengths.length<3?'Limited history: provisional estimate. ':'')+'Experimental planning estimate, not a medically validated prediction or contraception guidance. Missing logs and changing cycles can affect it.';
  if(now>high)return {...base,title:'Your previous window has passed',date:`${format(low)} – ${format(high)}`,detail:detail+' Add any missing period dates. We do not invent another cycle or automatically push the window forward.'};
  return {title:irregular?`Possible start over a ${span}-day window`:'Estimated next period window',subtitle:irregular?'Irregular-cycle estimate':'Estimated start window',date:`${format(low)} – ${format(high)}`,detail,daysUntil:null,start:key(low),end:key(high)};
}
