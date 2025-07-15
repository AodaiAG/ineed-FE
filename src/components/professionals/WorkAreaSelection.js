import React, { forwardRef, useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from '../../styles/ProfessionalRegistration.module.css';

const WorkAreas = forwardRef(({
    groupedLocations,
    workAreaSelections,
    setWorkAreaSelections,
    error
}, ref) => {
    const { translation } = useLanguage();
    const [searchText, setSearchText] = useState('');
    const [expandedAreas, setExpandedAreas] = useState([]); // Array to hold expanded area(s)
    const areaToggleRefs = useRef({});

    // Memoize filtered locations based on searchText
    const filteredLocations = useMemo(() => {
        return groupedLocations.map(area => ({
            ...area,
            cities: area.cities.filter(city =>
                city.cityName?.toLowerCase().includes(searchText.toLowerCase())
            )
        })).filter(area => 
            area.areaName?.toLowerCase().includes(searchText.toLowerCase()) || 
            area.cities.length > 0
        );
    }, [groupedLocations, searchText]);

    // Update expanded areas based on searchText
    useEffect(() => {
        if (searchText) {
            const matchingAreaIds = filteredLocations.map(area => area.areaId);
            setExpandedAreas(matchingAreaIds); // Expand all matching areas when searching
        } else {
            setExpandedAreas([]); // Reset to allow single expansion if search is cleared
        }
    }, [searchText, filteredLocations]);

    const handleLocationToggle = (cityId) => {
        setWorkAreaSelections(prevSelections => {
            const updatedSelections = prevSelections.includes(cityId)
                ? prevSelections.filter(id => id !== cityId)
                : [...prevSelections, cityId];
            return updatedSelections;
        });
    };

    const countSelectedCities = (area) => {
        return area.cities.filter(city => workAreaSelections.includes(city.cityId)).length;
    };

    const handleToggleAllChildren = (areaId, isChecked) => {
        setWorkAreaSelections(prevSelections => {
            const areaCities = groupedLocations.find(area => area.areaId === areaId)?.cities || [];
            const areaCityIds = areaCities.map(city => city.cityId);
            const updatedSelections = isChecked
                ? [...new Set([...prevSelections, ...areaCityIds])]
                : prevSelections.filter(id => !areaCityIds.includes(id));
            return updatedSelections;
        });
    };

    const handleToggleDropdown = (areaId) => {
        setExpandedAreas(prevExpanded => {
            let newExpanded;

            if (searchText) {
                // If searching, toggle normally to add/remove from multiple expanded areas
                newExpanded = prevExpanded.includes(areaId)
                    ? prevExpanded.filter(id => id !== areaId)
                    : [...prevExpanded, areaId];
            } else {
                // If not searching, only one area should be expanded at a time
                newExpanded = prevExpanded.includes(areaId) ? [] : [areaId];
            }

            // Scroll to the new area when expanding it (only if search is empty)
            if (!searchText && !prevExpanded.includes(areaId) && areaToggleRefs.current[areaId]) {
                setTimeout(() => {
                    areaToggleRefs.current[areaId].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 0);
            }

            return newExpanded;
        });
    };

    if (!translation) {
        return <div>Loading...</div>;
    }

    return (
        <div ref={ref} className={styles['pro-form-group']}>
            <label className={`${styles['pro-label']} ${styles['pro-label-required']}`}>
                {translation.workAreasLabel}
            </label>
            {error && <p className={styles['pro-error']}>{error}</p>}

            <div className={styles['search-bar-container']}>
                <input
                    type="text"
                    placeholder={translation.searchAreaOrCity}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className={styles['search-bar']}
                />
            </div>

            {Array.isArray(filteredLocations) && filteredLocations.length > 0 ? (
                filteredLocations.map((area) => {
                    const selectedCount = countSelectedCities(area);
                    const isExpanded = expandedAreas.includes(area.areaId);

                    return (
                        <div key={area.areaId} className={styles['pro-dropdown']}>
                            <div
                                ref={(el) => (areaToggleRefs.current[area.areaId] = el)}
                                className={styles['pro-dropdown-toggle']}
                                onClick={() => handleToggleDropdown(area.areaId)}
                            >
                                <label>
                                    <input 
                                        type="checkbox" 
                                        id={`${area.areaId}-checkbox`}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            handleToggleAllChildren(area.areaId, e.target.checked);
                                        }}
                                        checked={countSelectedCities(area) === area.cities.length && area.cities.length > 0}
                                    />
                                    <span>{area.areaName}</span>
                                </label>
                                {selectedCount > 0 && (
                                    <span className={styles['pro-badge']}>{selectedCount}</span>
                                )}
                                <i className={styles['pro-arrow']}>⌄</i>
                            </div>
                            <div 
                                className={styles['pro-dropdown-content']} 
                                id={area.areaId}
                                style={{ display: isExpanded ? 'block' : 'none' }}
                            >
                                {area.cities.map((city) => (
                                    <label key={city.cityId} className={styles['pro-sub-label']}>
                                        <input 
                                            type="checkbox" 
                                            className={`${area.areaId}-child`} 
                                            checked={workAreaSelections.includes(city.cityId)}
                                            onChange={() => handleLocationToggle(city.cityId)}
                                        /> 
                                        {city.cityName}
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <p>{translation.noWorkAreasFound}</p>
            )}
        </div>
    );
});

export default WorkAreas;
