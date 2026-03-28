<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouConnect - The Future of Learning</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Inter"', 'sans-serif'],
                    },
                    colors: {
                        deep: '#000000',
                        accent: '#1D4ED8',
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #000000;
            margin: 0;
            overflow-x: hidden;
        }

        .bg-mesh {
            background-color: #000000;
            position: relative;
        }

        /* Interactive blue gradient glow */
        .interactive-glow {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            background: radial-gradient(800px circle at var(--x, 50%) var(--y, 50%), rgba(29, 78, 216, 0.25) 0%, rgba(0, 0, 0, 0) 80%);
            z-index: 0;
            transition: opacity 0.3s ease;
        }

        /* Ensure UI elements stay above the background glow */
        .content-layer {
            position: relative;
            z-index: 10;
        }

        .event-pill {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .text-main-gradient {
            background: linear-gradient(180deg, #FFFFFF 0%, #B4B4B4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Glassmorphism Cards */
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.3s ease;
        }

        .glass-card:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
        }

        /* Mock Code Block styling */
        .code-block {
            background: #0d0d0d;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body class="font-sans text-white antialiased">

<div class="bg-mesh min-h-screen">

    <div class="interactive-glow"></div>

    <div class="content-layer">
        <nav class="container mx-auto px-8 py-6 flex items-center justify-between">
            <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                     class="text-white">
                    <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor"
                          fill-opacity="0.9"/>
                </svg>
                <span>YouConnect</span>
            </div>

            <div class="hidden md:flex items-center gap-10 text-[15px] font-medium text-gray-300">
                <a href="#features" class="hover:text-white transition">Features</a>
                <a href="#community" class="hover:text-white transition">Community</a>
                <a href="#about" class="hover:text-white transition flex items-center gap-1">
                    About us
                    <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </a>
            </div>

            <div class="flex items-center gap-4">
                <button
                    class="px-6 py-2 rounded-full border border-white/20 text-[14px] font-medium hover:bg-white/5 transition">
                    Talk to an expert
                </button>
                <button
                    class="px-6 py-2 rounded-full bg-[#E8E8E8] text-black text-[14px] font-bold hover:bg-white transition shadow-lg">
                    Login
                </button>
            </div>
        </nav>

        <header class="container mx-auto px-6 pt-16 pb-0 text-center relative">
            <div class="inline-flex items-center event-pill px-6 py-2 rounded-full text-[14px] text-gray-300 mb-12">
                YouConnect Events are now available. Discover workshops, hackathons, and student activities
            </div>

            <h1 class="text-6xl md:text-[88px] font-bold leading-[1.05] tracking-tight mb-8 text-main-gradient">
                Learn Faster.<br>
                Share Knowledge.<br>
                Grow Together.
            </h1>

            <p class="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-normal leading-relaxed mb-12">
                YouConnect is a collaborative learning platform where students ask questions, share technical blogs, and
                collaborate with peers using AI-powered knowledge validation.
            </p>

            <div class="flex justify-center gap-5">
                <button
                    class="px-10 py-3.5 rounded-full bg-[#E8E8E8] text-black font-bold text-base hover:bg-white transition shadow-xl">
                    login
                </button>
                <button
                    class="px-10 py-3.5 rounded-full border border-white/30 font-bold text-base hover:bg-white/5 transition">
                    Talk to an expert
                </button>
            </div>

            <div class="mt-24 max-w-6xl mx-auto relative group mb-0">
                <div
                    class="absolute -top-20 left-1/2 -translate-x-1/2 w-2/3 h-64 bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div
                    class="relative rounded-3xl p-1 border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl overflow-hidden">
                    <img
                        src="{{ asset('images/dashboard.png') }}"
                            alt="Abstract UI Gradient Dashboard"
                        class="rounded-2xl w-full h-[500px] object-cover opacity-90">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/40 rounded-full"></div>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-white/20 rounded-full"></div>
                </div>
            </div>
        </header>

        <div class="container mx-auto px-6 py-12 flex flex-col items-center justify-center">
            <div class="relative group">
                <div
                    class="absolute -inset-10 bg-blue-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition duration-1000"></div>

                <div class="relative flex flex-col items-center">
                    <div class="flex items-baseline gap-0.5">
                        <span class="text-5xl md:text-6xl font-bold text-white tracking-tight">You</span>
                        <span class="text-5xl md:text-6xl font-bold text-blue-500 tracking-tight">Code</span>
                    </div>
                    <div class="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-semibold mt-2">
                        Powered by Simplon
                    </div>
                </div>
            </div>
        </div>

        <section id="features" class="container mx-auto px-6 py-16">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold mb-4 text-main-gradient">Features that<br>work for your
                    future.</h2>
                <p class="text-gray-400 text-lg">Check out our amazing features and experience the<br>power of
                    YouConnect for yourself.</p>
            </div>

            <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-card rounded-2xl p-8">
                    <div
                        class="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">Q&A Knowledge Hub</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">Ask questions and get answers. Collaborate with the
                        community to solve complex problems and learn together.</p>
                </div>

                <div class="glass-card rounded-2xl p-8">
                    <div
                        class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">AI Content Validation</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">Ensure high quality discussions. Our AI helps
                        moderate content to maintain a safe and productive learning space.</p>
                </div>

                <div class="glass-card rounded-2xl p-8">
                    <div
                        class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">Technical Blogs</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">Share your knowledge and tutorials. Write technical
                        blogs and articles to help others in the community.</p>
                </div>

                <div class="glass-card rounded-2xl p-8">
                    <div
                        class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-3">Gamified Reputation System</h3>
                    <p class="text-gray-400 text-sm leading-relaxed">Earn badges, level up, and gain recognition for
                        your contributions. Build your developer profile over time.</p>
                </div>
            </div>
        </section>

        <section class="container mx-auto px-6 py-8">
            <div
                class="max-w-5xl mx-auto glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
                <div class="w-full md:w-1/2">
                    <div
                        class="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Code collaboration</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-4">
                        Work together seamlessly. Review code snippets, provide feedback, and debug alongside your peers
                        in real-time. Our editor supports syntax highlighting and formatting.
                    </p>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        Whether you are tackling an assignment or building a side project, collaborate effortlessly and
                        improve your coding skills with instant community support.
                    </p>
                </div>

                <div class="w-full md:w-1/2">
                    <div
                        class="code-block rounded-xl p-6 font-mono text-xs md:text-sm shadow-2xl relative overflow-hidden">
                        <div class="flex gap-2 mb-4">
                            <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div class="text-gray-400 mb-2">/* User Profile Fetcher */</div>
                        <div>
                            <span class="text-pink-500">const</span> <span class="text-blue-400">getUserData</span>
                            <span class="text-pink-500">=</span> <span class="text-blue-400">async</span> (userId) <span
                                class="text-pink-500">=></span> {
                        </div>
                        <div class="pl-4">
                            <span class="text-pink-500">try</span> {
                        </div>
                        <div class="pl-8">
                            <span class="text-pink-500">const</span> response <span class="text-pink-500">=</span> <span
                                class="text-pink-500">await</span> <span class="text-yellow-200">fetch</span>(<span
                                class="text-green-400">`/api/users/${userId}`</span>);
                        </div>
                        <div class="pl-8">
                            <span class="text-pink-500">const</span> data <span class="text-pink-500">=</span> <span
                                class="text-pink-500">await</span> response.<span class="text-yellow-200">json</span>();
                        </div>
                        <div class="pl-8">
                            <span class="text-pink-500">return</span> data;
                        </div>
                        <div class="pl-4">
                            } <span class="text-pink-500">catch</span> (error) {
                        </div>
                        <div class="pl-8">
                            <span class="text-blue-400">console</span>.<span class="text-yellow-200">error</span>(<span
                                class="text-green-400">'Failed to fetch'</span>, error);
                        </div>
                        <div class="pl-4">
                            }
                        </div>
                        <div>};</div>
                    </div>
                </div>
            </div>
        </section>

        <section id="community" class="container mx-auto px-6 py-24">
            <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
                <div class="w-full md:w-1/2">
                    <h2 class="text-4xl md:text-5xl font-bold mb-6 text-main-gradient">Built for community-driven learning</h2>
                    <p class="text-gray-400 text-lg mb-8 leading-relaxed">
                        YouConnect isn't just a platform; it's a living ecosystem of developers helping developers. Engage with thousands of students across campuses.
                    </p>
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span class="text-gray-300">Join discussions with peers</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-pink-500"></div>
                            <span class="text-gray-300">Connect with students across campuses</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span class="text-gray-300">Learn together in a supportive environment</span>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-1/2 grid grid-cols-2 gap-4">
                    <div class="glass-card p-6 rounded-2xl text-center">
                        <div class="text-3xl font-bold text-blue-400">3000+</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest mt-2">Students</div>
                    </div>
                    <div class="glass-card p-6 rounded-2xl text-center">
                        <div class="text-3xl font-bold text-pink-400">5000+</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest mt-2">Questions</div>
                    </div>
                    <div class="glass-card p-6 rounded-2xl text-center">
                        <div class="text-3xl font-bold text-purple-400">1200+</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest mt-2">Blogs</div>
                    </div>
                    <div class="glass-card p-6 rounded-2xl text-center">
                        <div class="text-3xl font-bold text-indigo-400">50+</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest mt-2">Mentors</div>
                    </div>
                </div>
            </div>
        </section>

        <section id="about" class="container mx-auto px-6 py-24 border-t border-white/5">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-4 text-main-gradient">About YouConnect</h2>
                <p class="max-w-3xl mx-auto text-gray-400 text-lg">
                    YouConnect is a collaborative learning platform for YouCode students that centralizes technical questions, blogs, collaboration, and AI-assisted learning in one place.
                </p>
            </div>
            <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="glass-card p-8 rounded-2xl border-t-2 border-blue-500/20">
                    <div class="text-blue-400 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Collaboration</h3>
                    <p class="text-sm text-gray-500">Breaking barriers between students to foster peer-to-peer growth.</p>
                </div>
                <div class="glass-card p-8 rounded-2xl border-t-2 border-pink-500/20">
                    <div class="text-pink-400 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Innovation</h3>
                    <p class="text-sm text-gray-500">Using AI to validate knowledge and provide smart learning insights.</p>
                </div>
                <div class="glass-card p-8 rounded-2xl border-t-2 border-purple-500/20">
                    <div class="text-purple-400 mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Growth</h3>
                    <p class="text-sm text-gray-500">Building profiles and tracking progress to ensure career success.</p>
                </div>
            </div>
        </section>

        <section class="container mx-auto px-6 py-16">
            <div class="max-w-5xl mx-auto glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full"></div>
                <h2 class="text-3xl font-bold mb-4 relative z-10">Smart Learning Insights for<br>YouCode Students</h2>
                <p class="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed mb-8 relative z-10">
                    Unlock the power of detailed analytics integrated with your student portal. Track your progress,
                    understand your learning patterns through insights on topics, and connect effortlessly with peers.
                    With our data-driven algorithms and visual dashboards, you can discover a personalized and tailored
                    learning journey every time.
                </p>
                <button
                    class="px-8 py-3 rounded-full border border-white/20 text-[14px] font-medium hover:bg-white/10 transition relative z-10">
                    Get Started
                </button>
            </div>
        </section>

        <footer class="container mx-auto px-6 pt-16 pb-8 border-t border-white/10 mt-12">
            <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div>
                    <h4 class="text-white font-semibold mb-4 text-sm">Contact</h4>
                    <ul class="space-y-2 text-gray-500 text-xs">
                        <li><a href="#" class="hover:text-white transition">support@youconnect.app</a></li>
                        <li><a href="#" class="hover:text-white transition">business@youconnect.app</a></li>
                        <li><a href="#" class="hover:text-white transition">press@youconnect.app</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-white font-semibold mb-4 text-sm">Careers</h4>
                    <p class="text-gray-500 text-xs leading-relaxed pr-4">
                        We're always looking for talented developers, designers, and learning specialists to join our
                        team.
                    </p>
                    <a href="#" class="text-blue-400 text-xs mt-2 inline-block hover:underline">View open positions</a>
                </div>

                <div>
                    <h4 class="text-white font-semibold mb-4 text-sm">Address</h4>
                    <p class="text-gray-500 text-xs leading-relaxed">
                        Innovation Park<br>
                        Building 4, Floor 2<br>
                        Tech District
                    </p>
                </div>

                <div>
                    <h4 class="text-white font-semibold mb-4 text-sm">Social</h4>
                    <ul class="space-y-2 text-gray-500 text-xs">
                        <li><a href="#" class="hover:text-white transition">Twitter</a></li>
                        <li><a href="#" class="hover:text-white transition">Instagram</a></li>
                        <li><a href="#" class="hover:text-white transition">GitHub</a></li>
                    </ul>
                </div>
            </div>

            <div
                class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-gray-500">
                <div class="mb-4 md:mb-0">
                    &copy; 2024 YouConnect Platform. All rights reserved.
                </div>
                <div class="flex items-center gap-6">
                    <a href="#" class="hover:text-white transition">Privacy Policy</a>
                    <a href="#" class="hover:text-white transition">Terms of Service</a>
                    <div class="flex items-center gap-1 font-bold text-white text-sm ml-4">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor"/>
                        </svg>
                        YouConnect
                    </div>
                </div>
            </div>
        </footer>
    </div>
</div>

<script>
    document.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.interactive-glow');
        if (glow) {
            glow.style.setProperty('--x', `${e.clientX}px`);
            glow.style.setProperty('--y', `${e.clientY}px`);
        }
    });
</script>

</body>
</html>
