/**
 * Formats a Date object or date string to a localized Spanish date in UTC timezone
 */
export const formatDate = (dateVal: any): string => {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Madrid',
    });
};

/**
 * Formats a Date object or date string to a string time (HH:MM) in Europe/Madrid timezone
 */
export const formatTime = (dateVal: any): string => {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Madrid',
    });
};

/**
 * Formats a Date object or date string to full Spanish date and time in UTC timezone
 */
export const formatDateTime = (dateVal: any): string => {
    if (!dateVal) return 'Sin programar';
    const formattedDate = formatDate(dateVal);
    const formattedTime = formatTime(dateVal);
    if (!formattedDate || !formattedTime) return 'Sin programar';
    return `${formattedDate} a las ${formattedTime}`;
};

/**
 * Returns the end year of a season based on its start year (simply adds 1)
 */
export const getSeasonEndYear = (startYear: number): number => {
    return startYear + 1;
};
