// Calculate Easter Date for a given year
const getEasterDate = (y) => {
    const f = Math.floor,
        G = y % 19,
        C = f(y / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (y + f(y / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        Month = 3 + f((L + 40) / 44),
        Day = L + 28 - 31 * f(Month / 4);
    return new Date(y, Month - 1, Day);
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const getHolidays = (y) => {
    const easter = getEasterDate(y);

    const holidays = [
        { date: new Date(y, 0, 1), name: 'Neujahr' },
        { date: addDays(easter, -2), name: 'Karfreitag' },
        { date: addDays(easter, 1), name: 'Ostermontag' },
        { date: new Date(y, 4, 1), name: 'Tag der Arbeit' },
        { date: addDays(easter, 39), name: 'Christi Himmelfahrt' },
        { date: addDays(easter, 50), name: 'Pfingstmontag' },
        { date: addDays(easter, 60), name: 'Fronleichnam' },
        { date: new Date(y, 9, 3), name: 'Tag der Dt. Einheit' },
        { date: new Date(y, 10, 1), name: 'Allerheiligen' },
        { date: new Date(y, 11, 25), name: '1. Weihnachtstag' },
        { date: new Date(y, 11, 26), name: '2. Weihnachtstag' },
    ];
    return holidays;
};

export const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

export const isHoliday = (date) => {
    const year = date.getFullYear();
    const holidays = getHolidays(year);
    return holidays.some(h =>
        h.date.getDate() === date.getDate() &&
        h.date.getMonth() === date.getMonth()
    );
};
