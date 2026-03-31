/**
 * Authentication Module
 * Registration, login, and session management
 */

class AuthModule {
    constructor() {
        this.user = storageUtils.getUserSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.attachFormListeners();
        });
    }

    attachFormListeners() {
        // Register form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister();
            }
        });

        // Login form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin();
            }
        });

        // Forgot password form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'forgotPasswordForm') {
                e.preventDefault();
                this.handleForgotPassword();
            }
        });
    }

    // Show auth pages
    static showAuthPage() {
        const landingPage = document.getElementById('landingPage');
        const authPage = document.getElementById('authPage');
        const mainDashboard = document.getElementById('mainDashboard');

        domUtils.hide(landingPage);
        domUtils.show(authPage);
        domUtils.hide(mainDashboard);

        authPage.innerHTML = AuthModule.renderAuthPages();
    }

    // Show public landing/about page before login
    static showLandingPage() {
        const landingPage = document.getElementById('landingPage');
        const authPage = document.getElementById('authPage');
        const mainDashboard = document.getElementById('mainDashboard');

        domUtils.show(landingPage);
        domUtils.hide(authPage);
        domUtils.hide(mainDashboard);

        landingPage.innerHTML = AuthModule.renderLandingPage();
    }

    static renderLandingPage() {
        return `
            <div style="min-height: 100vh; background: #0d1117; color: #e6edf3; position: relative; overflow-x: hidden;">
                <!-- Background grid -->
                <div style="position: fixed; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(48,54,61,0.4) 1px, transparent 0); background-size: 40px 40px; pointer-events: none; z-index: 0;"></div>

                <!-- Navbar -->
                <nav style="position: sticky; top: 0; z-index: 100; background: rgba(13,17,23,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #21262d; padding: 0 40px;">
                    <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 60px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 36px; height: 36px; background: #161b22; border: 1px solid #30363d; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-car" style="font-size: 1rem; color: #4ade80;"></i>
                            </div>
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 600; color: #e6edf3;">DriveIndia</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <button onclick="AuthModule.showAuthPage()" style="background: none; border: 1px solid #30363d; color: #e6edf3; padding: 8px 20px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; cursor: pointer; transition: all 0.2s;">
                                Login
                            </button>
                            <button onclick="AuthModule.showAuthPage(); setTimeout(() => { const s = document.getElementById('switchToRegister'); if(s) s.click(); }, 100);" style="background: #4ade80; border: none; color: #0d1117; padding: 8px 20px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </nav>

                <!-- Hero Section -->
                <section style="position: relative; z-index: 1; padding: 100px 40px 80px; text-align: center;">
                    <div style="position: absolute; top: -10%; left: 30%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%); pointer-events: none;"></div>
                    <div style="position: absolute; bottom: -10%; right: 20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 70%); pointer-events: none;"></div>
                    <div style="max-width: 800px; margin: 0 auto; position: relative;">
                        <div style="display: inline-block; background: #161b22; border: 1px solid #30363d; border-radius: 20px; padding: 6px 16px; margin-bottom: 24px;">
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #4ade80;">v2.0</span>
                            <span style="color: #30363d; margin: 0 8px;">|</span>
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #8b949e;">India's Vehicle Rental Platform</span>
                        </div>
                        <h1 style="font-size: 3.2rem; font-weight: 700; line-height: 1.2; margin: 0 0 20px; background: linear-gradient(135deg, #e6edf3 0%, #8b949e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            Rent Vehicles Across India.<br>
                            <span style="background: linear-gradient(135deg, #4ade80, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Fast. Transparent. Reliable.</span>
                        </h1>
                        <p style="font-size: 1.1rem; color: #8b949e; max-width: 600px; margin: 0 auto 36px; line-height: 1.7;">
                            Cars, bikes & scooters in 6+ cities. Book in under 2 minutes with zero paperwork and transparent GST pricing.
                        </p>
                        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
                            <button onclick="AuthModule.showAuthPage(); setTimeout(() => { const s = document.getElementById('switchToRegister'); if(s) s.click(); }, 100);" style="background: #4ade80; border: none; color: #0d1117; padding: 12px 32px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                                <i class="fas fa-rocket"></i> Get Started Free
                            </button>
                            <button onclick="AuthModule.showAuthPage()" style="background: none; border: 1px solid #30363d; color: #e6edf3; padding: 12px 32px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                                <i class="fas fa-terminal"></i> Login
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Stats Bar -->
                <section style="position: relative; z-index: 1; padding: 40px; border-top: 1px solid #21262d; border-bottom: 1px solid #21262d; background: rgba(22,27,34,0.5);">
                    <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
                        <div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: #4ade80;">6+</div>
                            <div style="font-size: 0.82rem; color: #6e7681; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Cities</div>
                        </div>
                        <div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: #60a5fa;">500+</div>
                            <div style="font-size: 0.82rem; color: #6e7681; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Vehicles</div>
                        </div>
                        <div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: #c084fc;">10K+</div>
                            <div style="font-size: 0.82rem; color: #6e7681; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Riders</div>
                        </div>
                        <div>
                            <div style="font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: #fbbf24;">4.8</div>
                            <div style="font-size: 0.82rem; color: #6e7681; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Rating</div>
                        </div>
                    </div>
                </section>

                <!-- Features Grid -->
                <section style="position: relative; z-index: 1; padding: 80px 40px;">
                    <div style="max-width: 1100px; margin: 0 auto;">
                        <h2 style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #8b949e; margin-bottom: 48px;"><span style="color: #4ade80;">></span> features --list</h2>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 28px; transition: all 0.2s;">
                                <div style="width: 44px; height: 44px; background: rgba(96,165,250,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <i class="fas fa-hand-holding-usd" style="color: #60a5fa; font-size: 1.1rem;"></i>
                                </div>
                                <h4 style="margin: 0 0 8px; font-size: 1rem;">Affordable Rentals</h4>
                                <p style="margin: 0; color: #8b949e; font-size: 0.88rem; line-height: 1.6;">Transparent pricing with zero hidden charges. Quality rides at fair rates.</p>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 28px; transition: all 0.2s;">
                                <div style="width: 44px; height: 44px; background: rgba(251,191,36,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <i class="fas fa-shield-alt" style="color: #fbbf24; font-size: 1.1rem;"></i>
                                </div>
                                <h4 style="margin: 0 0 8px; font-size: 1rem;">Safety First</h4>
                                <p style="margin: 0; color: #8b949e; font-size: 0.88rem; line-height: 1.6;">Every vehicle inspected and maintained. Verified docs guaranteed.</p>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 28px; transition: all 0.2s;">
                                <div style="width: 44px; height: 44px; background: rgba(74,222,128,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <i class="fas fa-map-marked-alt" style="color: #4ade80; font-size: 1.1rem;"></i>
                                </div>
                                <h4 style="margin: 0 0 8px; font-size: 1rem;">Pan-India Coverage</h4>
                                <p style="margin: 0; color: #8b949e; font-size: 0.88rem; line-height: 1.6;">Mumbai, Delhi, Bangalore, Pune & more — rapidly expanding.</p>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 28px; transition: all 0.2s;">
                                <div style="width: 44px; height: 44px; background: rgba(248,113,113,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <i class="fas fa-bolt" style="color: #f87171; font-size: 1.1rem;"></i>
                                </div>
                                <h4 style="margin: 0 0 8px; font-size: 1rem;">Instant Booking</h4>
                                <p style="margin: 0; color: #8b949e; font-size: 0.88rem; line-height: 1.6;">Book in under 2 minutes. Zero paperwork, zero friction.</p>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 28px; transition: all 0.2s;">
                                <div style="width: 44px; height: 44px; background: rgba(192,132,252,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <i class="fas fa-headset" style="color: #c084fc; font-size: 1.1rem;"></i>
                                </div>
                                <h4 style="margin: 0 0 8px; font-size: 1rem;">24/7 Support</h4>
                                <p style="margin: 0; color: #8b949e; font-size: 0.88rem; line-height: 1.6;">Round-the-clock assistance for queries or emergencies.</p>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 28px; transition: all 0.2s;">
                                <div style="width: 44px; height: 44px; background: rgba(34,211,238,0.12); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                                    <i class="fas fa-leaf" style="color: #22d3ee; font-size: 1.1rem;"></i>
                                </div>
                                <h4 style="margin: 0 0 8px; font-size: 1rem;">Eco-Friendly</h4>
                                <p style="margin: 0; color: #8b949e; font-size: 0.88rem; line-height: 1.6;">Electric vehicles available. Supporting India's green mobility.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Comparison Table -->
                <section style="position: relative; z-index: 1; padding: 0 40px 80px;">
                    <div style="max-width: 900px; margin: 0 auto;">
                        <h2 style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #8b949e; margin-bottom: 32px;"><span style="color: #4ade80;">></span> compare --plans</h2>
                        <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; overflow: hidden;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
                                <thead>
                                    <tr style="background: #21262d;">
                                        <th style="padding: 14px 20px; text-align: left; color: #8b949e; font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Feature</th>
                                        <th style="padding: 14px 20px; text-align: center; color: #60a5fa; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Daily</th>
                                        <th style="padding: 14px 20px; text-align: center; color: #c084fc; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Weekly</th>
                                        <th style="padding: 14px 20px; text-align: center; color: #4ade80; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Monthly</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border-bottom: 1px solid #21262d;">
                                        <td style="padding: 13px 20px; color: #e6edf3;">Cars, Bikes & Scooters</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #21262d;">
                                        <td style="padding: 13px 20px; color: #e6edf3;">Free Cancellation</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #21262d;">
                                        <td style="padding: 13px 20px; color: #e6edf3;">Roadside Assistance</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #6e7681;">&mdash;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #21262d;">
                                        <td style="padding: 13px 20px; color: #e6edf3;">Unlimited Kilometers</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #6e7681;">&mdash;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #6e7681;">&mdash;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #21262d;">
                                        <td style="padding: 13px 20px; color: #e6edf3;">Discounted Rates</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #6e7681;">&mdash;</td>
                                        <td style="padding: 13px 20px; text-align: center; font-family: 'JetBrains Mono', monospace; color: #fbbf24;">10% off</td>
                                        <td style="padding: 13px 20px; text-align: center; font-family: 'JetBrains Mono', monospace; color: #4ade80;">25% off</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 13px 20px; color: #e6edf3;">Priority Support</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #6e7681;">&mdash;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #6e7681;">&mdash;</td>
                                        <td style="padding: 13px 20px; text-align: center; color: #4ade80;">&#10003;</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                <!-- Integration Partners -->
                <section style="position: relative; z-index: 1; padding: 0 40px 80px;">
                    <div style="max-width: 900px; margin: 0 auto; text-align: center;">
                        <h2 style="font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #8b949e; margin-bottom: 8px;"><span style="color: #4ade80;">></span> integrations</h2>
                        <p style="font-size: 0.85rem; color: #6e7681; margin-bottom: 28px;">Trusted partners & payment integrations</p>
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;">
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 22px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-university" style="color: #60a5fa;"></i>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #8b949e;">UPI</span>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 22px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-user-check" style="color: #c084fc;"></i>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #8b949e;">KYC Verify</span>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 22px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-map" style="color: #4ade80;"></i>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #8b949e;">Google Maps</span>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 22px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-sms" style="color: #fb923c;"></i>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #8b949e;">SMS Gateway</span>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 22px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-id-card" style="color: #22d3ee;"></i>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #8b949e;">Aadhaar Verify</span>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 22px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-shield-alt" style="color: #fbbf24;"></i>
                                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; color: #8b949e;">Insurance</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Core Values -->
                <section style="position: relative; z-index: 1; padding: 0 40px 80px;">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <h2 style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #8b949e; margin-bottom: 32px;"><span style="color: #4ade80;">></span> cat values.yml</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px; display: flex; gap: 14px; align-items: flex-start;">
                                <i class="fas fa-heart" style="color: #f87171; margin-top: 3px;"></i>
                                <div>
                                    <strong style="font-family: 'JetBrains Mono', monospace; font-size: 0.88rem;">customer_first:</strong>
                                    <p style="margin: 6px 0 0; color: #8b949e; font-size: 0.85rem; line-height: 1.5;">Every decision revolves around the best rider experience.</p>
                                </div>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px; display: flex; gap: 14px; align-items: flex-start;">
                                <i class="fas fa-handshake" style="color: #60a5fa; margin-top: 3px;"></i>
                                <div>
                                    <strong style="font-family: 'JetBrains Mono', monospace; font-size: 0.88rem;">transparency:</strong>
                                    <p style="margin: 6px 0 0; color: #8b949e; font-size: 0.85rem; line-height: 1.5;">No hidden costs, no surprises. What you see is what you pay.</p>
                                </div>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px; display: flex; gap: 14px; align-items: flex-start;">
                                <i class="fas fa-rocket" style="color: #fb923c; margin-top: 3px;"></i>
                                <div>
                                    <strong style="font-family: 'JetBrains Mono', monospace; font-size: 0.88rem;">innovation:</strong>
                                    <p style="margin: 6px 0 0; color: #8b949e; font-size: 0.85rem; line-height: 1.5;">Latest technology for a smoother, faster ride.</p>
                                </div>
                            </div>
                            <div style="background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 20px; display: flex; gap: 14px; align-items: flex-start;">
                                <i class="fas fa-users" style="color: #4ade80; margin-top: 3px;"></i>
                                <div>
                                    <strong style="font-family: 'JetBrains Mono', monospace; font-size: 0.88rem;">community:</strong>
                                    <p style="margin: 6px 0 0; color: #8b949e; font-size: 0.85rem; line-height: 1.5;">Responsible drivers and vehicle owners across India.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- CTA Footer -->
                <section style="position: relative; z-index: 1; padding: 60px 40px; text-align: center; border-top: 1px solid #21262d; background: rgba(22,27,34,0.5);">
                    <h3 style="font-size: 1.5rem; margin: 0 0 12px;">Ready to hit the road?</h3>
                    <p style="color: #8b949e; margin: 0 0 28px; font-size: 0.95rem;">Join thousands of riders who trust DriveIndia for their journeys.</p>
                    <button onclick="AuthModule.showAuthPage(); setTimeout(() => { const s = document.getElementById('switchToRegister'); if(s) s.click(); }, 100);" style="background: #4ade80; border: none; color: #0d1117; padding: 14px 40px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-rocket"></i> Get Started Free
                    </button>
                    <p style="margin-top: 40px; color: #30363d; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">&copy; 2026 DriveIndia. All rights reserved.</p>
                </section>
            </div>
        `;
    }

    // Render auth pages (Login/Register)
    static renderAuthPages() {
        return `
            <div style="min-height: 100vh; background: #0d1117; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden;">
                <!-- Background grid pattern -->
                <div style="position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(48,54,61,0.5) 1px, transparent 0); background-size: 40px 40px; pointer-events: none;"></div>
                <!-- Glow effects -->
                <div style="position: absolute; top: -20%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%); pointer-events: none;"></div>
                <div style="position: absolute; bottom: -20%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(192,132,252,0.06) 0%, transparent 70%); pointer-events: none;"></div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; max-width: 1050px; align-items: center; position: relative; z-index: 1;" class="auth-layout">
                    <!-- Brand Section — Code Snippet Style -->
                    <div>
                        <div style="margin-bottom: 32px;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                <div style="width: 48px; height: 48px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-car" style="font-size: 1.4rem; color: #4ade80;"></i>
                                </div>
                                <h1 style="font-size: 2rem; margin: 0; color: #e6edf3; font-family: 'JetBrains Mono', monospace;">DriveIndia</h1>
                            </div>
                            <p style="font-size: 1.05rem; color: #8b949e; margin: 0; line-height: 1.7;">India's developer-grade vehicle rental platform. Fast booking, transparent pricing, zero friction.</p>
                        </div>

                        <!-- Feature list -->
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #4ade80; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">&#10003;</span> <span style="color: #8b949e; font-size: 0.9rem;">Cars, bikes & scooters across 6+ cities</span></div>
                            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #4ade80; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">&#10003;</span> <span style="color: #8b949e; font-size: 0.9rem;">Transparent pricing with GST breakdown</span></div>
                            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #4ade80; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">&#10003;</span> <span style="color: #8b949e; font-size: 0.9rem;">Book in under 2 minutes, zero paperwork</span></div>
                            <div style="display: flex; align-items: center; gap: 10px;"><span style="color: #4ade80; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">&#10003;</span> <span style="color: #8b949e; font-size: 0.9rem;">24/7 roadside assistance & support</span></div>
                        </div>
                    </div>

                    <!-- Forms Section -->
                    <div id="authForms">
                        ${this.renderLoginForm()}
                    </div>
                </div>
            </div>
        `;
    }

    static renderLoginForm() {
        return `
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);">
                <!-- Terminal title bar -->
                <div style="background: #21262d; padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #30363d;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #f87171;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #fbbf24;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #4ade80;"></span>
                    <span style="color: #6e7681; margin-left: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">authenticate.sh</span>
                </div>

                <div style="padding: 32px;">
                    <h2 style="margin-top: 0; margin-bottom: 4px; color: #e6edf3; font-size: 1.4rem;">Welcome back</h2>
                    <p style="color: #6e7681; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 28px;">// sign in to your account</p>

                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">EMAIL_OR_PHONE</label>
                            <input type="text" id="loginEmail" name="email_or_phone" placeholder="user@example.com" required>
                        </div>

                        <div class="form-group">
                            <label for="loginPassword">PASSWORD</label>
                            <input type="password" id="loginPassword" name="password" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="btn btn-primary w-full" style="margin-bottom: 16px; justify-content: center; padding: 12px; font-family: 'JetBrains Mono', monospace;">
                            <i class="fas fa-terminal"></i> Login
                        </button>
                    </form>

                    <p style="text-align: center; color: #6e7681; font-size: 0.85rem;">
                        New user?
                        <button style="background: none; border: none; color: #58a6ff; cursor: pointer; font-size: 0.85rem; text-decoration: none; font-family: inherit;" id="switchToRegister">
                            Create account &rarr;
                        </button>
                    </p>
                    <p style="text-align: center; margin-top: 8px;">
                        <button style="background: none; border: none; color: #fb923c; cursor: pointer; font-size: 0.82rem; font-family: 'JetBrains Mono', monospace;" id="switchToForgot">
                            Forgot password?
                        </button>
                    </p>

                </div>
            </div>
        `;
    }

    static renderRegisterForm() {
        return `
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5); max-height: 80vh; overflow-y: auto;">
                <!-- Terminal title bar -->
                <div style="background: #21262d; padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #30363d; position: sticky; top: 0; z-index: 1;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #f87171;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #fbbf24;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #4ade80;"></span>
                    <span style="color: #6e7681; margin-left: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">register.sh</span>
                </div>

                <div style="padding: 32px;">
                    <h2 style="margin-top: 0; margin-bottom: 4px; color: #e6edf3; font-size: 1.4rem;">Create Account</h2>
                    <p style="color: #6e7681; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 24px;">// initialize your profile</p>

                    <form id="registerForm">
                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label for="registerFullName">FULL_NAME</label>
                                <input type="text" id="registerFullName" name="full_name" placeholder="John Doe" required>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="registerEmail">EMAIL</label>
                                <input type="email" id="registerEmail" name="email" placeholder="john@example.com" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label for="registerPhone">PHONE</label>
                                <input type="tel" id="registerPhone" name="phone" placeholder="9876543210" maxlength="10" required>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="registerCity">CITY</label>
                                <select id="registerCity" name="city" required>
                                    <option value="">Select City</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Bangalore">Bangalore</option>
                                    <option value="Pune">Pune</option>
                                    <option value="Hyderabad">Hyderabad</option>
                                    <option value="Chennai">Chennai</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label for="registerAadhaar">AADHAAR_NUMBER</label>
                                <input type="text" id="registerAadhaar" name="aadhaar_number" placeholder="12-digit Aadhaar" maxlength="12">
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="registerLicense">DRIVING_LICENSE</label>
                                <input type="text" id="registerLicense" name="driving_license" placeholder="License number" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label for="registerPassword">PASSWORD</label>
                                <input type="password" id="registerPassword" name="password" placeholder="Min 6 characters" required>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="registerConfirmPassword">CONFIRM_PASSWORD</label>
                                <input type="password" id="registerConfirmPassword" name="confirm_password" placeholder="Re-enter password" required>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-full" style="margin-bottom: 16px; justify-content: center; padding: 12px; font-family: 'JetBrains Mono', monospace;">
                            <i class="fas fa-terminal"></i> Create Account
                        </button>
                    </form>

                    <p style="text-align: center; color: #6e7681; font-size: 0.85rem;">
                        Already have an account?
                        <button style="background: none; border: none; color: #58a6ff; cursor: pointer; font-size: 0.85rem; font-family: inherit;" id="switchToLogin">
                            &larr; Back to login
                        </button>
                    </p>
                </div>
            </div>
        `;
    }

    static renderForgotPasswordForm() {
        return `
            <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.5);">
                <div style="background: #21262d; padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #30363d;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #f87171;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #fbbf24;"></span>
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: #4ade80;"></span>
                    <span style="color: #6e7681; margin-left: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">reset-password.sh</span>
                </div>

                <div style="padding: 32px;">
                    <h2 style="margin-top: 0; margin-bottom: 4px; color: #e6edf3; font-size: 1.4rem;">Reset Password</h2>
                    <p style="color: #6e7681; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 28px;">// verify identity with Aadhaar to reset</p>

                    <form id="forgotPasswordForm">
                        <div class="form-group">
                            <label for="forgotEmail">EMAIL</label>
                            <input type="email" id="forgotEmail" placeholder="Your registered email" required>
                        </div>
                        <div class="form-group">
                            <label for="forgotAadhaar">AADHAAR_NUMBER</label>
                            <input type="text" id="forgotAadhaar" placeholder="12-digit Aadhaar linked to account" maxlength="12" required>
                        </div>
                        <div class="form-group">
                            <label for="forgotNewPassword">NEW_PASSWORD</label>
                            <input type="password" id="forgotNewPassword" placeholder="Min 6 characters" required>
                        </div>

                        <button type="submit" class="btn btn-primary w-full" style="margin-bottom: 16px; justify-content: center; padding: 12px; font-family: 'JetBrains Mono', monospace;">
                            <i class="fas fa-key"></i> Reset Password
                        </button>
                    </form>

                    <p style="text-align: center; color: #6e7681; font-size: 0.85rem;">
                        Remember your password?
                        <button style="background: none; border: none; color: #58a6ff; cursor: pointer; font-size: 0.85rem; font-family: inherit;" id="switchToLogin">
                            &larr; Back to login
                        </button>
                    </p>
                </div>
            </div>
        `;
    }

    async handleLogin() {
        Spinner.show();
        try {
            const emailOrPhone = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const response = await api.auth.login(emailOrPhone, password);

            if (response.success) {
                // Save token
                api.setToken(response.data.token);

                // Save user
                storageUtils.setUserSession(response.data);

                Toast.success('Login successful!');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            Toast.error(error.message || 'Login failed');
        } finally {
            Spinner.hide();
        }
    }

    async handleForgotPassword() {
        Spinner.show();
        try {
            const email = document.getElementById('forgotEmail').value.trim();
            const aadhaar_number = document.getElementById('forgotAadhaar').value.trim();
            const new_password = document.getElementById('forgotNewPassword').value;

            if (!/^\d{12}$/.test(aadhaar_number)) {
                Toast.error('Enter a valid 12-digit Aadhaar number');
                Spinner.hide();
                return;
            }
            if (new_password.length < 6) {
                Toast.error('Password must be at least 6 characters');
                Spinner.hide();
                return;
            }

            const response = await api.auth.forgotPassword({ email, aadhaar_number, new_password });
            if (response.success) {
                Toast.success(response.message);
                document.getElementById('authForms').innerHTML = AuthModule.renderLoginForm();
            }
        } catch (error) {
            Toast.error(error.message || 'Password reset failed');
        } finally {
            Spinner.hide();
        }
    }

    async handleRegister() {
        Spinner.show();
        try {
            const formData = domUtils.getFormData(document.getElementById('registerForm'));

            // Validation
            if (!validateUtils.isValidEmail(formData.email)) {
                throw new Error('Invalid email format');
            }
            if (!validateUtils.isValidPhone(formData.phone)) {
                throw new Error('Invalid phone number');
            }
            if (formData.aadhaar_number && !validateUtils.isValidAadhaar(formData.aadhaar_number)) {
                throw new Error('Invalid Aadhaar number (must be 12 digits)');
            }
            if (!validateUtils.isValidLicense(formData.driving_license)) {
                throw new Error('Invalid driving license');
            }
            if (!validateUtils.isValidPassword(formData.password)) {
                throw new Error('Password must be at least 6 characters');
            }
            if (formData.password !== formData.confirm_password) {
                throw new Error('Passwords do not match');
            }

            const response = await api.auth.register(formData);

            if (response.success) {
                api.setToken(response.data.token);
                storageUtils.setUserSession(response.data);

                Toast.success('Registration successful!');
                
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            Toast.error(error.message || 'Registration failed');
        } finally {
            Spinner.hide();
        }
    }

    logout() {
        storageUtils.clearUserSession();
        window.location.reload();
    }

    isLoggedIn() {
        return storageUtils.isLoggedIn();
    }

    getUser() {
        return storageUtils.getUserSession();
    }
}

// Global auth instance
const auth = new AuthModule();

// Handle form switching
document.addEventListener('click', function(e) {
    if (e.target.id === 'switchToRegister') {
        document.getElementById('authForms').innerHTML = AuthModule.renderRegisterForm();
    } else if (e.target.id === 'switchToLogin') {
        document.getElementById('authForms').innerHTML = AuthModule.renderLoginForm();
    } else if (e.target.id === 'switchToForgot') {
        document.getElementById('authForms').innerHTML = AuthModule.renderForgotPasswordForm();
    }
});
