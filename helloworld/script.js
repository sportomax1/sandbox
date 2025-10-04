// Configuration for all cities
const cities = [
  { id: 'newyork', timezone: 'America/New_York' },
  { id: 'london', timezone: 'Europe/London' },
  { id: 'tokyo', timezone: 'Asia/Tokyo' },
  { id: 'sydney', timezone: 'Australia/Sydney' },
  { id: 'paris', timezone: 'Europe/Paris' },
  { id: 'dubai', timezone: 'Asia/Dubai' },
  { id: 'singapore', timezone: 'Asia/Singapore' },
  { id: 'losangeles', timezone: 'America/Los_Angeles' }
];

/**
 * Format time for a specific timezone
 * @param {string} timezone - IANA timezone string
 * @returns {string} Formatted time string (HH:MM:SS)
 */
function getTimeForTimezone(timezone) {
  try {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return timeString;
  } catch (error) {
    console.error(`Error getting time for ${timezone}:`, error);
    return '--:--:--';
  }
}

/**
 * Update all clocks on the page
 */
function updateAllClocks() {
  cities.forEach(city => {
    const element = document.getElementById(`time-${city.id}`);
    if (element) {
      element.textContent = getTimeForTimezone(city.timezone);
    }
  });
}

/**
 * Initialize the clock application
 */
function initClocks() {
  // Update immediately on load
  updateAllClocks();
  
  // Update every second
  setInterval(updateAllClocks, 1000);
}

// Start the clocks when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClocks);
} else {
  // DOM is already ready
  initClocks();
}
