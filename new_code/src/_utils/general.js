export function getInitials(firstName, lastName) {
    // Get the first character of first name (if exists)
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
    
    // Get the first character of last name (if exists)
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
    
    // Combine the initials
    return firstInitial + lastInitial;
}

export const formatActionName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };