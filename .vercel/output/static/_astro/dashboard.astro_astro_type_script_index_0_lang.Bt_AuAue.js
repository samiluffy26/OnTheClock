const l="http://localhost:3001/api";let n=1,d="",p=1,s="";function f(){return s=localStorage.getItem("adminToken"),s?!0:(window.location.href="/admin/login",!1)}async function w(){try{const e=await fetch(`${l}/auth/me`,{headers:{Authorization:`Bearer ${s}`}});if(e.ok){const t=await e.json();document.getElementById("adminName").textContent=t.name,document.getElementById("adminRole").textContent=t.role,document.getElementById("adminAvatar").textContent=t.name.charAt(0).toUpperCase()}else g()}catch(e){console.error("Error loading admin info:",e)}}async function v(){try{const t=await(await fetch(`${l}/reviews/admin/all`,{headers:{Authorization:`Bearer ${s}`}})).json(),a=t.totalReviews,r=t.reviews.filter(i=>i.status==="pending").length,u=t.reviews.filter(i=>i.status==="approved").length,o=t.reviews.filter(i=>i.status==="rejected").length;document.getElementById("totalReviews").textContent=a,document.getElementById("pendingReviews").textContent=r,document.getElementById("approvedReviews").textContent=u,document.getElementById("rejectedReviews").textContent=o}catch(e){console.error("Error loading stats:",e)}}async function c(e=1,t=""){try{const a=document.getElementById("reviewsContainer");a.innerHTML='<div class="loading">Loading reviews...</div>';let r=`${l}/reviews/admin/all?page=${e}&limit=20`;t&&(r+=`&status=${t}`);const o=await(await fetch(r,{headers:{Authorization:`Bearer ${s}`}})).json();if(o.reviews.length===0){a.innerHTML=`
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <p>No reviews found</p>
            </div>
          `,document.getElementById("paginationContainer").style.display="none";return}n=parseInt(o.currentPage),p=o.totalPages,a.innerHTML=`
          <div class="reviews-grid">
            ${o.reviews.map(i=>h(i)).join("")}
          </div>
        `,y(),$(o)}catch(a){console.error("Error loading reviews:",a),document.getElementById("reviewsContainer").innerHTML=`
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <p>Error loading reviews</p>
          </div>
        `}}function h(e){const t="★".repeat(e.rating)+"☆".repeat(5-e.rating),a=new Date(e.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});return`
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-customer">
              <div class="review-customer-name">${m(e.name)}</div>
              <div class="review-customer-email">${m(e.email)}</div>
            </div>
            <div class="review-rating">
              <div class="rating-stars-large">${t}</div>
              <span class="rating-number">${e.rating}</span>
            </div>
          </div>

          <div class="review-meta">
            <span class="review-service-tag">
              🚗 ${I(e.serviceType)}
            </span>
            <span class="review-date-tag">
              📅 ${a}
            </span>
          </div>

          <div class="review-comment-box">
            <div class="review-comment-text">${m(e.comment)}</div>
          </div>

          <div class="review-status-row">
            <span class="status-badge ${e.status}">
              ${e.status==="pending"?"⏳":e.status==="approved"?"✅":"❌"}
              ${e.status}
            </span>
            ${e.featured?'<span class="featured-badge-large">⭐ Featured</span>':""}
          </div>

          <div class="review-actions">
            ${e.status!=="approved"?`
              <button class="btn-action btn-approve" data-action="approve" data-id="${e._id}">
                ✓ Approve
              </button>
            `:""}
            ${e.status!=="rejected"?`
              <button class="btn-action btn-reject" data-action="reject" data-id="${e._id}">
                ✗ Reject
              </button>
            `:""}
            ${e.status==="approved"?`
              <button class="btn-action ${e.featured?"btn-unfeature":"btn-feature"}" data-action="feature" data-id="${e._id}" data-featured="${e.featured}">
                ${e.featured?"★ Unfeature":"☆ Feature"}
              </button>
            `:""}
            <button class="btn-action btn-delete" data-action="delete" data-id="${e._id}">
              🗑 Delete
            </button>
          </div>
        </div>
      `}function y(){document.querySelectorAll(".btn-action").forEach(e=>{e.addEventListener("click",async function(t){t.preventDefault();const a=this.dataset.action,r=this.dataset.id;switch(a){case"approve":await E(r);break;case"reject":await B(r);break;case"feature":const u=this.dataset.featured==="true";await b(r,u);break;case"delete":await j(r);break}})})}function $(e){const t=document.getElementById("paginationContainer"),a=document.getElementById("paginationInfo"),r=document.getElementById("prevPageBtn"),u=document.getElementById("nextPageBtn"),o=(n-1)*20+1,i=Math.min(n*20,e.totalReviews);a.textContent=`Showing ${o}-${i} of ${e.totalReviews} reviews`,r.disabled=n===1,u.disabled=n===p,t.style.display="flex"}async function E(e){if(confirm("Approve this review?"))try{const t=await fetch(`${l}/reviews/admin/${e}/approve`,{method:"PATCH",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"}});if(t.ok)alert("Review approved successfully!"),await c(n,d),await v();else{const a=await t.json();alert(`Error: ${a.message||"Failed to approve review"}`)}}catch(t){console.error("Error approving review:",t),alert("Error approving review.")}}async function B(e){if(confirm("Reject this review?"))try{const t=await fetch(`${l}/reviews/admin/${e}/reject`,{method:"PATCH",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"}});if(t.ok)alert("Review rejected successfully!"),await c(n,d),await v();else{const a=await t.json();alert(`Error: ${a.message||"Failed to reject review"}`)}}catch(t){console.error("Error rejecting review:",t),alert("Error rejecting review.")}}async function b(e,t){try{const a=await fetch(`${l}/reviews/admin/${e}/feature`,{method:"PATCH",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"}});if(a.ok)alert(`Review ${t?"unfeatured":"featured"} successfully!`),await c(n,t);else{const r=await a.json();alert(`Error: ${r.message||"Failed to update review"}`)}}catch(a){console.error("Error toggling feature:",a),alert("Error updating review.")}}async function j(e){if(confirm("Are you sure you want to delete this review? This action cannot be undone."))try{const t=await fetch(`${l}/reviews/admin/${e}`,{method:"DELETE",headers:{Authorization:`Bearer ${s}`,"Content-Type":"application/json"}});if(t.ok)alert("Review deleted successfully!"),await c(n,d),await v();else{const a=await t.json();alert(`Error: ${a.message||"Failed to delete review"}`)}}catch(t){console.error("Error deleting review:",t),alert("Error deleting review.")}}function m(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function I(e){return{wheelchair:"Wheelchair",ambulance:"Ambulance",standard:"Standard","medication-delivery":"Medication",other:"Other"}[e]||e}function g(){localStorage.removeItem("adminToken"),localStorage.removeItem("adminData"),window.location.href="/admin/login"}document.getElementById("logoutBtn").addEventListener("click",g);document.getElementById("statusFilter").addEventListener("change",function(){d=this.value,n=1,c(n,d)});document.getElementById("prevPageBtn").addEventListener("click",()=>{n>1&&c(n-1,d)});document.getElementById("nextPageBtn").addEventListener("click",()=>{n<p&&c(n+1,d)});f()&&(w(),v(),c());
