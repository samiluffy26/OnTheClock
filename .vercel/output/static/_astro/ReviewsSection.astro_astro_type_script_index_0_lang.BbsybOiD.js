const L="http://localhost:3001/api";let m=[],c=0,b;async function k(){try{const e=await(await fetch(`${L}/reviews/stats`)).json(),n=document.getElementById("totalReviews"),i=document.getElementById("avgRating");n&&(n.textContent=e.totalReviews),i&&(i.textContent=e.averageRating)}catch(t){console.error("Error loading stats:",t)}}async function x(){try{const t=document.getElementById("testimonialWrapper");if(!t)return;t.innerHTML='<div class="loading">Loading reviews...</div>';const n=await(await fetch(`${L}/reviews?page=1&limit=100`)).json();if(n.reviews.length===0){t.innerHTML='<div class="loading">No reviews yet. Be the first to share your experience!</div>';return}m=n.reviews,R(),f()}catch(t){console.error("Error loading reviews:",t);const e=document.getElementById("testimonialWrapper");e&&(e.innerHTML='<div class="loading">Error loading reviews. Please try again later.</div>')}}function C(t){return t.split(" ").map(e=>e[0]).join("").substring(0,2)}function R(){const t=document.getElementById("testimonialWrapper");t&&(t.innerHTML=m.map((e,n)=>`
      <div class="testimonial-slide ${n===0?"active":""}">
        <div class="testimonial-card">
          <div class="testimonial-quote">"</div>
          
          <div class="testimonial-header">
            <div class="testimonial-avatar">
              ${C(e.name)}
            </div>
            <div class="testimonial-info">
              <div class="testimonial-name">${w(e.name)}</div>
              ${e.location?`
                <div class="testimonial-location">
                  📍 ${w(e.location)}
                </div>
              `:""}
              ${e.serviceType!=="other"?`
                <div class="testimonial-service">
                  ${H(e.serviceType)}
                </div>
              `:""}
            </div>
            <div class="testimonial-rating">
              <div class="testimonial-stars">
                ${"★".repeat(e.rating)}${"☆".repeat(5-e.rating)}
              </div>
              <div class="testimonial-date">${j(e.approvedAt||e.createdAt)}</div>
            </div>
          </div>
          
          <div class="testimonial-content">
            <p class="testimonial-comment">"${w(e.comment)}"</p>
            <div class="testimonial-footer">
              <div class="verified-badge">
                Verified Customer
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join(""),D(),$())}function D(){const t=document.getElementById("carouselIndicators");if(t){if(m.length<=1){t.innerHTML="";return}t.innerHTML=m.map((e,n)=>`
      <div class="indicator-dot ${n===0?"active":""}" data-slide="${n}"></div>
    `).join(""),document.querySelectorAll(".indicator-dot").forEach(e=>{e.addEventListener("click",function(){const n=parseInt(this.getAttribute("data-slide")||"0");p(n)})})}}function p(t){c=t,document.querySelectorAll(".testimonial-slide").forEach(n=>{n.classList.remove("active")});const e=document.querySelectorAll(".testimonial-slide");e[c]&&e[c].classList.add("active"),document.querySelectorAll(".indicator-dot").forEach((n,i)=>{n.classList.toggle("active",i===c)}),$(),q()}function y(){c<m.length-1&&p(c+1)}function I(){c>0&&p(c-1)}function $(){const t=document.getElementById("carouselPrev"),e=document.getElementById("carouselNext");!t||!e||(t.disabled=c===0,e.disabled=c>=m.length-1)}function f(){b=setInterval(()=>{c<m.length-1?y():p(0)},6e3)}function q(){clearInterval(b),f()}function B(){clearInterval(b)}function w(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function H(t){return{wheelchair:"Wheelchair Transport",ambulance:"Ambulance Service",standard:"Standard Transport","medication-delivery":"Medication Delivery"}[t]||t}function j(t){const e=new Date(t),i=Math.abs(new Date-e),a=Math.ceil(i/(1e3*60*60*24));if(a===0)return"Today";if(a===1)return"Yesterday";if(a<7)return`${a} days ago`;if(a<30)return`${Math.floor(a/7)} weeks ago`;const v=e.toLocaleDateString("en-US",{month:"long"}),l=e.getDate(),s=e.getFullYear();return`${v} ${l}, ${s}`}function N(){const t=document.getElementById("reviewModal"),e=document.getElementById("openReviewForm"),n=document.getElementById("closeReviewModal"),i=document.getElementById("reviewForm"),a=document.getElementById("reviewSuccess"),v=document.getElementById("closeSuccess");if(!t||!e||!n||!i)return;e.addEventListener("click",()=>{t.classList.add("active"),document.body.style.overflow="hidden",B()}),n.addEventListener("click",l),v&&v.addEventListener("click",l),t.addEventListener("click",r=>{r.target===t&&l()});function l(){t.classList.remove("active"),document.body.style.overflow="auto",i.reset(),i.style.display="block",a&&(a.style.display="none"),document.querySelectorAll(".star").forEach(r=>r.classList.remove("active")),f()}const s=document.querySelectorAll(".star"),d=document.getElementById("reviewRating"),g=document.getElementById("ratingError");s.forEach(r=>{r.addEventListener("click",function(){const o=this.getAttribute("data-rating");d&&(d.value=o),g&&(g.style.display="none"),s.forEach(u=>{parseInt(u.getAttribute("data-rating")||"0")<=parseInt(o||"0")?u.classList.add("active"):u.classList.remove("active")})}),r.addEventListener("mouseenter",function(){const o=this.getAttribute("data-rating");s.forEach(u=>{parseInt(u.getAttribute("data-rating")||"0")<=parseInt(o||"0")?u.style.color="#FDB022":u.style.color="#E5E7EB"})})});const S=document.querySelector(".star-rating");S&&S.addEventListener("mouseleave",function(){const r=d?.value;s.forEach(o=>{r&&parseInt(o.getAttribute("data-rating")||"0")<=parseInt(r)?o.style.color="#FDB022":o.style.color="#E5E7EB"})});const E=document.getElementById("reviewComment"),T=document.getElementById("charCount");E&&T&&E.addEventListener("input",function(){T.textContent=this.value.length.toString()}),i.addEventListener("submit",async function(r){if(r.preventDefault(),!d?.value){g&&(g.style.display="block");return}const o=document.getElementById("submitReview");if(!o)return;const u=o.textContent;o.textContent="Submitting...",o.disabled=!0;try{const h={name:document.getElementById("reviewName")?.value,email:document.getElementById("reviewEmail")?.value,location:document.getElementById("reviewLocation")?.value,serviceType:document.getElementById("reviewService")?.value,rating:parseInt(d.value),comment:E?.value},A=await fetch(`${L}/reviews`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(h)}),M=await A.json();A.ok?(i.style.display="none",a&&(a.style.display="block")):alert(M.message||"Error submitting review. Please try again.")}catch(h){console.error("Error submitting review:",h),alert("Error submitting review. Please try again.")}finally{o.textContent=u,o.disabled=!1}})}function P(){const t=document.getElementById("carouselPrev"),e=document.getElementById("carouselNext");t&&t.addEventListener("click",I),e&&e.addEventListener("click",y);let n=0,i=0;const a=document.getElementById("testimonialWrapper");a&&(a.addEventListener("touchstart",s=>{n=s.changedTouches[0].screenX,B()}),a.addEventListener("touchend",s=>{i=s.changedTouches[0].screenX,v(),f()}));function v(){const d=n-i;Math.abs(d)>50&&(d>0?y():I())}const l=document.querySelector(".testimonial-carousel");l&&(l.addEventListener("mouseenter",B),l.addEventListener("mouseleave",f)),document.addEventListener("keydown",s=>{document.getElementById("reviewModal")?.classList.contains("active")||(s.key==="ArrowLeft"?I():s.key==="ArrowRight"&&y())})}document.addEventListener("DOMContentLoaded",()=>{k(),x(),N(),P()});
