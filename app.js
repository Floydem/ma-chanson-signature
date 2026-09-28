const CONTACT_EMAIL="floydem84@gmail.com";
const offers={mp3:{title:"Chanson seule",format:"MP3 • 2 versions"},video:{title:"Chanson + paroles",format:"MP3 + VIDÉO"},signature:{title:"Signature complète",format:"MP3 + VIDÉO + PDF"}};
let selectedOffer="mp3",selectedFiles=[];
const form=document.getElementById("requestForm"),upload=document.getElementById("uploadBlock"),images=document.getElementById("images"),summary=document.getElementById("fileSummary"),statusBox=document.getElementById("formStatus"),submitBtn=document.getElementById("submitBtn");
function setOffer(id,scroll){selectedOffer=id;document.querySelectorAll("[data-offer]").forEach(b=>b.classList.toggle("active",b.dataset.offer===id));document.getElementById("selectedTitle").textContent=offers[id].title;document.getElementById("selectedFormat").textContent=offers[id].format;upload.classList.toggle("visible",id==="signature");if(id!=="signature"){selectedFiles=[];images.value="";summary.textContent=""}if(scroll)document.getElementById("demande").scrollIntoView({behavior:"smooth",block:"start"})}
document.querySelectorAll("[data-offer]").forEach(b=>b.addEventListener("click",()=>setOffer(b.dataset.offer,false)));
document.querySelectorAll("[data-choose]").forEach(b=>b.addEventListener("click",()=>setOffer(b.dataset.choose,true)));
images.addEventListener("change",()=>{const files=Array.from(images.files||[]).filter(f=>f.type.startsWith("image/")).slice(0,5);const total=files.reduce((s,f)=>s+f.size,0);if(total>10*1024*1024){selectedFiles=[];images.value="";show("error","Les images dépassent 10 Mo au total.");return}selectedFiles=files;summary.textContent=files.length?files.length+" image"+(files.length>1?"s":"")+" • "+(total/1024/1024).toFixed(1)+" Mo • "+files.map(f=>f.name).join(" · "):""});
function show(type,msg){statusBox.className="status visible "+type;statusBox.textContent=msg}
function clearStatus(){statusBox.className="status";statusBox.textContent=""}
form.addEventListener("submit",async e=>{
  e.preventDefault();
  clearStatus();
  if(selectedOffer==="signature"&&selectedFiles.length===0){show("error","Ajoutez au moins une image pour la formule Signature complète.");return}
  const data=new FormData(form);
  data.set("Formule",offers[selectedOffer].title+" — "+offers[selectedOffer].format);
  data.set("_subject","Nouvelle demande Ma Chanson Signature — "+(data.get("occasion")||"Projet"));
  data.set("_template","table");
  data.set("_captcha","false");
  data.set("_url",window.location.origin+"/");
  selectedFiles.forEach((f,i)=>data.append("image_"+(i+1),f,f.name));
  submitBtn.disabled=true;
  submitBtn.textContent="Envoi en cours…";
  try{
    const res=await fetch("https://formsubmit.co/ajax/"+CONTACT_EMAIL,{method:"POST",body:data,headers:{Accept:"application/json"}});
    const json=await res.json().catch(()=>({}));
    const success=json.success===true||json.success==="true";
    if(!res.ok||!success){
      const rawMessage=String(json.message||json.Message||"").toLowerCase();
      if(rawMessage.includes("activ")||rawMessage.includes("confirm")){
        throw new Error("Le formulaire doit d’abord être activé par e-mail. Ouvrez le message FormSubmit reçu sur l’adresse de contact, cliquez sur « Activate Form », puis renvoyez votre demande.");
      }
      throw new Error(json.message||"L’envoi n’a pas abouti. Réessayez dans quelques instants.");
    }
    show("success","Votre demande est bien partie. Nous revenons vers vous par e-mail.");
    form.reset();selectedFiles=[];summary.textContent="";setOffer("mp3",false);
  }catch(err){
    show("error",err.message||"Une erreur est survenue.");
  }finally{
    submitBtn.disabled=false;
    submitBtn.textContent="Envoyer ma demande →";
  }
});