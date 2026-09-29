const D='galop_donors',H='galop_horses';
const localGet=k=>JSON.parse(localStorage.getItem(k)||'[]'),localSave=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const remote=()=>window.SUPABASE_URL&&!window.SUPABASE_URL.includes('TON-PROJET')&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes('TA_CLE');
async function api(path, opts = {}) {
  const r = await fetch(
    window.SUPABASE_URL + '/rest/v1/' + path,
    {
      ...opts,
      headers: {
        apikey: window.SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + window.SUPABASE_ANON_KEY,
        ...(opts.headers || {})
      }
    }
  );

  const text = await r.text();

  if (!r.ok) {
    throw Error(text || `Erreur Supabase ${r.status}`);
  }

  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
async function data(){let d=localGet(D),h=localGet(H);if(remote()){try{d=await api('donors?select=*&order=amount.desc');h=await api('horses?select=*&order=created_at.desc')}catch(e){console.warn(e)}}return[d,h]}
async function load(){const[d,h]=await data();render(d,h)}
function render(d,h){
 const dd=document.getElementById('donors'),hh=document.getElementById('horses');
 if(dd){const top=d.filter(x=>x.featured===true||x.featured==='true');dd.innerHTML=top.map((x,i)=>`<div class="rank"><strong>#${i+1}</strong><span>${esc(x.name)}</span><b>${Number(x.amount).toFixed(2)} €</b></div>`).join('')||'<div class="panel">Aucun donateur dans le Top pour le moment.</div>'}
 if(hh)hh.innerHTML=h.map(x=>`<article class="horse"><div class="horse-img">${x.image_url?`<img src="${x.image_url}" alt="${esc(x.name)}">`:'🐴'}</div><h2>${esc(x.name)}</h2><p>Un cheval accompagné avec beaucoup de soin et d’amour.</p></article>`).join('')||'<div class="panel">Aucun cheval ajouté pour le moment.</div>';
 let hc=document.getElementById('horseCount'),dc=document.getElementById('donorCount'),ta=document.getElementById('totalAmount');
 if(hc)hc.textContent=h.length;if(dc)dc.textContent=d.length;if(ta)ta.textContent=d.reduce((s,x)=>s+Number(x.amount),0).toFixed(2)+' €'
}
function login(){if(document.getElementById('code').value==='3945'){sessionStorage.admin='1';showDash()}else document.getElementById('error').textContent='Code incorrect.'}
function showDash(){let l=document.getElementById('login'),d=document.getElementById('dashboard');if(!d)return;if(sessionStorage.admin==='1'){l.hidden=true;d.hidden=false;renderAdmin()}}
function logout(){sessionStorage.removeItem('admin');location.reload()}

async function submitPublicDonation(){
 const n=document.getElementById('publicDonorName').value.trim();
 const a=Number(document.getElementById('publicDonorAmount').value);
 const msg=document.getElementById('donMessage');
 if(!n){msg.className='error';msg.textContent='Indique un nom ou un pseudo.';return}
 if(!Number.isFinite(a)||a<=0){msg.className='error';msg.textContent='Indique un montant supérieur à 0 €.';return}
 try{
   if(remote()) await api('donors',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({name:n,amount:a,featured:false})});
   else {let d=localGet(D);d.push({id:Date.now(),name:n,amount:a,featured:false,created_at:new Date().toISOString()});localSave(D,d)}
   document.getElementById('publicDonorName').value='';document.getElementById('publicDonorAmount').value='';
   msg.className='success';msg.textContent='Merci 💚 Ton don a bien été enregistré !';
 }catch(e){msg.className='error';msg.textContent='Erreur : '+e.message}
}
function setAmount(v){document.getElementById('publicDonorAmount').value=v}

async function addDonor(){
 let n=document.getElementById('donorName').value.trim(),a=Number(document.getElementById('donorAmount').value),featured=document.getElementById('donorFeatured').checked;
 if(!n||!Number.isFinite(a)||a<=0){alert('Indique un nom et un montant supérieur à 0 €.');return}
 try{
   if(remote())await api('donors',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({name:n,amount:a,featured})});
   else{let d=localGet(D);d.push({id:Date.now(),name:n,amount:a,featured,created_at:new Date().toISOString()});localSave(D,d)}
   document.getElementById('donorName').value='';document.getElementById('donorAmount').value='';document.getElementById('donorFeatured').checked=false;await renderAdmin();alert('Donateur ajouté !')
 }catch(e){alert('Erreur : '+e.message)}
}
function fileData(f){return new Promise((res,rej)=>{let r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}
async function addHorse(){
 let n=document.getElementById('horseName').value.trim(),f=document.getElementById('horsePhoto').files[0];if(!n)return;
 try{let img=f?await fileData(f):'';if(remote())await api('horses',{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({name:n,image_url:img})});else{let h=localGet(H);h.push({id:Date.now(),name:n,image_url:img});localSave(H,h)}document.getElementById('horseName').value='';document.getElementById('horsePhoto').value='';await renderAdmin();alert('Cheval ajouté !')}catch(e){alert('Erreur : '+e.message)}
}
async function toggleFeatured(id,current){
 try{
   const value=!current;
   if(remote())await api('donors?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({featured:value})});
   else{let d=localGet(D);let x=d.find(z=>String(z.id)===String(id));if(x)x.featured=value;localSave(D,d)}
   await renderAdmin()
 }catch(e){alert('Erreur : '+e.message)}
}
async function removeItem(table,id){
 try{if(remote())await api(table+'?id=eq.'+encodeURIComponent(id),{method:'DELETE'});else{let k=table==='donors'?D:H,a=localGet(k);a=a.filter((x,i)=>String(x.id??i)!==String(id));localSave(k,a)}await renderAdmin()}catch(e){alert('Erreur : '+e.message)}
}
async function renderAdmin(){
 let[d,h]=await data(),ad=document.getElementById('adminDonors'),ah=document.getElementById('adminHorses');
 if(ad)ad.innerHTML=d.map((x,i)=>`<div class="row"><span>${esc(x.name)} — ${Number(x.amount).toFixed(2)} € ${x.featured?'⭐':''}</span><span class="row-actions"><button class="small ${x.featured?'on':''}" onclick="toggleFeatured('${x.id??i}',${!!x.featured})">${x.featured?'Retirer du Top':'Mettre dans le Top'}</button><button onclick="removeItem('donors','${x.id??i}')">✕</button></span></div>`).join('')||'<p>Aucun donateur.</p>';
 if(ah)ah.innerHTML=h.map((x,i)=>`<div class="row"><span>${esc(x.name)}</span><button onclick="removeItem('horses','${x.id??i}')">✕</button></div>`).join('')||'<p>Aucun cheval.</p>'
}
load();showDash();
