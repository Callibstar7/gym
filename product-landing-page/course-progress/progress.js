(() => {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const safeGet = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const safeSet = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  if (safeGet('orbit_demo_signed_in') !== 'true') { location.replace('../account.html?mode=signin'); return; }
  if (safeGet('orbit_demo_membership') !== 'active') { location.replace('../pricing.html'); return; }
  const courseId = params.get('course') || safeGet('orbit_demo_course');
  const plans = {
    strength: { title:'Strength Foundations', desc:'Build a steady full-body strength routine with gradual progress.', months:['Learn comfortable squat, push, pull, and hinge patterns.','Establish two or three full-body sessions each week.','Gradually add repetitions or resistance when ready.','Build balanced strength and stability.','Consolidate your routines and prioritize recovery.','Review progress and choose your next training block.'] },
    cardio: { title:'Cardio & Endurance', desc:'Grow your aerobic base with easy sessions and gradual intervals.', months:['Begin comfortable walks, rides, or swims.','Extend one easy session gradually.','Add short, comfortable intervals when ready.','Grow endurance while keeping most sessions easy.','Practice sessions suited to the activity you enjoy.','Review your stamina and set a new goal.'] },
    mobility: { title:'Mobility Reset', desc:'Create a repeatable mobility habit and explore comfortable range of motion.', months:['Explore gentle hip, ankle, shoulder, and spine movements.','Schedule three short mobility sessions each week.','Practice slow, controlled movement.','Combine upper- and lower-body mobility into a flow.','Personalize the routine without forcing a stretch.','Keep helpful movements and choose a new focus.'] },
    home: { title:'At-Home Starter', desc:'Start with accessible bodyweight sessions that need little or no equipment.', months:['Practice chair squats, wall push-ups, bridges, and easy walks.','Build consistency with two short full-body sessions weekly.','Increase repetitions or choose a slightly harder variation.','Balance strength days with walks and mobility.','Repeat favorite sessions and adapt around busy days.','Review what feels easier and choose a next step.'] },
    event: { title:'5K Run Builder', desc:'Progress from walk-run sessions toward completing a comfortable 5K.', months:['Begin with easy walk-run intervals and recovery.','Repeat sessions at a comfortable pace.','Gradually add running time while keeping effort easy.','Build one longer weekly walk-run session.','Practice a steady schedule without rushing increases.','Review your progress and choose a comfortable 5K goal.'] }
  };
  const course = plans[courseId];
  if (!course) { location.replace('../personal-plan/index.html'); return; }
  const localDate = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const startDate = params.get('started') || safeGet('orbit_demo_course_started') || localDate();
  safeSet('orbit_demo_course', courseId);
  safeSet('orbit_demo_course_started', startDate);
  $('courseTitle').textContent = course.title;
  $('courseDescription').textContent = course.desc + ' Your daily check-ins and monthly course progress are tracked here.';

  const foodNames={balanced:'Balanced',vegetarian:'Vegetarian',quick:'Quick prep'};
  const hydrationNames={throughout:'Steady through the day','around-workouts':'Around workouts','with-meals':'With meals'};
  const timeNames={morning:'Morning',midday:'Midday',evening:'Evening',flexible:'Flexible'};
  const foodChoice=params.get('food')||safeGet('orbit_demo_food')||'balanced';
  const hydrationChoice=params.get('hydration')||safeGet('orbit_demo_hydration')||'throughout';
  const timeChoice=params.get('time')||safeGet('orbit_demo_workout_time')||'morning';
  const daysChoice=params.get('days')||safeGet('orbit_demo_workout_days')||'3';
  $('planFood').textContent=foodNames[foodChoice]||'Balanced';
  $('planHydration').textContent=hydrationNames[hydrationChoice]||'Steady through the day';
  $('planSchedule').textContent=(timeNames[timeChoice]||'Flexible')+' · '+daysChoice+' days/week';
  const editParams=new URLSearchParams({course:courseId,started:startDate,food:foodChoice,hydration:hydrationChoice,time:timeChoice,days:daysChoice});
  $('editPlanLink').href='../personal-plan/index.html?'+editParams.toString();  function readLogs() { try { return JSON.parse(safeGet('orbit_demo_checkins') || '{}') || {}; } catch (_) { return {}; } }
  let logs = readLogs();
  const dateField = $('checkinDate');
  dateField.value = localDate();
  const statuses = { completed:'Completed workout', partial:'Partial workout', recovery:'Rest or recovery', missed:'Did not train' };

  function monthIndexAt(dateString) {
    const start = new Date(startDate + 'T00:00:00');
    const now = new Date(dateString + 'T00:00:00');
    return Math.max(0, Math.min(5, (now.getFullYear()-start.getFullYear())*12 + now.getMonth()-start.getMonth()));
  }
  function render() {
    logs = readLogs();
    const elapsedDays = Math.max(0, Math.floor((Date.now()-new Date(startDate+'T00:00:00').getTime())/86400000));
    const month = Math.min(5, Math.floor(elapsedDays/30.4375));
    const percent = Math.min(100, Math.round(elapsedDays/182*100));
    $('statMonth').textContent = percent >= 100 ? 'Complete' : `Month ${month+1} of 6`;
    $('monthBadge').textContent = percent >= 100 ? 'Program complete' : `Month ${month+1} of 6`;
    $('monthLabel').textContent = percent >= 100 ? 'Six-month program complete' : `Month ${month+1} of 6`;
    $('percentLabel').textContent = `${percent}% complete`;
    $('meterFill').style.width = `${percent}%`;
    $('programMeter').setAttribute('aria-valuenow', percent);
    const roadmap=$('roadmap');roadmap.innerHTML='';
    course.months.forEach((milestone,index)=>{
      const item=document.createElement('article');
      item.className='month'+(index<month?' done':'')+(index===month&&percent<100?' current':'');
      const heading=document.createElement('b');heading.textContent=`MONTH ${index+1}`;
      const detail=document.createElement('p');detail.textContent=milestone;
      item.append(heading,detail);roadmap.appendChild(item);
    });
    const now=new Date();const prefix=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-`;
    const monthLogs=Object.entries(logs).filter(([date,entry])=>date.startsWith(prefix)&&entry.course===courseId);
    const workouts=monthLogs.filter(([,entry])=>['completed','partial'].includes(entry.status)&&Number(entry.minutes)>0);
    $('statWorkouts').textContent=workouts.length;
    $('statMinutes').textContent=monthLogs.reduce((sum,[,entry])=>sum+(Number(entry.minutes)||0),0);
    $('statCheckins').textContent=monthLogs.length;
    $('progressDescription').textContent=`Program started ${new Date(startDate+'T00:00:00').toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'})}. The roadmap shows the current month; activity totals come from your saved check-ins.`;
    renderHistory();
  }
  function renderHistory() {
    const rows=$('historyRows');rows.innerHTML='';
    const records=Object.entries(logs).filter(([,entry])=>entry.course===courseId).sort(([a],[b])=>b.localeCompare(a)).slice(0,14);
    $('historyWrap').hidden=records.length===0;$('emptyHistory').hidden=records.length!==0;
    records.forEach(([date,entry])=>{
      const row=document.createElement('tr');
      [new Date(date+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}),statuses[entry.status]||'Check-in',String(entry.minutes||0),entry.effort||'—',entry.notes||'—'].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.appendChild(cell)});
      rows.appendChild(row);
    });
  }
  function loadDate(date) {
    const entry=logs[date];
    $('activity').value=entry?.status||'completed';
    $('minutes').value=entry?.minutes??30;
    $('effort').value=entry?.effort||'Good';
    $('notes').value=entry?.notes||'';
    $('saveBadge').textContent=entry?'Saved for this day':'Not checked in';
    $('message').textContent='';
  }
  dateField.addEventListener('change',()=>loadDate(dateField.value));
  loadDate(dateField.value);
  $('checkinForm').addEventListener('submit',event=>{
    event.preventDefault();const date=dateField.value||localDate();const status=$('activity').value;
    const minutes=['completed','partial'].includes(status)?Math.max(0,Number($('minutes').value)||0):0;
    logs[date]={course:courseId,status,minutes,effort:$('effort').value,notes:$('notes').value.trim()};
    safeSet('orbit_demo_checkins',JSON.stringify(logs));
    $('saveBadge').textContent='Saved for this day';$('message').textContent='Check-in saved. Your monthly totals and recent activity are updated.';
    render();
  });
  render();
})();



