"use client";
import Image from 'next/image';
import {getFaqReply, suggestedQuestions} from './epsilon-faq';
import {useEffect, useRef, useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import './epsilon-movable.css';
import {Send, X, RotateCcw} from 'lucide-react';
import ReadAloudButton from './ReadAloudButton';
type Section = 'dashboard' | 'doctor-notes' | 'nutrition' | 'education' | 'wellness' | 'settings';
type Message = {role:'user'|'assistant';content:string};
const sections: [Section,string][] = [['dashboard','Home'],['doctor-notes','Doctor Notes'],['nutrition','Nutrition'],['education','Teen Education'],['wellness','Wellness'],['settings','Settings']];
export default function EpsilonChat({
  onNavigate,
  inApp,
  isOpen = false,
  onOpenChange,
  readAloudEnabled = true,
  speechRate = 1,
}:{
  onNavigate:(section:Section)=>void;
  inApp:boolean;
  isOpen?: boolean;
  onOpenChange?: (open:boolean)=>void;
  readAloudEnabled?: boolean;
  speechRate?: number;
}) {
  const [minimized,setMinimized] = useState(false);
  const restoreButton = useRef<HTMLButtonElement>(null);
  const [open,setOpen] = useState(isOpen);
  const [messages,setMessages] = useState<Message[]>([]);
  const [draft,setDraft] = useState('');
  const [busy,setBusy] = useState(false);

  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [position,setPosition] = useState<{x:number;y:number}|null>(null);
  const drag = useRef<{id:number;x:number;y:number;left:number;top:number;moved:boolean}|null>(null);
  const suppressClick = useRef(false);
  function bounded(x:number,y:number){
    const box=launcher.current?.getBoundingClientRect();
    const width=box?.width||100, height=box?.height||150;
    const reserve=inApp&&window.innerWidth<1024?78:8;
    return {x:Math.max(4,Math.min(x,window.innerWidth-width-4)),y:Math.max(4,Math.min(y,window.innerHeight-height-reserve))};
  }
  useEffect(()=>{
    function resize(){setPosition(p=>p?bounded(p.x,p.y):p);}
    window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);
  },[inApp]);
  function pointerDown(e:ReactPointerEvent<HTMLButtonElement>){
    if(!e.isPrimary||e.button!==0)return;
    const box=e.currentTarget.getBoundingClientRect();suppressClick.current=false;
    drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:box.left,top:box.top,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pointerMove(e:ReactPointerEvent<HTMLButtonElement>){
    const d=drag.current;if(!d||d.id!==e.pointerId)return;
    const dx=e.clientX-d.x,dy=e.clientY-d.y;
    if(!d.moved&&Math.hypot(dx,dy)<7)return;
    d.moved=true;suppressClick.current=true;setPosition(bounded(d.left+dx,d.top+dy));
  }
  function pointerEnd(e:ReactPointerEvent<HTMLButtonElement>){
    if(drag.current?.id!==e.pointerId)return;
    if(e.type==='pointercancel')suppressClick.current=true;
    drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  }
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setOpen(isOpen); }, [isOpen]);
  useEffect(() => {if(open && !busy) input.current?.focus();},[open,busy]);
  useEffect(() => {end.current?.scrollIntoView({block:'nearest'});},[messages,busy]);
  useEffect(() => () => {if(pending.current) clearTimeout(pending.current);},[]);

  function updateOpen(next:boolean){
    if(next)setMinimized(false);
    setOpen(next);
    onOpenChange?.(next);
  }

  function close(){
    updateOpen(false);
    requestAnimationFrame(()=>launcher.current?.focus());
  }

  function send(text=draft){
    if(!text.trim() || pending.current) return;
    const reply=getFaqReply(text);
    setMessages(previous=>[...previous,{role:'user',content:text.trim()}]);setDraft('');setBusy(true);
    pending.current=setTimeout(()=>{setMessages(previous=>[...previous,{role:'assistant',content:reply}]);setBusy(false);pending.current=null;},550);
  }

  return <div className={`epsilon-widget ${inApp ? 'epsilon-in-app' : ''}`}>
    {open && <section className="epsilon-panel" role="dialog" aria-label="Chat with Epsilon" onKeyDown={e=>{if(e.key==='Escape')close();}}>
      <header className="epsilon-header"><Image src="/epsilon.png" width={45} height={55} alt=""/><div className="flex-1"><h2 className="font-semibold">Epsilon</h2><p className="text-xs opacity-80">A little guidance, at your pace</p></div><button aria-label="Clear conversation" disabled={busy} onClick={()=>{setMessages([]);setDraft('');}}><RotateCcw size={17}/></button><button aria-label="Close Epsilon" onClick={close}><X size={20}/></button></header>
      <div className="epsilon-body">
        <div className="epsilon-intro"><Image src="/epsilon.png" alt="Epsilon, your purple robot guide" width={80} height={96}/><h3>Hi, I’m Epsilon!</h3><p>Ask about your cycle, everyday wellness, or finding your way around Omega Health.</p></div>
          <div role="log" aria-live="polite" aria-label="Conversation">{messages.map((m,i)=><div key={i} className={`epsilon-message epsilon-${m.role}`}><span className="sr-only">{m.role==='user'?'You':'Epsilon'}: </span>{m.content}{m.role === 'assistant' && <ReadAloudButton text={m.content} enabled={readAloudEnabled} rate={speechRate} className="mt-2" />}</div>)}{busy && <p className="epsilon-typing" role="status" aria-label="Epsilon is typing"><span>•</span><span>•</span><span>•</span></p>}<div ref={end}/></div>
        <div className="epsilon-suggestions">{suggestedQuestions.map(q=><button key={q} disabled={busy} onClick={()=>send(q)}>{q}</button>)}</div>
      </div>
      <nav aria-label="Epsilon app shortcuts" className="epsilon-shortcuts">{sections.map(([key,label])=><button key={key} onClick={()=>{onNavigate(key);close();}}>{label}</button>)}</nav>
      <form className="epsilon-form" onSubmit={e=>{e.preventDefault();void send();}}><label htmlFor="epsilon-message" className="sr-only">Message Epsilon</label><textarea id="epsilon-message" ref={input} rows={2} maxLength={2000} value={draft} disabled={busy} placeholder="Ask Epsilon…" onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send();}}}/><button className="epsilon-primary" type="submit" aria-label="Send message" disabled={busy||!draft.trim()}><Send size={18}/></button></form>
      <p className="epsilon-footnote">FAQ guide · Preset replies · No AI fees. Not medical advice.</p>
    </section>}
    {!open && minimized && <button ref={restoreButton} className="epsilon-flower" aria-label="Restore Epsilon" title="Bring Epsilon back" onClick={()=>{setMinimized(false);setPosition(null);requestAnimationFrame(()=>launcher.current?.focus());}}><span aria-hidden="true">✿</span><b aria-hidden="true">Ω</b></button>}
    {!open && !minimized && <><button className="epsilon-hide" style={position?{position:"fixed",left:position.x,top:position.y}:undefined} aria-label="Minimize Epsilon" title="Minimize Epsilon" onClick={()=>{setMinimized(true);requestAnimationFrame(()=>restoreButton.current?.focus());}}><X size={13}/></button><button ref={launcher} className="epsilon-launcher epsilon-movable" style={position?{position:'fixed',left:position.x,top:position.y}:undefined} aria-label="Chat with Epsilon" aria-description="Drag to move. Use arrow keys to reposition, Home to reset, or Enter to open chat." title="Tap to chat · drag to move" aria-expanded={open} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={e=>{const moves:Record<string,[number,number]>={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(e.key==='Home'){e.preventDefault();setPosition(null);}else if(moves[e.key]){e.preventDefault();const box=e.currentTarget.getBoundingClientRect();setPosition(bounded(box.left+moves[e.key][0],box.top+moves[e.key][1]));}else if(e.key==='Enter'||e.key===' '){suppressClick.current=false;}}} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return;}updateOpen(true);}}><Image src="/epsilon.png" width={76} height={92} alt="" draggable={false} priority/><span>Ask Epsilon</span></button></>}
  </div>;
}
