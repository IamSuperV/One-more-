'use client';

import { useState, useEffect, useRef } from 'react';

interface ContentItem {
    id: string;
    text: string;
    type: string;
}

export default function ClientView({ initialContent }: { initialContent: ContentItem | null }) {
    const [content, setContent] = useState<ContentItem | null>(initialContent);
    const [nextContent, setNextContent] = useState<ContentItem | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Submission State
    const [isSubmittingMode, setIsSubmittingMode] = useState(false);
    const [inputText, setInputText] = useState('');
    const [submittingState, setSubmittingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Behavioral State
    const [clickCount, setClickCount] = useState(0);
    const [isReturnUser, setIsReturnUser] = useState(false);

    useEffect(() => {
        // Silent Memory Check
        const storedClicks = localStorage.getItem('om_clicks');
        const lastVisit = localStorage.getItem('om_last');

        if (storedClicks) setClickCount(parseInt(storedClicks));
        if (lastVisit) {
            const hours = (Date.now() - parseInt(lastVisit)) / 1000 / 60 / 60;
            if (hours > 24) setIsReturnUser(true); // Flag for potential use
        }

        localStorage.setItem('om_last', Date.now().toString());
    }, []);

    const getMetaContent = (count: number): ContentItem | null => {
        // The "Fourth Wall" breaks
        if (count === 5) return { id: 'm1', text: "Curiosity is a trap.", type: "meta" };
        if (count === 12) return { id: 'm2', text: "You can leave anytime.", type: "meta" };
        if (count === 25) return { id: 'm3', text: "What are you looking for?", type: "meta" };
        if (count === 50) return { id: 'm4', text: "There is no end.", type: "meta" };
        if (count === 100) return { id: 'm5', text: "You enjoy this.", type: "meta" };
        return null;
    };

    // Preload next content
    useEffect(() => {
        if (!previousAbortController.current) {
            fetchNext();
        }
    }, [content]);

    const previousAbortController = useRef<AbortController | null>(null);

    const fetchNext = async () => {
        if (previousAbortController.current) {
            previousAbortController.current.abort();
        }
        const controller = new AbortController();
        previousAbortController.current = controller;

        try {
            const url = content?.id ? `/api/one-more?exclude=${content.id}` : '/api/one-more';
            const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setNextContent(data);
            }
        } catch (e) {
            // ignore aborts
        }
    };

    const handleNext = () => {
        if (isSubmittingMode) return;

        // Haptic
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }

        // Update State
        const newCount = clickCount + 1;
        setClickCount(newCount);
        localStorage.setItem('om_clicks', newCount.toString());
        localStorage.setItem('om_last', Date.now().toString());

        // Check for Meta-Injection
        const meta = getMetaContent(newCount);
        const contentToShow = meta || nextContent;

        if (!contentToShow) return; // Wait if nothing ready

        setIsFadingOut(true);

        setTimeout(() => {
            setContent(contentToShow);
            setIsFadingOut(false);

            // If we used the preloaded content, clear it. 
            // If we used query meta, we keep nextContent buffered for NEXT click.
            if (!meta) {
                setNextContent(null);
            }

            // fetchNext is handled by useEffect on content change
        }, 200);
    };

    const handleSubmit = async () => {
        setSubmittingState('loading');
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText })
            });
            if (res.ok) {
                setSubmittingState('success');
                setTimeout(() => {
                    setIsSubmittingMode(false);
                    setSubmittingState('idle');
                    setInputText('');
                }, 1500);
            } else {
                setSubmittingState('error');
            }
        } catch (e) {
            setSubmittingState('error');
        }
    };

    return (
        <div className="center-container">
            {/* Content Area */}
            {!isSubmittingMode ? (
                <div
                    className="content-text"
                    style={{
                        opacity: isFadingOut ? 0 : 1,
                        transform: isFadingOut ? 'translateY(-5px)' : 'translateY(0)',
                        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out'
                    }}
                >
                    {content?.text || "..."}
                </div>
            ) : (
                <div className="content-text" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
                    {submittingState === 'success' ? (
                        <p>Received.</p>
                    ) : (
                        <>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Confess."
                                maxLength={280}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #333',
                                    color: '#e5e5e5',
                                    width: '100%',
                                    maxWidth: '400px',
                                    fontSize: '1.2rem',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    resize: 'none',
                                    textAlign: 'center'
                                }}
                                rows={3}
                            />
                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{inputText.length}/280</div>
                        </>
                    )}
                </div>
            )}

            {/* Button Area */}
            {!isSubmittingMode ? (
                <button className="one-more-btn" onClick={handleNext}>
                    ONE MORE
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {submittingState !== 'success' && (
                        <button className="one-more-btn" onClick={handleSubmit} disabled={submittingState === 'loading'}>
                            {submittingState === 'loading' ? '...' : 'SUBMIT'}
                        </button>
                    )}
                    <button className="one-more-btn" onClick={() => setIsSubmittingMode(false)} style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                        CANCEL
                    </button>
                </div>
            )}

            {/* Footer Link */}
            {!isSubmittingMode && (
                <div className="submission-link" onClick={() => setIsSubmittingMode(true)} style={{ cursor: 'pointer' }}>
                    Submit one
                </div>
            )}
        </div>
    );
}
