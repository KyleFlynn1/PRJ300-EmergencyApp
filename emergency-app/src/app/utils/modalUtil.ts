// Utility functions for modals

// Get alert severity color based on severity level
export const getAlertSeverityColor = (severity?: string) : string => {
    switch (severity?.toLowerCase()) {
      case 'info':
        return '#797979';
      case 'low':
        return '#3ead44';
      case 'moderate':
        return '#ff8e1d';
      case 'high':
        return '#ec0303';
      case 'urgent':
        return '#f200ff';
      default:
        return '#797979'; // Default to 'info' color
    }
  }

// Get icon name based on alert category from ionic icons
export const getIcon = (category?: string) => {
    if (!category) return 'alert-circle';
    
    const c = category.toLowerCase();
    
    if (c.includes('tree') || c.includes('fallen')) return 'leaf';
    if (c.includes('injury')) return 'medkit';
    if (c.includes('person') || c.includes('missing')) return 'people';
    if (c.includes('power') || c.includes('outage')) return 'flash';
    if (c.includes('fire')) return 'flame';
    if (c.includes('flood') || c.includes('water')) return 'water';
    if (c.includes('road') || c.includes('blockage')) return 'car';
    if (c.includes('amber') || c.includes('missing')) return 'people';
    return 'alert-circle';
  }

export const getFormattedTimestamp = (timestamp: string): string => {
    const alertDate = new Date(timestamp);
    const today = new Date();
    
    // Check if it's today by comparing date strings
    const isToday = alertDate.toDateString() === today.toDateString();
    
    if (isToday) {
      // Show only time if today
      return alertDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      // Show date and time if not today
      return alertDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ' ' + 
             alertDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }