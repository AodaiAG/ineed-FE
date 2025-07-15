import React, { forwardRef, useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../../styles/AvailabilityForm.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import enGB from 'date-fns/locale/en-GB';
import { registerLocale } from 'react-datepicker';



const AvailabilityForm = forwardRef(({ dayAvailability, setDayAvailability, error, availability24_7, setAvailability24_7 }, ref) => {
    const { translation } = useLanguage();
    const [localAvailability247, setLocalAvailability247] = useState(availability24_7);
    const [firstSelection, setFirstSelection] = useState(true);
    const [openTimePicker, setOpenTimePicker] = useState({}); // Tracks open states for both pickers
    registerLocale('en-GB', enGB);
    const startInputRefs = useRef({});
    const toInputRefs = useRef({});

    const [lastSelectedTime, setLastSelectedTime] = useState({ 
        start: (() => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          return new Date(d);
        })(),
        end: (() => {
          const d = new Date();
          d.setHours(23, 0, 0, 0);
          return new Date(d);
        })()
      });
      

    useEffect(() => {
        setLocalAvailability247(availability24_7);
    }, [availability24_7]);

    const handleToggleAvailability = (dayInt) => {
        const isCurrentlyWorking = dayAvailability[dayInt].isWorking;

        setDayAvailability((prev) => ({
            ...prev,
            [dayInt]: {
                isWorking: !isCurrentlyWorking,
                start: isCurrentlyWorking ? '' : lastSelectedTime.start,
                end: isCurrentlyWorking ? '' : lastSelectedTime.end,
            }
        }));

        if (!isCurrentlyWorking) {
            // * Initial selection behavior
            if (firstSelection) {
                setFirstSelection(false);
                setTimeout(() => {
                    toggleStartPicker(dayInt, true); // Automatically open "From"
                }, 0);
            }
        } else {
            // Reset if all days are deselected
            const remainingWorkingDays = Object.values(dayAvailability).filter(day => day.isWorking);
            if (remainingWorkingDays.length <= 1) {
                setFirstSelection(true); // Reset behavior for next selection
            }
        }
    };

    const handleAvailability247Change = (checked) => {
        setLocalAvailability247(checked);
        setAvailability24_7(checked);
    };

    const handleStartTimeChange = (dayInt, value) => {
        setDayAvailability((prev) => ({
            ...prev,
            [dayInt]: { ...prev[dayInt], start: value }
        }));
        setLastSelectedTime((prev) => ({ ...prev, start: value }));
        toggleStartPicker(dayInt, false); // Close "From" and open "To"
        toggleEndPicker(dayInt, true);
    };

    const handleEndTimeChange = (dayInt, value) => {
        setDayAvailability((prev) => ({
            ...prev,
            [dayInt]: { ...prev[dayInt], end: value }
        }));
        setLastSelectedTime((prev) => ({ ...prev, end: value }));
        toggleEndPicker(dayInt, false); // Close "To"
    };

    const toggleStartPicker = (dayInt, isOpen) => {
        setOpenTimePicker((prev) => ({ ...prev, [`start-${dayInt}`]: isOpen }));
    };

    const toggleEndPicker = (dayInt, isOpen) => {
        setOpenTimePicker((prev) => ({ ...prev, [`end-${dayInt}`]: isOpen }));
    };

    if (!translation) {
        return <div>Loading...</div>;
    }

    return (
        <div ref={ref} className={styles['availability-form-container']}>
            <label className={`${styles['availability-label']} ${styles['availability-label-required']}`}>
                {translation.availabilityLabel}
            </label>
            {error && <p className={styles['error-message']}>{error}</p>}
            <div className={styles['availability-group']}>
                <div className={styles['availability-24-7']}>
                    <input
                        type="checkbox"
                        id="availability24_7"
                        checked={localAvailability247}
                        onChange={(e) => handleAvailability247Change(e.target.checked)}
                        className={styles['day-checkbox']}
                    />
                    <label htmlFor="availability24_7" className={styles['day-label']}>
                        {translation.available247Label || 'Available 24/7'}
                    </label>
                </div>

                {!localAvailability247 && Object.keys(dayAvailability).map((dayInt) => {
                    const dayName = translation.days[dayInt];
                    const isWorking = dayAvailability[dayInt].isWorking;

                    return (
                        <div key={dayInt} className={styles['day']}>
                            <div className={styles['day-checkbox-label-container']}>
                                <input
                                    type="checkbox"
                                    id={`${dayInt}-checkbox`}
                                    checked={isWorking}
                                    onChange={() => handleToggleAvailability(parseInt(dayInt))}
                                    className={styles['day-checkbox']}
                                />
                                <label htmlFor={`${dayInt}`} className={styles['day-label']}>{dayName}:</label>
                            </div>
                            <div className={styles['day-time-inputs-container']}>
                                {/* Start Time Picker */}
                                <DatePicker
                                    selected={dayAvailability[dayInt].start ? new Date(dayAvailability[dayInt].start) : null}
                                    onChange={(value) => handleStartTimeChange(parseInt(dayInt), value)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    onKeyDown={(e) => e.preventDefault()} // Prevent typing
                                    autoComplete="off"
                                    locale="en-GB"


                                    readOnly 
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="HH:mm"
                                    placeholderText={translation.fromPlaceholder}
                                    className={styles['day-input']}
                                    disabled={!isWorking}
                                    open={openTimePicker[`start-${dayInt}`] || false}
                                    onFocus={() => toggleStartPicker(dayInt, true)} // Open on focus for "From"
                                    onClickOutside={() => toggleStartPicker(dayInt, false)} // Close if clicked outside
                                    ref={(el) => (startInputRefs.current[dayInt] = el)}
                                />
                                <span className={styles['time-separator']}>-</span>
                                {/* End Time Picker */}
                                <DatePicker
                                    selected={dayAvailability[dayInt].end ? new Date(dayAvailability[dayInt].end) : null}
                                    onChange={(value) => handleEndTimeChange(parseInt(dayInt), value)}
                                    showTimeSelect
                                    readOnly 
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                     timeCaption="Time"
                                    dateFormat="HH:mm"
                                    locale="en-GB"

                                    onKeyDown={(e) => e.preventDefault()} // Prevent typing
                                    autoComplete="off"
                                    
                                    placeholderText={translation.toPlaceholder}
                                    className={styles['day-input']}
                                    minTime={dayAvailability[dayInt].start || lastSelectedTime.start}
                                    maxTime={new Date().setHours(23, 59)}
                                    disabled={!isWorking}
                                    open={openTimePicker[`end-${dayInt}`] || false}
                                    onFocus={() => toggleEndPicker(dayInt, true)} // Open on focus for "To"
                                    onClickOutside={() => toggleEndPicker(dayInt, false)} // Close if clicked outside
                                    ref={(el) => (toInputRefs.current[dayInt] = el)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default AvailabilityForm;
