// DOM Elements
    const hourHand = document.getElementById('hour');
    const minuteHand = document.getElementById('minute');
    const secondHand = document.getElementById('second');
    const digitalClock = document.getElementById('digitalClock');
    const dateElement = document.getElementById('date');
    const hoursSelect = document.getElementById('hours');
    const minutesSelect = document.getElementById('minutes');
    const secondsSelect = document.getElementById('seconds');
    const ampmSelect = document.getElementById('ampm');
    const setAlarmBtn = document.getElementById('setAlarm');
    const stopAlarmBtn = document.getElementById('stopAlarm');
    const customAudio = document.getElementById('customAudio');
    const alarmSound = document.getElementById('alarmSound');
    const alarmStatus = document.getElementById('alarmStatus');
    const alarmList = document.getElementById('alarmList');
    const currentAlarmFile = document.getElementById('currentAlarmFile');

    // Variables
    let alarms = [];
    let isAlarmPlaying = false;

    // Populate time dropdowns
    function populateDropdowns() {
      // Populate hours (1-12)
      for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        hoursSelect.appendChild(option);
      }

      // Populate minutes (0-59)
      for (let i = 0; i < 60; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        minutesSelect.appendChild(option);
        
        // Also populate seconds
        const secOption = document.createElement('option');
        secOption.value = i;
        secOption.textContent = i.toString().padStart(2, '0');
        secondsSelect.appendChild(secOption);
      }

      // Set default time to current time + 1 minute
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      
      hoursSelect.value = hours;
      minutesSelect.value = (now.getMinutes() + 1) % 60;
      secondsSelect.value = now.getSeconds();
      ampmSelect.value = ampm;
    }

    // Update clock
    function updateClock() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Update analog clock
      const hourDeg = (hours % 12) * 30 + minutes * 0.5;
      const minuteDeg = minutes * 6 + seconds * 0.1;
      const secondDeg = seconds * 6;
      
      hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
      minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
      secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
      
      // Update digital clock
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
      digitalClock.textContent = `${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
      
      // Update date
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateElement.textContent = now.toLocaleDateString('en-US', options);
      
      // Check alarms
      checkAlarms(hours, minutes, seconds);
    }

    // Check if any alarm should trigger
    function checkAlarms(hours, minutes, seconds) {
      if (isAlarmPlaying) return;
      
      const currentTime12 = convertTo12HourFormat(hours, minutes, seconds);
      
      for (const alarm of alarms) {
        if (alarm.hours == currentTime12.hours && 
            alarm.minutes == currentTime12.minutes && 
            alarm.seconds == currentTime12.seconds && 
            alarm.ampm === currentTime12.ampm) {
          triggerAlarm();
          break;
        }
      }
    }

    // Convert 24h time to 12h format
    function convertTo12HourFormat(hours, minutes, seconds) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const twelveHour = hours % 12 || 12;
      return {
        hours: twelveHour,
        minutes: minutes,
        seconds: seconds,
        ampm: ampm
      };
    }

    // Trigger the alarm
    function triggerAlarm() {
      isAlarmPlaying = true;
      alarmSound.play();
      alarmStatus.textContent = 'Alarm is ringing!';
      document.body.style.animation = 'pulse 0.5s infinite';
    }

    // Stop the alarm
    function stopAlarm() {
      isAlarmPlaying = false;
      alarmSound.pause();
      alarmSound.currentTime = 0;
      alarmStatus.textContent = '';
      document.body.style.animation = 'none';
    }

    // Set new alarm
    function setAlarm() {
      const hours = hoursSelect.value;
      const minutes = minutesSelect.value;
      const seconds = secondsSelect.value;
      const ampm = ampmSelect.value;
      
      const alarmTime = {
        hours,
        minutes,
        seconds,
        ampm,
        id: Date.now() // unique ID for deletion
      };
      
      alarms.push(alarmTime);
      renderAlarms();
      alarmStatus.textContent = `Alarm set for ${hours}:${minutes}:${seconds} ${ampm}`;
      
      // Clear status after 3 seconds
      setTimeout(() => {
        if (!isAlarmPlaying) {
          alarmStatus.textContent = '';
        }
      }, 3000);
    }

    // Render active alarms
    function renderAlarms() {
      alarmList.innerHTML = '';
      
      if (alarms.length === 0) {
        alarmList.innerHTML = '<p>No alarms set</p>';
        return;
      }
      
      alarms.forEach(alarm => {
        const alarmElement = document.createElement('div');
        alarmElement.className = 'alarm-item';
        alarmElement.innerHTML = `
          <span>${alarm.hours}:${alarm.minutes}:${alarm.seconds} ${alarm.ampm}</span>
          <span class="delete-alarm" data-id="${alarm.id}">Delete</span>
        `;
        alarmList.appendChild(alarmElement);
      });
      
      // Add event listeners to delete buttons
      document.querySelectorAll('.delete-alarm').forEach(button => {
        button.addEventListener('click', function() {
          const id = parseInt(this.getAttribute('data-id'));
          alarms = alarms.filter(alarm => alarm.id !== id);
          renderAlarms();
        });
      });
    }

    // Handle custom audio upload
    function handleCustomAudio(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      alarmSound.src = objectUrl;
      currentAlarmFile.textContent = `Using: ${file.name}`;
      
      // Reload the audio element
      alarmSound.load();
    }

    // Add pulsing animation for alarm
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { background: linear-gradient(135deg, #1a1a2e, #16213e); }
        50% { background: linear-gradient(135deg, #2a2a4e, #26215e); }
        100% { background: linear-gradient(135deg, #1a1a2e, #16213e); }
      }
    `;
    document.head.appendChild(style);

    // Initialize the app
    function init() {
      populateDropdowns();
      updateClock();
      setInterval(updateClock, 1000);
      renderAlarms();
      
      // Event listeners
      setAlarmBtn.addEventListener('click', setAlarm);
      stopAlarmBtn.addEventListener('click', stopAlarm);
      customAudio.addEventListener('change', handleCustomAudio);
    }

    // Start the app
    init();