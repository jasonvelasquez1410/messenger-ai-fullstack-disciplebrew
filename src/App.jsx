import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi('012fbe2f-192f-44f3-a1b3-76db83ce299c');

const App = () => {
    const clientConfig = {
        name: "Faith",
        business_name: "Disciple Brew",
        brand_color: "#4e342e",
        logo: "DB",
        voice_avatar: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=300&h=400",
        vapi_assistant_id: "ce73e028-b7d4-478c-853b-c49221077e58"
    };

    const [messages, setMessages] = useState([
        { role: 'model', content: "Welcome to Disciple Brew! I'm Faith, your digital assistant. How can I serve you today? God bless!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [vapiStatus, setVapiStatus] = useState('idle');
    const [isThinking, setIsThinking] = useState(false);
    const [vapiError, setVapiError] = useState(null);

    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    useEffect(() => {
        document.title = `${clientConfig.business_name} - AI Live Demo`;

        // Detect in-app browsers
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const isFacebookApp = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
        
        if (isFacebookApp) {
            setIsInAppBrowser(true);
            const isAndroid = /android/i.test(ua);
            if (isAndroid) {
                // Auto-redirect for Android
                const currentUrl = window.location.href.replace(/^https?:\/\//, '');
                window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
            }
        }

        window.vapi = vapi;
        vapi.on('call-start', () => { setVapiStatus('active'); setIsCalling(true); setVapiError(null); });
        vapi.on('call-end', () => { setVapiStatus('idle'); setIsCalling(false); });
        vapi.on('speech-start', () => setIsThinking(true));
        vapi.on('speech-end', () => setIsThinking(false));
        vapi.on('error', (e) => { setVapiStatus('error'); setVapiError(e.message || "Connection Error"); setIsCalling(false); });
    }, []);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleCall = async () => {
        if (isCalling || vapiStatus === 'active') { vapi.stop(); return; }
        
        if (isInAppBrowser) {
            setVapiStatus('error');
            setVapiError("Voice calls are blocked by Messenger. Tap the 3 dots (top right) and select 'Open in browser' (Chrome/Safari).");
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setVapiStatus('error');
            setVapiError("Microphone missing. Please open this page in your phone's default browser (Safari/Chrome).");
            return;
        }

        try {
            setVapiStatus('calling');
            setVapiError(null);
            
            // Explicitly request microphone permissions. On mobile (especially iOS Safari),
            // this is required immediately in the user interaction event to avoid blocking audio context.
            await navigator.mediaDevices.getUserMedia({ audio: true });

            await vapi.start(clientConfig.vapi_assistant_id);
            setTimeout(() => {
                setVapiStatus(p => (p === 'calling' ? 'idle' : p));
            }, 10000);
        } catch (err) {
            console.error("Call error:", err);
            setVapiStatus('error');
            setVapiError("Connection failed. Please ensure mic permissions are granted in your browser settings.");
            // Make sure to reset state if it fails so user can try again
            setIsCalling(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { role: 'model', content: data.reply || data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: `Error: ${data.detail || "Unable to reach AI."}` }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'model', content: "Connection error. Please check if the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {isInAppBrowser && (
                <div style={styles.inAppWarningOverlay}>
                    <div style={styles.inAppWarningBox}>
                        <h2 style={{fontSize: '24px', marginBottom: '15px'}}>⚠️ Browser Restricted</h2>
                        <p style={{marginBottom: '20px', lineHeight: '1.5'}}>
                            Facebook Messenger blocks microphone access. <br/><br/>
                            To use the Voice AI Employee, please tap the <strong>3 dots in the top right corner</strong> (⋯) and select <strong>"Open in system browser" / "Open in Safari" / "Open in Chrome"</strong>.
                        </p>
                    </div>
                </div>
            )}
            <header style={styles.header}>
                <div style={styles.logoText}>
                    {(clientConfig.business_name || clientConfig.name).toUpperCase().replace(/\s/g, '')}
                    <span style={{ color: clientConfig.brand_color }}>DEMO</span>
                </div>
                <div style={styles.headerInfo}>
                    <div style={styles.headerTitle}>NEVER MISS A CALL AGAIN!</div>
                    <div style={styles.headerSubtitle}>{(clientConfig.business_name || clientConfig.name)} Live Demo</div>
                </div>
                <div style={styles.headerIcon}>🎙️</div>
            </header>

            <main style={styles.main}>
                <div style={styles.sidebar}>
                    <h1 style={styles.h1}>AI Chat <br /><span style={{ color: clientConfig.brand_color }}>Employee</span></h1>
                    <p style={styles.p}>Available 24/7 to serve Kapatid.</p>
                </div>

                <div className="iphone-frame" style={styles.iphoneContainer}>
                    <div style={styles.iphoneNotch}></div>
                    <div style={styles.iphoneScreen}>
                        <div style={styles.chatApp}>
                            <div style={styles.chatHeader}>
                                <div style={{ ...styles.avatarSmall, backgroundColor: clientConfig.brand_color }}>{clientConfig.logo}</div>
                                <div>
                                    <div style={styles.chatName}>{clientConfig.name}</div>
                                    <div style={styles.chatStatus}>● Online</div>
                                </div>
                            </div>

                            <div ref={scrollContainerRef} style={styles.messagesList} className="scrollbar-hidden">
                                {messages.map((m, i) => (
                                    <div key={i} style={{ ...styles.messageRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            ...styles.bubble,
                                            backgroundColor: m.role === 'user' ? clientConfig.brand_color : '#fff',
                                            color: m.role === 'user' ? '#fff' : '#1f2937',
                                            border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
                                            borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px'
                                        }}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && <div style={styles.typing}>Thinking...</div>}
                                <div ref={messagesEndRef} style={{ height: '10px' }}></div>
                            </div>

                            {isCalling ? (
                                <div style={{ ...styles.inputArea, justifyContent: 'center', backgroundColor: '#f0fdf4', color: '#166534', fontSize: '11px', fontWeight: 'bold' }}>
                                    🎙️ Live Voice Call in Progress...
                                </div>
                            ) : (
                                <form onSubmit={sendMessage} style={styles.inputArea}>
                                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={styles.input} disabled={isLoading} />
                                    <button type="submit" style={{ ...styles.sendButton, backgroundColor: clientConfig.brand_color, opacity: isLoading ? 0.6 : 1 }} disabled={isLoading}>✈️</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                <div style={styles.voiceCard}>
                    <span style={styles.badge}>Voice Employee</span>
                    <h2 style={styles.h2}>AI Voice Employee</h2>
                    <div style={styles.imageContainer}>
                        <img src={clientConfig.voice_avatar} style={{ ...styles.avatarMain, filter: isCalling ? 'grayscale(0)' : 'grayscale(1)' }} alt="AI" />
                        {isThinking && <div style={styles.thinkingOverlay}>{clientConfig.name} is thinking...</div>}
                    </div>
                    <button onClick={toggleCall} style={{ ...styles.callButton, backgroundColor: isCalling ? '#ef4444' : '#22c55e' }}>
                        {vapiStatus === 'calling' ? "Connecting..." : isCalling ? "End Voice Call" : "Start Live AI Call"}
                    </button>
                    {vapiError && <div style={styles.errorText}>⚠️ {vapiError}</div>}
                </div>
            </main>

            <style>{`
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .iphone-frame {
                    position: relative;
                    width: 240px;
                    height: 500px;
                    background: #1a1a1b;
                    border-radius: 36px;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
                    border: 8px solid #333;
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
    header: { padding: '12px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    logoText: { fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' },
    headerInfo: { textAlign: 'center' },
    headerTitle: { fontSize: '10px', fontWeight: '800', color: '#333' },
    headerSubtitle: { fontSize: '9px', color: '#666' },
    headerIcon: { fontSize: '18px' },
    main: { maxWidth: '1000px', margin: '0 auto', padding: '20px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '30px' },
    sidebar: { width: '180px', textAlign: 'center' },
    h1: { fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' },
    p: { fontSize: '14px', color: '#666' },
    iphoneContainer: { flexShrink: 0 },
    iphoneNotch: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '110px', height: '20px', backgroundColor: '#1a1a1b', borderRadius: '0 0 14px 14px', zIndex: 10 },
    iphoneScreen: { position: 'absolute', top: '2px', left: '2px', right: '2px', bottom: '2px', borderRadius: '28px', overflow: 'hidden', backgroundColor: '#fff' },
    chatApp: { display: 'flex', flexDirection: 'column', height: '100%' },
    chatHeader: { padding: '32px 14px 10px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' },
    avatarSmall: { width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' },
    chatName: { fontSize: '11px', fontWeight: 'bold' },
    chatStatus: { fontSize: '9px', color: '#22c55e', fontWeight: 'bold' },
    messagesList: { flex: 1, padding: '16px 12px', overflowY: 'auto', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '8px' },
    messageRow: { display: 'flex', width: '100%', margin: '2px 0' },
    bubble: { maxWidth: '85%', padding: '10px 14px', fontSize: '13px', lineHeight: '1.4', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    typing: { fontSize: '10px', color: '#999', fontStyle: 'italic', paddingLeft: '12px' },
    inputArea: { padding: '8px 14px', borderTop: '1px solid #eee', display: 'flex', gap: '6px', paddingBottom: '24px' },
    input: { flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '12px', outline: 'none' },
    sendButton: { width: '32px', height: '32px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' },
    voiceCard: { width: '240px', padding: '24px', border: '1px solid #eee', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' },
    badge: { fontSize: '9px', fontWeight: 'bold', backgroundColor: '#f0f7ff', color: '#2563eb', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' },
    h2: { fontSize: '20px', fontWeight: '800', margin: '10px 0' },
    imageContainer: { width: '100%', aspectRatio: '1/1', borderRadius: '18px', overflow: 'hidden', margin: '15px 0', position: 'relative' },
    avatarMain: { width: '100%', height: '100%', objectFit: 'cover', transition: 'filter 0.5s' },
    thinkingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '4px' },
    callButton: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'transform 0.1s' },
    errorText: { fontSize: '9px', color: '#ef4444', marginTop: '8px' },
    inAppWarningOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    inAppWarningBox: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }
};

export default App;
