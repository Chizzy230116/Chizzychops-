'use client'

import { useState } from 'react'
import { saveReview, saveCatering } from '@/app/lib/supabase'

const GOOGLE_REVIEW = 'https://www.google.com/maps/place/Chizzychops+%26+grillz/@6.6012076,3.3115685,17z/data=!3m1!4b1!4m6!3m5!1s0x103b91874096c5a9:0x354c0d35e0957b4f!8m2!3d6.6012076!4d3.3115685!16s%2Fg%2F11pclvf9lj?entry=ttu#lrd=0x103b91874096c5a9:0x354c0d35e0957b4f,3'
const GOOGLE_MAP    = 'https://www.google.com/maps/place/Chizzychops+%26+grillz/@6.6012076,3.3115685,17z'
const CATERING_WA   = 'https://wa.me/2348094946923?text=Hi%20Chizzychops%20%26%20Grillz!%20I%27d%20like%20to%20enquire%20about%20*Event%20Catering*%20%F0%9F%8D%BD%EF%B8%8F'

const dishes = ['Basmati Jollof Rice','Special Fried Rice','Coconut Rice','Native Nigerian Rice','Creamy Chicken Pasta','Jollof Spaghetti','Shrimp Pasta','Asun Pasta','Classic Food Box','Deluxe Food Box','Premium Food Box','Breakfast Box','Treat Box','Grilled Chicken','Suya','Asun (Peppered Goat)','Nkwobi',"Edna's Porridge",'Egusi Soup','Event Catering','Other']
const aspects = [{k:'taste',label:'Taste & Flavour',icon:'😋'},{k:'portion',label:'Portion Size',icon:'🍽️'},{k:'delivery',label:'Delivery Speed',icon:'⚡'},{k:'packaging',label:'Packaging Quality',icon:'📦'},{k:'value',label:'Value for Money',icon:'💰'}]
const ratingWords = ['','Terrible 😤','Poor 😕','Okay 😐','Good 😊','Excellent! 🤩']

function Stars({value,onChange,size=6}:{value:number;onChange:(v:number)=>void;size?:number}) {
  const [h,setH]=useState(0)
  return (
    <div style={{display:'flex',gap:'4px'}}>
      {[1,2,3,4,5].map(s=>(
        <button key={s} onMouseEnter={()=>setH(s)} onMouseLeave={()=>setH(0)} onClick={()=>onChange(s)}
          style={{background:'none',border:'none',cursor:'pointer',padding:'1px',transition:'transform 0.1s'}}
          onMouseDown={e=>(e.currentTarget.style.transform='scale(0.9)')}
          onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
          <svg width={size*4} height={size*4} viewBox="0 0 20 20" fill={s<=(h||value)?'#FBBF24':'rgba(255,255,255,0.12)'}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function ReviewSystem() {
  const [tab,setTab] = useState<'review'|'catering'>('review')

  // Review form state
  const [step,setStep]       = useState<1|2|3>(1)
  const [name,setName]       = useState('')
  const [dish,setDish]       = useState('')
  const [overall,setOverall] = useState(0)
  const [ratings,setRatings] = useState({taste:0,portion:0,delivery:0,packaging:0,value:0})
  const [recommend,setRecommend] = useState<boolean|null>(null)
  const [text,setText]       = useState('')
  const [done,setDone]       = useState(false)
  const [busy,setBusy]       = useState(false)

  // Catering form state
  const [cName,setCName]     = useState('')
  const [cPhone,setCPhone]   = useState('')
  const [cDate,setCDate]     = useState('')
  const [cGuests,setCGuests] = useState('')
  const [cEvent,setCEvent]   = useState('')
  const [cNotes,setCNotes]   = useState('')
  const [cDone,setCDone]     = useState(false)
  const [cBusy,setCBusy]     = useState(false)

  const submitReview = async () => {
    setBusy(true)
    // 1. Save to DB
    try {
      await saveReview({
        name, dish, overall,
        taste: ratings.taste, portion: ratings.portion,
        delivery: ratings.delivery, packaging: ratings.packaging,
        value: ratings.value,
        recommend: recommend ?? true,
        review_text: text,
        type: 'review',
      })
    } catch(e) { console.error('Review DB save failed:', e) }

    // 2. Open WhatsApp
    const rStr = Object.entries(ratings).map(([k,v])=>`${k}: ${v}/5`).join(', ')
    const msg = `⭐ *Review from ${name}*\n\nDish: ${dish}\nOverall: ${overall}/5 — ${ratingWords[overall]}\nRatings: ${rStr}\nRecommend: ${recommend?'Yes ✅':'No ❌'}\n\nReview:\n${text}`
    window.open(`https://wa.me/2348094946923?text=${encodeURIComponent(msg)}`,'_blank')
    setDone(true)
    setBusy(false)
  }

  const submitCatering = async () => {
    setCBusy(true)
    // 1. Save to DB
    try {
      await saveCatering({
        name: cName, phone: cPhone, event_date: cDate,
        guests: cGuests, event_type: cEvent || '',
        notes: cNotes || '', type: 'catering',
      })
    } catch(e) { console.error('Catering DB save failed:', e) }

    // 2. Open WhatsApp
    const msg = `🎉 *Catering Booking Request*\n\n👤 Name: ${cName}\n📞 Phone: ${cPhone}\n📅 Event Date: ${cDate}\n👥 Guests: ${cGuests}\n🎊 Event Type: ${cEvent}\n\n✍️ Notes:\n${cNotes||'None'}`
    window.open(`https://wa.me/2348094946923?text=${encodeURIComponent(msg)}`,'_blank')
    setCDone(true)
    setCBusy(false)
  }

  return (
    <section id="write-review" style={{background:'var(--brand-dark)',padding:'6rem 0'}}>
      <div className="container">

        {/* Tab switcher */}
        <div style={{display:'flex',gap:'0.5rem',padding:'0.375rem',borderRadius:'9999px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'3rem',width:'fit-content',margin:'0 auto 3rem'}}>
          {[{k:'review',label:'Write a Review'},{k:'catering',label:'Book Catering'}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k as 'review'|'catering')}
              style={{padding:'0.625rem 1.5rem',borderRadius:'9999px',fontWeight:700,fontSize:'0.9rem',border:'none',cursor:'pointer',transition:'all 0.25s',
                background:tab===t.k?'linear-gradient(135deg,#F97316,#DC2626)':'transparent',
                color:tab===t.k?'#fff':'rgba(255,255,255,0.45)',
                boxShadow:tab===t.k?'0 4px 16px rgba(249,115,22,0.3)':'none'}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── REVIEW TAB ── */}
        {tab==='review' && (
          <>
            <div style={{textAlign:'center',marginBottom:'2rem'}}>
              <span className="section-label">Share Your Experience</span>
              <h2 className="section-title">Write a <span className="flame-text">Review</span></h2>
              <div className="divider" style={{margin:'1rem auto'}}/>
            </div>

            {/* Google review prompt */}
            <div style={{display:'flex',gap:'1rem',alignItems:'center',padding:'1.25rem 1.5rem',borderRadius:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'2.5rem',flexWrap:'wrap'}}>
              <GoogleIcon small />
              <div style={{flex:1,minWidth:'12rem'}}>
                <p style={{color:'#fff',fontWeight:700,fontSize:'0.9375rem'}}>Leave us a Google Review too!</p>
                <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.8125rem'}}>Your review helps others discover us on Google Maps.</p>
              </div>
              <a href={GOOGLE_REVIEW} target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.625rem 1.25rem',borderRadius:'9999px',background:'#fff',color:'#000',fontWeight:800,fontSize:'0.8125rem',textDecoration:'none',flexShrink:0}}>
                <GoogleIcon small /> Leave Google Review
              </a>
              <a href={GOOGLE_MAP} target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.625rem 1.25rem',borderRadius:'9999px',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.6)',fontWeight:700,fontSize:'0.8125rem',textDecoration:'none',flexShrink:0}}>
                📍 View on Maps
              </a>
            </div>

            {done ? (
              <div style={{textAlign:'center',padding:'3rem',borderRadius:'1.25rem',border:'1px solid rgba(37,211,102,0.2)',background:'rgba(37,211,102,0.05)'}}>
                <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>⭐</div>
                <h3 style={{fontFamily:'var(--font-playfair)',color:'#fff',fontSize:'1.5rem',fontWeight:700,marginBottom:'0.5rem'}}>Thank You!</h3>
                <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'1.5rem'}}>Your review has been saved and sent to us. We appreciate every one!</p>
                <button onClick={()=>{setDone(false);setStep(1);setOverall(0);setRatings({taste:0,portion:0,delivery:0,packaging:0,value:0});setRecommend(null);setText('');setName('');setDish('')}}
                  style={{color:'#F97316',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontSize:'0.9rem'}}>
                  Write Another Review →
                </button>
              </div>
            ) : (
              <div style={{borderRadius:'1.25rem',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.02)',overflow:'hidden'}}>
                {/* Step tabs */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                  {['Basic Info','Ratings','Your Review'].map((l,i)=>(
                    <div key={l} style={{padding:'1rem',textAlign:'center',fontSize:'0.8125rem',fontWeight:700,
                      background:step===i+1?'rgba(249,115,22,0.08)':'transparent',
                      color:step===i+1?'#F97316':step>i+1?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.25)',
                      borderRight:i<2?'1px solid rgba(255,255,255,0.07)':'none'}}>
                      {step>i+1?'✓ ':''}{l}
                    </div>
                  ))}
                </div>

                <div style={{padding:'2rem'}}>
                  {step===1 && (
                    <div style={{display:'flex',flexDirection:'column',gap:'1.125rem'}}>
                      <div>
                        <label style={LBL}>Your Name *</label>
                        <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Amaka O." />
                      </div>
                      <div>
                        <label style={LBL}>What did you order? *</label>
                        <select className="form-input" value={dish} onChange={e=>setDish(e.target.value)}>
                          <option value="">Select a dish...</option>
                          {dishes.map(d=><option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={LBL}>Overall Rating *</label>
                        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                          <Stars value={overall} onChange={setOverall} size={7} />
                          {overall>0&&<span style={{color:'#FBBF24',fontWeight:700,fontSize:'0.9375rem'}}>{ratingWords[overall]}</span>}
                        </div>
                      </div>
                      <button className="btn-primary" disabled={!name||!dish||!overall} onClick={()=>setStep(2)} style={{opacity:name&&dish&&overall?1:0.35,cursor:name&&dish&&overall?'pointer':'not-allowed'}}>Continue →</button>
                    </div>
                  )}

                  {step===2 && (
                    <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                      {aspects.map(a=>(
                        <div key={a.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.875rem 1rem',borderRadius:'0.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                            <span style={{fontSize:'1.25rem'}}>{a.icon}</span>
                            <span style={{color:'rgba(255,255,255,0.7)',fontWeight:600,fontSize:'0.9rem'}}>{a.label}</span>
                          </div>
                          <Stars value={ratings[a.k as keyof typeof ratings]} onChange={v=>setRatings(p=>({...p,[a.k]:v}))} size={5} />
                        </div>
                      ))}
                      <div>
                        <label style={LBL}>Would you recommend us?</label>
                        <div style={{display:'flex',gap:'0.75rem'}}>
                          {[true,false].map(v=>(
                            <button key={String(v)} onClick={()=>setRecommend(v)} style={{flex:1,padding:'0.75rem',borderRadius:'0.75rem',border:'1.5px solid',fontWeight:700,fontSize:'0.9rem',cursor:'pointer',transition:'all 0.2s',
                              borderColor:recommend===v?(v?'rgba(74,222,128,0.6)':'rgba(248,113,113,0.6)'):'rgba(255,255,255,0.08)',
                              background:recommend===v?(v?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)'):'rgba(255,255,255,0.03)',
                              color:recommend===v?(v?'#4ADE80':'#F87171'):'rgba(255,255,255,0.5)'}}>
                              {v?'👍 Yes, definitely!':'👎 Not this time'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'0.75rem'}}>
                        <button onClick={()=>setStep(1)} style={{flex:1,padding:'0.9375rem',borderRadius:'9999px',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'rgba(255,255,255,0.6)',fontWeight:700,cursor:'pointer',fontSize:'0.9375rem'}}>← Back</button>
                        <button className="btn-primary" onClick={()=>setStep(3)} disabled={Object.values(ratings).some(v=>v===0)||recommend===null} style={{flex:2,opacity:Object.values(ratings).every(v=>v>0)&&recommend!==null?1:0.35,cursor:Object.values(ratings).every(v=>v>0)&&recommend!==null?'pointer':'not-allowed'}}>Continue →</button>
                      </div>
                    </div>
                  )}

                  {step===3 && (
                    <div style={{display:'flex',flexDirection:'column',gap:'1.125rem'}}>
                      <div>
                        <label style={LBL}>Your Review * <span style={{color:'rgba(255,255,255,0.25)',fontWeight:400}}>(min. 20 characters)</span></label>
                        <textarea className="form-input" value={text} onChange={e=>setText(e.target.value)} placeholder="Share your full experience — the food, service, delivery. What stood out?" rows={5} style={{resize:'none'}} />
                        <p style={{textAlign:'right',fontSize:'0.75rem',marginTop:'0.375rem',color:text.length>=20?'#4ADE80':'rgba(255,255,255,0.25)'}}>{text.length} chars</p>
                      </div>
                      <div style={{padding:'1rem',borderRadius:'0.875rem',background:'rgba(249,115,22,0.06)',border:'1px solid rgba(249,115,22,0.12)'}}>
                        <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.6875rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.5rem'}}>Preview</p>
                        <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.375rem'}}>
                          <div style={{width:'1.75rem',height:'1.75rem',borderRadius:'50%',background:'linear-gradient(135deg,#F97316,#DC2626)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.6875rem',flexShrink:0}}>{name.charAt(0).toUpperCase()}</div>
                          <span style={{color:'#fff',fontWeight:700,fontSize:'0.875rem'}}>{name}</span>
                          <span style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem'}}>· {dish}</span>
                        </div>
                        <p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.8125rem',lineHeight:1.6,fontStyle:'italic'}}>{text||'Your review will appear here...'}</p>
                      </div>
                      <div style={{display:'flex',gap:'0.75rem'}}>
                        <button onClick={()=>setStep(2)} style={{flex:1,padding:'0.9375rem',borderRadius:'9999px',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'rgba(255,255,255,0.6)',fontWeight:700,cursor:'pointer',fontSize:'0.9375rem'}}>← Back</button>
                        <button className="btn-primary" onClick={submitReview} disabled={text.length<20||busy} style={{flex:2,opacity:text.length>=20&&!busy?1:0.35,cursor:text.length>=20&&!busy?'pointer':'not-allowed'}}>
                          <WAIcon /> {busy?'Saving…':'Submit via WhatsApp'}
                        </button>
                      </div>
                      <p style={{textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:'0.75rem'}}>Your review is saved securely before opening WhatsApp</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CATERING TAB ── */}
        {tab==='catering' && (
          <>
            <div style={{textAlign:'center',marginBottom:'3rem'}}>
              <span className="section-label">Event Services</span>
              <h2 className="section-title">Book <span className="flame-text">Catering</span></h2>
              <div className="divider" style={{margin:'1rem auto'}}/>
              <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.9375rem',maxWidth:'30rem',margin:'0 auto'}}>From intimate birthday dinners to large corporate events — we handle it all with excellence.</p>
            </div>

            {/* Packages */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,220px),1fr))',gap:'1rem',marginBottom:'2.5rem'}}>
              {[
                {name:'Intimate',guests:'Up to 20',icon:'🕯️',perks:['2 main dishes','1 side dish','Staff service']},
                {name:'Classic',guests:'20–50 guests',icon:'🎉',perks:['3 main dishes','2 side dishes','Drinks included','Staff service'],highlight:true},
                {name:'Premium',guests:'50–200+',icon:'👑',perks:['5+ dishes','Full buffet setup','Dedicated chef','Décor & setup']},
              ].map(p=>(
                <div key={p.name} style={{padding:'1.5rem',borderRadius:'1rem',border:'1.5px solid',borderColor:p.highlight?'rgba(249,115,22,0.4)':'rgba(255,255,255,0.08)',background:p.highlight?'rgba(249,115,22,0.07)':'rgba(255,255,255,0.03)',position:'relative'}}>
                  {p.highlight&&<div style={{position:'absolute',top:'-0.625rem',left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#F97316,#DC2626)',color:'#fff',fontSize:'0.625rem',fontWeight:800,padding:'0.25rem 0.75rem',borderRadius:'9999px',letterSpacing:'0.08em',whiteSpace:'nowrap'}}>MOST POPULAR</div>}
                  <div style={{fontSize:'1.75rem',marginBottom:'0.75rem'}}>{p.icon}</div>
                  <p style={{color:'#fff',fontFamily:'var(--font-playfair)',fontWeight:700,fontSize:'1.0625rem',marginBottom:'0.25rem'}}>{p.name}</p>
                  <p style={{color:'rgba(249,115,22,0.8)',fontSize:'0.8125rem',fontWeight:600,marginBottom:'1rem'}}>{p.guests}</p>
                  {p.perks.map(pk=><p key={pk} style={{color:'rgba(255,255,255,0.5)',fontSize:'0.8125rem',marginBottom:'0.25rem'}}>✓ {pk}</p>)}
                </div>
              ))}
            </div>

            {cDone ? (
              <div style={{textAlign:'center',padding:'3rem',borderRadius:'1.25rem',border:'1px solid rgba(37,211,102,0.2)',background:'rgba(37,211,102,0.05)'}}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🎉</div>
                <h3 style={{fontFamily:'var(--font-playfair)',color:'#fff',fontSize:'1.5rem',fontWeight:700,marginBottom:'0.5rem'}}>Request Sent!</h3>
                <p style={{color:'rgba(255,255,255,0.5)',marginBottom:'1.5rem'}}>Your catering request has been saved and WhatsApp opened. We&apos;ll get back to you within 24 hours.</p>
                <button onClick={()=>setCDone(false)} style={{color:'#F97316',fontWeight:700,background:'none',border:'none',cursor:'pointer',fontSize:'0.9rem'}}>Submit Another Request →</button>
              </div>
            ) : (
              <div style={{borderRadius:'1.25rem',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.02)',padding:'2rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:'1rem'}}>
                {[
                  {label:'Your Name *',type:'text',val:cName,set:setCName,placeholder:'e.g. Amaka Johnson'},
                  {label:'WhatsApp Number *',type:'tel',val:cPhone,set:setCPhone,placeholder:'0809 494 6923'},
                  {label:'Event Date *',type:'date',val:cDate,set:setCDate,placeholder:''},
                  {label:'Number of Guests *',type:'number',val:cGuests,set:setCGuests,placeholder:'e.g. 50'},
                  {label:'Type of Event',type:'text',val:cEvent,set:setCEvent,placeholder:'Birthday, Corporate, Wedding...'},
                ].map(f=>(
                  <div key={f.label}>
                    <label style={LBL}>{f.label}</label>
                    <input className="form-input" type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
                <div style={{gridColumn:'1/-1'}}>
                  <label style={LBL}>Additional Notes / Menu Preferences</label>
                  <textarea className="form-input" value={cNotes} onChange={e=>setCNotes(e.target.value)} placeholder="Dietary requirements, preferred dishes, theme, budget range..." rows={3} style={{resize:'none'}} />
                </div>
                <p style={{gridColumn:'1/-1',color:'rgba(255,255,255,0.25)',fontSize:'0.75rem',textAlign:'center'}}>Your request is saved securely before opening WhatsApp</p>
                <div style={{gridColumn:'1/-1',display:'flex',gap:'0.75rem',paddingTop:'0.25rem'}}>
                  <a href={CATERING_WA} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{flex:1,justifyContent:'center'}}>
                    <WAIcon /> Quick WhatsApp Enquiry
                  </a>
                  <button className="btn-primary" onClick={submitCatering} disabled={!cName||!cPhone||!cDate||!cGuests||cBusy}
                    style={{flex:2,opacity:cName&&cPhone&&cDate&&cGuests&&!cBusy?1:0.35,cursor:cName&&cPhone&&cDate&&cGuests&&!cBusy?'pointer':'not-allowed',background:'linear-gradient(135deg,#DC2626,#7C2D12)'}}>
                    <WAIcon /> {cBusy?'Saving…':'Submit Catering Request'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

const LBL: React.CSSProperties = {color:'rgba(255,255,255,0.5)',fontSize:'0.8125rem',fontWeight:700,display:'block',marginBottom:'0.5rem'}

function GoogleIcon({small=false}:{small?:boolean}) {
  const s=small?14:28
  return (<svg width={s} height={s} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>)
}
function WAIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}