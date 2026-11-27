(() => {
  'use strict';
  const page = location.pathname.split('/').pop().replace(/\.(html|php)$/, '') || 'index';
  const cities = {Australia:['Sydney','Melbourne'],Japan:['Tokyo','Osaka'],'South Korea':['Seoul','Busan','Jeju']};
  const airports = ['Sydney Airport (SYD)','Melbourne Airport (MEL)','Tokyo Haneda (HND)','Tokyo Narita (NRT)','Osaka Kansai (KIX)','Seoul Incheon (ICN)','Busan Gimhae (PUS)','Jeju Airport (CJU)'];
  let data = {};
  try { data = JSON.parse(sessionStorage.getItem('fresh-booking') || '{}'); } catch (_) {}
  const save = () => sessionStorage.setItem('fresh-booking', JSON.stringify(data));
  const options = values => values.map(v => `<option>${v}</option>`).join('');
  const field = (label,name,type='text',value='',required=true) => `<div class="field"><label for="${name}">${label}</label><input class="input" id="${name}" name="${name}" type="${type}" ${required?'required':''} value="${value}"></div>`;
  const select = (label,name,values) => `<div class="field"><label for="${name}">${label}</label><select class="select" id="${name}" name="${name}">${options(values)}</select></div>`;
  const passengers = Array.from({length:8},(_,i)=>String(i+1));
  const today = new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
  const minimum = today.toISOString().slice(0,10);
  function setup(form, next, service) {
    form.querySelectorAll('[name]').forEach(el => { if(data[el.name] != null) el.value=data[el.name]; });
    form.querySelectorAll('[type=date]').forEach(el=>el.min=minimum);
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const values=Object.fromEntries(new FormData(form));
      const date=form.querySelector('[name=date]');
      if(date) {
        date.setCustomValidity(new Date(`${values.date}T${values.time || '23:59'}`) <= new Date()?'Choose a future pickup time.':'');
        const ret=form.querySelector('[name=returnDate]');
        if(ret) ret.setCustomValidity(values.returnDate && `${values.returnDate}T${values.returnTime}` <= `${values.date}T${values.time}`?'Return must be after pickup.':'');
      }
      if(!form.reportValidity()) return;
      data={...data,...values};
      if(service) {data.service=service; delete data.vehicle;}
      save(); location.href=next+'.html';
    });
    form.addEventListener('input',()=>form.querySelectorAll('input').forEach(el=>el.setCustomValidity('')));
  }
  if(page==='index') {
    const old=document.querySelector('.searchbox');
    old.outerHTML=`<form class="searchbox" id="home-booking">${select('Service','service',['Airport Transfer','Chauffeur'])}${select('Country','country',Object.keys(cities))}${select('City','city',cities.Australia)}${field('Date','date','date')}${select('Passengers','passengers',passengers)}<button class="btn">Get Quote →</button></form>`;
    const form=document.querySelector('#home-booking');
    form.querySelectorAll('[name]').forEach(el=>{if(data[el.name]!=null)el.value=data[el.name];});
    form.elements.date.min=minimum;
    const country=form.elements.country;
    const update=()=>{form.elements.city.innerHTML=options(cities[country.value]);};
    country.addEventListener('change',update); update();
    if(cities[country.value].includes(data.city)) form.elements.city.value=data.city;
    form.addEventListener('submit',e=>{e.preventDefault(); if(!form.reportValidity())return; data={...Object.fromEntries(new FormData(form))}; save();location.href=(data.service==='Chauffeur'?'chauffeur':'airport-transfer')+'.html';});
  }
  if(page==='airport-transfer'||page==='chauffeur') {
    const airport=page==='airport-transfer';
    if(airport) {document.body.classList.add('airport-booking');document.querySelector('.hero').remove();}
    const card=document.querySelector('.form-card');
    card.outerHTML=`<form class="form-card" id="trip-form">${airport?'<div class="tabs" role="group" aria-label="Trip type"><button class="tab active" type="button" data-trip="One Way" aria-pressed="true">One Way</button><button class="tab" type="button" data-trip="Return" aria-pressed="false">Return</button></div><input type="hidden" name="tripType" value="One Way"><div class="spacer"></div>':''}<div class="form-grid">${airport?select('Pickup Location','pickup',airports)+field('Drop-off Location','dropoff'):select('City','city',Object.values(cities).flat())+field('Pickup Address','pickup')}${field('Date','date','date')}${field('Time','time','time','10:00')}${select('Passengers','passengers',passengers)}${airport?'':select('Service Hours','hours',['4','8','10','12'])}</div>${airport?'<div class="form-grid return-fields" hidden>'+field('Return Date','returnDate','date','',false)+field('Return Time','returnTime','time','10:00',false)+'</div>':'<div class="spacer"></div><div class="field"><label for="itinerary">Your Itinerary (Optional)</label><textarea class="textarea" name="itinerary" id="itinerary" placeholder="Places you want to visit"></textarea></div>'}<div class="spacer"></div><button class="btn" style="width:100%">Search Vehicles →</button></form>`;
    const form=document.querySelector('#trip-form'); setup(form,'vehicle',airport?'Airport Transfer':'Chauffeur');
    if(airport) {
      if(data.city && !data.pickup) form.elements.pickup.value=airports.find(a=>a.startsWith(data.city)) || airports[0];
      const toggle=type=>{
        form.elements.tripType.value=type;
        form.querySelectorAll('[data-trip]').forEach(b=>{b.classList.toggle('active',b.dataset.trip===type);b.setAttribute('aria-pressed',String(b.dataset.trip===type));});
        form.querySelector('.return-fields').hidden=type!=='Return';
        ['returnDate','returnTime'].forEach(n=>{form.elements[n].required=type==='Return';form.elements[n].disabled=type!=='Return';});
      };
      form.querySelectorAll('[data-trip]').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.trip)));
      toggle(data.tripType || 'One Way');
    }
  }
  if(['vehicle','passenger','checkout'].includes(page) && !data.date) {location.replace('airport-transfer.html');return;}
  if(page==='vehicle') {
    document.querySelector('.section-title p').textContent='Example vehicles and indicative prices. Final availability and quote require provider confirmation.';
    document.querySelectorAll('.vehicle-card').forEach((card,i)=>{
      const capacity=[4,5,8][i];
      card.hidden=Number(data.passengers)>capacity;
      const price=[120,150,190][i]*(data.service==='Chauffeur'?Number(data.hours || 8):data.tripType==='Return'?2:1);
      card.querySelector('b').textContent=`Indicative AUD ${price}`;
      card.querySelector('.btn').addEventListener('click',()=>{data.vehicle=['Standard','Premium','Van'][i]; data.capacity=capacity;data.price=price;save();});
    });
  }
  if(page==='passenger') {
    if(!data.vehicle){location.replace('vehicle.html');return;}
    document.querySelector('.form-card').outerHTML=`<form class="form-card" id="passenger-form"><div class="form-grid">${field('Full Name','fullName')}${field('Email','email','email')}${field('Phone Number','phone','tel')}${select('Number of Passengers','passengers',passengers.slice(0,data.capacity))}${field('Flight Number (Optional)','flight','text','',false)}</div><div class="spacer"></div><div class="field"><label for="requests">Special Requests</label><textarea class="textarea" id="requests" name="requests"></textarea></div><div class="spacer"></div><button class="btn">Continue to Payment →</button></form>`;
    setup(document.querySelector('#passenger-form'),'checkout');
  }
  if(page==='checkout') {
    if(!data.fullName || !data.vehicle){location.replace('passenger.html');return;}
    document.querySelector('.section-title p').textContent='Review your booking details. Online payment is not connected yet.';
    const cards=document.querySelectorAll('.grid.two > .card'); cards[0].innerHTML='<h3>Booking Summary</h3>';
    const rows=[['Service',data.service],['Pickup',data.pickup],['Destination',data.dropoff || data.city],['Departure',`${data.date}, ${data.time}`],...(data.tripType==='Return'?[['Return',`${data.returnDate}, ${data.returnTime}`]]:[]),['Vehicle',data.vehicle],['Passengers',data.passengers],['Passenger',data.fullName],['Email',data.email],['Phone',data.phone],['Indicative total',`AUD ${data.price}`]];
    rows.forEach(([label,value])=>{const row=document.createElement('div');row.className='row';const title=document.createElement('span');title.textContent=label;const text=document.createElement('b');text.textContent=value;row.append(title,text);cards[0].append(row);});
    cards[1].innerHTML='<h3>Payment</h3><p>Your booking is a draft. Availability, final pricing and payment must be confirmed before a reservation can be made.</p><p>No payment has been taken and no booking has been sent.</p><a class="btn" href="passenger.html">Edit passenger details</a><div class="spacer"></div><a class="btn ghost" href="'+(data.service==='Chauffeur'?'chauffeur':'airport-transfer')+'.html">Edit trip details</a>';
  }
})();
