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
        if (!nextContent) return; // Should we wait? Or show loading?

        // Haptic
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }

        setIsFadingOut(true);

        setTimeout(() => {
            setContent(nextContent);
            setIsFadingOut(false);
            setNextContent(null); // Clear buffer
            // fetchNext triggered by useEffect
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
