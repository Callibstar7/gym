(() => {
  const $ = (id) => document.getElementById(id);
  const query = new URLSearchParams(location.search);
  const titles = {strength:'Strength Foundations',cardio:'Cardio & Endurance',mobility:'Mobility Reset',home:'At-Home Starter',event:'5K Run Builder'};
  const foodTitles = {balanced:'Balanced',vegetarian:'Vegetarian',quick:'Quick prep'};
  const waterTitles = {throughout:'Steady through the day','around-workouts':'Around workouts','with-meals':'With meals'};
  const timeTitles = {morning:'Morning',midday:'Midday',evening:'Evening',flexible:'Flexible'};
  const get = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const set = (key,value) => { try { localStorage.setItem(key,value); } catch (_) {} };
  if (get('orbit_demo_signed_in') !== 'true') { location.replace('../account.html?mode=signin'); return; }
  if (get('orbit_demo_membership') !== 'active') { location.replace('../pricing.html'); return; }
  const course = document.getElementById('course');
  const preferredCourse = query.get('course') || get('orbit_demo_course');
  if (titles[preferredCourse]) course.value = preferredCourse;
  const oldFood = query.get('food') || get('orbit_demo_food');
  if (foodTitles[oldFood]) document.querySelector(`input[name="food"][value="${oldFood}"]`).checked = true;
  const oldWater = query.get('hydration') || get('orbit_demo_hydration');
  if (waterTitles[oldWater]) document.querySelector(`input[name="hydration"][value="${oldWater}"]`).checked = true;
  if (timeTitles[get('orbit_demo_workout_time')]) $('workoutTime').value = get('orbit_demo_workout_time');
  const oldDays = query.get('days') || get('orbit_demo_workout_days');
  if (['2','3','4','5'].includes(oldDays)) document.querySelector(`input[name="days"][value="${oldDays}"]`).checked = true;
  function selected(name) { return document.querySelector(`input[name="${name}"]:checked`).value; }
  function updateSummary() {
    $('sumCourse').textContent = titles[course.value];
    const food = selected('food'), hydration = selected('hydration'), time = $('workoutTime').value, days = selected('days');
    $('sumFood').textContent = foodTitles[food];
    $('sumHydration').textContent = waterTitles[hydration];
    $('sumSchedule').textContent = `${timeTitles[time]} · ${days} days/week`;
  }
  document.querySelectorAll('#planForm select,input').forEach(control => control.addEventListener('change',updateSummary));
  updateSummary();
  $('planForm').addEventListener('submit',event=>{
    event.preventDefault();
    const selectedCourse=course.value, food=selected('food'), hydration=selected('hydration'), time=$('workoutTime').value, days=selected('days');
    const todayObj=new Date(), today=`${todayObj.getFullYear()}-${String(todayObj.getMonth()+1).padStart(2,'0')}-${String(todayObj.getDate()).padStart(2,'0')}`;
    let started=today;
    try {
      const previous=query.get('course')||localStorage.getItem('orbit_demo_course');
      started=query.get('started')||localStorage.getItem('orbit_demo_course_started')||today;
      if(previous!==selectedCourse) started=today;
      localStorage.setItem('orbit_demo_course',selectedCourse);
      localStorage.setItem('orbit_demo_course_started',started);
      localStorage.setItem('orbit_demo_food',food);
      localStorage.setItem('orbit_demo_hydration',hydration);
      localStorage.setItem('orbit_demo_workout_time',time);
      localStorage.setItem('orbit_demo_workout_days',days);
      localStorage.setItem('orbit_demo_personal_plan',JSON.stringify({course:selectedCourse,food,hydration,time,days,updated:today}));
    } catch (_) { started=today; }
    const next=new URLSearchParams({course:selectedCourse,started,food,hydration,time,days});
    location.href='../course-progress/index.html?'+next.toString();
  });
})();




