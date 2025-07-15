import React, { useState, useEffect } from 'react';

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const renderDaysInMonth = () => {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        let days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="empty-day"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <div
                    key={day}
                    className={`day ${selectedDate === day ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>Prev</button>
                <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>Next</button>
            </div>
            <div className="calendar-body">
                <div className="days-of-week">
                    {daysOfWeek.map(day => (
                        <div key={day} className="day-of-week">{day}</div>
                    ))}
                </div>
                <div className="days-grid">
                    {renderDaysInMonth()}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
