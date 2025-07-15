import React, { forwardRef, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constans';
import { useLanguage } from '../../contexts/LanguageContext';
import styles from '../../styles/ProfessionalRegistration.module.css';
import ReportPopup from './ReportPopup';

const JobFieldsSelection = forwardRef(({
    domains,
    selectedProfessionIds = [],
    setSelectedProfessionIds,
    language,
    error,
    refs
}, ref) => {
    const { translation } = useLanguage();
    const [expandedDomains, setExpandedDomains] = useState(new Set());
    const [expandedMains, setExpandedMains] = useState(new Set());
    const [mainProfessions, setMainProfessions] = useState({});
    const [subProfessions, setSubProfessions] = useState({});
    const [loadingMainProfessions, setLoadingMainProfessions] = useState({});
    const [loadingSubProfessions, setLoadingSubProfessions] = useState({});
    const [searchText, setSearchText] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [showReportPopup, setShowReportPopup] = useState(false);

    const domainRefs = useRef({});
    const mainRefs = useRef({});

    const handleOpenPopup = () => setShowReportPopup(true);
    const handleClosePopup = () => setShowReportPopup(false);

    const fetchMainProfessions = async (domain) => {
        if (!domain || mainProfessions[domain]) return;
        setLoadingMainProfessions(prev => ({ ...prev, [domain]: true }));
        try {
            const response = await axios.get(`${API_URL}/${language}/main-professions?domain=${domain}`);
            const data = response.data;
            if (Array.isArray(data)) {
                setMainProfessions(prev => ({ ...prev, [domain]: data }));
                data.forEach(main => fetchSubProfessions(main.main));
            } else {
                console.error('Expected an array but received:', data);
            }
        } catch (error) {
            console.error('Error fetching main professions:', error);
        } finally {
            setLoadingMainProfessions(prev => ({ ...prev, [domain]: false }));
        }
    };

    const fetchSubProfessions = async (main) => {
        if (!main || subProfessions[main]) return;
        setLoadingSubProfessions(prev => ({ ...prev, [main]: true }));
        try {
            const response = await axios.get(`${API_URL}/${language}/sub-professions/${main}`);
            const data = response.data;
            if (Array.isArray(data)) {
                setSubProfessions(prev => ({ ...prev, [main]: data }));
            } else {
                console.error('Expected an array but received:', data);
            }
        } catch (error) {
            console.error('Error fetching sub-professions:', error);
        } finally {
            setLoadingSubProfessions(prev => ({ ...prev, [main]: false }));
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await Promise.all(domains.map(domain => fetchMainProfessions(domain.domain)));
            } catch (error) {
                console.error('Error fetching all data:', error);
            }
        };
        fetchAllData();
    }, [domains]);

    const handleToggleDomain = (domain) => {
        setExpandedDomains((prev) => {
            const updated = new Set();

            if (prev.has(domain)) {
                // Close the domain if it's already open
                return updated;
            }

            // Close any other open domain first
            setExpandedDomains(new Set());

            // Add the new domain after a short delay to avoid layout shift
            setTimeout(() => {
                updated.add(domain);
                setExpandedDomains(updated);

                // Scroll to the domain name after expanding
                if (domainRefs.current[domain]) {
                    domainRefs.current[domain].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            }, 100);

            fetchMainProfessions(domain);
            return prev;
        });
    };

    const handleToggleMain = (mainProfession) => {
        setExpandedMains((prev) => {
            const updated = new Set();

            if (prev.has(mainProfession)) {
                // Close the main profession if it's already open
                return updated;
            }

            // Close any other open main profession first
            setExpandedMains(new Set());

            // Add the new main profession after a short delay to avoid layout shift
            setTimeout(() => {
                updated.add(mainProfession);
                setExpandedMains(updated);

                // Scroll to the main profession name after expanding
                if (mainRefs.current[mainProfession]) {
                    mainRefs.current[mainProfession].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            }, 100);

            fetchSubProfessions(mainProfession);
            return prev;
        });
    };

    const handleSubProfessionToggle = (subProfessionId) => {
        setSelectedProfessionIds((prevIds) =>
            prevIds.includes(subProfessionId)
                ? prevIds.filter((id) => id !== subProfessionId)
                : [...prevIds, subProfessionId]
        );
    };

    const getDomainBadgeCount = (domain) => {
        if (!mainProfessions[domain]) return 0;
        return mainProfessions[domain].reduce((count, main) =>
            Array.isArray(subProfessions[main.main]) &&
            subProfessions[main.main].some((sub) => selectedProfessionIds.includes(sub.id))
                ? count + 1
                : count,
        0);
    };

    const getMainBadgeCount = (mainProfession) =>
        Array.isArray(subProfessions[mainProfession])
            ? subProfessions[mainProfession].filter((sub) => selectedProfessionIds.includes(sub.id)).length
            : 0;

    useEffect(() => {
        if (searchText) {
            const matchingDomains = new Set();
            const matchingMains = new Set();

            domains.forEach((domain) => {
                const domainMatches = domain.domain.toLowerCase().includes(searchText.toLowerCase());
                const mainMatches = mainProfessions[domain.domain]?.some((main) => {
                    const isMatch = main.main.toLowerCase().includes(searchText.toLowerCase());
                    if (isMatch) matchingMains.add(main.main);
                    return isMatch;
                });

                if (domainMatches || mainMatches) {
                    matchingDomains.add(domain.domain);
                }
            });

            setExpandedDomains(matchingDomains);
            setExpandedMains(matchingMains);
        } else {
            setExpandedDomains(new Set());
            setExpandedMains(new Set());
        }
    }, [searchText, domains, mainProfessions]);

    const filteredDomains = domains.filter(
        (domain) =>
            domain.domain.toLowerCase().includes(searchText.toLowerCase()) ||
            (mainProfessions[domain.domain] &&
                mainProfessions[domain.domain].some((main) =>
                    main.main.toLowerCase().includes(searchText.toLowerCase())
                ))
    );

    if (!translation) {
        return <div>Loading...</div>; // Wait for translations to load
    }

    return (
        <div ref={ref} className={styles['pro-form-group']}>
            <label className={`${styles['pro-label']} ${styles['pro-label-required']}`}>
                {translation.selectJobFieldsLabel}
            </label>
            {error && <p className={styles['pro-error']}>{error}</p>}

            <div className={styles['search-bar-container']}>
                <input
                    type="text"
                    placeholder={translation.searchPlaceholder}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className={styles['search-bar']}
                />
                <button className={styles['not-found-button']} onClick={handleOpenPopup}>
                    {translation.notFoundButton}
                </button>
            </div>

            {showReportPopup && (
                <ReportPopup
                    onClose={handleClosePopup}
                    onSubmit={(data) => console.log("Report Submitted:", data)}
                    domains={domains.map((domain) => domain.domain)}
                    getMainProfessions={fetchMainProfessions}
                    language={language}
                />
            )}

            {filteredDomains.map((domain) => (
                <div key={domain.domain} className={styles['pro-dropdown']}>
                    <div
                        ref={(el) => (domainRefs.current[domain.domain] = el)}
                        className={styles['pro-dropdown-toggle']}
                        onClick={() => handleToggleDomain(domain.domain)}
                        style={{ display: 'flex', cursor: 'pointer' }}
                    >
                        <span>{domain.domain}</span>
                        {getDomainBadgeCount(domain.domain) > 0 && (
                            <span className={styles['pro-badge']}>{getDomainBadgeCount(domain.domain)}</span>
                        )}
                        <i className={styles['pro-arrow']}>{expandedDomains.has(domain.domain) ? '⌃' : '⌄'}</i>
                    </div>

                    <div
                        className={styles['pro-dropdown-content']}
                        style={{ display: expandedDomains.has(domain.domain) ? 'block' : 'none' }}
                        id={domain.domain}
                    >
                        {loadingMainProfessions[domain.domain] ? (
                            <p>Loading main professions...</p>
                        ) : (
                            mainProfessions[domain.domain]
                                ?.filter((mainProfession) =>
                                    mainProfession.main.toLowerCase().includes(searchText.toLowerCase())
                                )
                                .map((mainProfession, index) => (
                                    <div key={`${mainProfession.main}-${index}`} className={styles['pro-dropdown']}>
                                        <div
                                            ref={(el) => (mainRefs.current[mainProfession.main] = el)}
                                            className={styles['pro-dropdown-toggle']}
                                            onClick={(e) => {
                                                if (e.target.tagName !== "INPUT") {
                                                    handleToggleMain(mainProfession.main);
                                                }
                                            }}
                                            style={{ display: 'flex', cursor: 'pointer' }}
                                        >
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    id={`${mainProfession.main}-checkbox`}
                                                    checked={
                                                        Array.isArray(subProfessions[mainProfession.main]) &&
                                                        subProfessions[mainProfession.main].every((sub) =>
                                                            selectedProfessionIds.includes(sub.id)
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        const isChecked = e.target.checked;
                                                        const subProfessionIds = Array.isArray(
                                                            subProfessions[mainProfession.main]
                                                        )
                                                            ? subProfessions[mainProfession.main].map((sub) => sub.id)
                                                            : [];
                                                        setSelectedProfessionIds((prevIds) =>
                                                            isChecked
                                                                ? [...new Set([...prevIds, ...subProfessionIds])]
                                                                : prevIds.filter((id) => !subProfessionIds.includes(id))
                                                        );
                                                    }}
                                                />
                                                <span>{mainProfession.main}</span>
                                            </label>
                                            {getMainBadgeCount(mainProfession.main) > 0 && (
                                                <span className={styles['pro-badge']}>
                                                    {getMainBadgeCount(mainProfession.main)}
                                                </span>
                                            )}
                                            <i className={styles['pro-arrow']}>
                                                {expandedMains.has(mainProfession.main) ? '⌃' : '⌄'}
                                            </i>
                                        </div>

                                        <div
                                            className={styles['pro-dropdown-content']}
                                            style={{
                                                display: expandedMains.has(mainProfession.main) ? 'block' : 'none',
                                            }}
                                            id={mainProfession.main}
                                        >
                                            {loadingSubProfessions[mainProfession.main] ? (
                                                <p>Loading sub-professions...</p>
                                            ) : (
                                                Array.isArray(subProfessions[mainProfession.main]) &&
                                                subProfessions[mainProfession.main].map((subProfession) => (
                                                    <label key={subProfession.id} className={styles['pro-sub-label']}>
                                                        <input
                                                            type="checkbox"
                                                            className={`${mainProfession.main}-child`}
                                                            checked={selectedProfessionIds.includes(subProfession.id)}
                                                            onChange={() =>
                                                                handleSubProfessionToggle(subProfession.id)
                                                            }
                                                        />
                                                        {subProfession.sub}
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
});

export default JobFieldsSelection;
