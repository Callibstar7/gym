(() => {
  let signedIn=false, hasMembership=false;
  try { signedIn=localStorage.getItem('orbit_demo_signed_in')==='true'; hasMembership=localStorage.getItem('orbit_demo_membership')==='active'; } catch (_) {}
  if (!signedIn) { location.replace('account.html?mode=signin'); return; }
  if (!hasMembership) { location.replace('pricing.html'); return; }
  const names={starter:'Essential',team:'Plus',business:'Pro'};
  try { const plan=localStorage.getItem('orbit_demo_plan'); if(plan&&names[plan]) document.getElementById('planBadge').textContent=names[plan]+' membership'; } catch (_) {}
  document.getElementById('signOut').addEventListener('click',event=>{event.preventDefault();try{localStorage.removeItem('orbit_demo_signed_in');localStorage.removeItem('orbit_demo_email')}catch(_){}location.href='index.html'});
})();
